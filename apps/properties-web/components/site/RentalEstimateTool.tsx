"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Script from "next/script";

type Estimate = {
  ok: true; address: string; rent: number; low: number | null; high: number | null;
  property: { type: string | null; bedrooms: number | null; bathrooms: number | null; squareFootage: number | null };
  comparables: { address: string; rent: number; distance: number | null; status: string | null; bedrooms: number | null; bathrooms: number | null }[];
};
type TurnstileClient = { render:(el:HTMLElement, options:{sitekey:string;theme:"auto"})=>string|undefined; reset:(id:string)=>void; remove:(id:string)=>void };
const money = (n:number) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(n);
function turnstile() { return (window as Window & {turnstile?:TurnstileClient}).turnstile; }

export function RentalEstimateTool() {
  const [address,setAddress]=useState("");
  const [state,setState]=useState<"idle"|"loading"|"error"|"success">("idle");
  const [error,setError]=useState("");
  const [result,setResult]=useState<Estimate|null>(null);
  const container=useRef<HTMLDivElement>(null);
  const widget=useRef<string|null>(null);
  const available=process.env.NEXT_PUBLIC_PROPERTIES_RENTCAST_ENABLED==="true" && Boolean(process.env.NEXT_PUBLIC_PROPERTIES_TURNSTILE_SITE_KEY);
  useEffect(()=>{
    if(!available)return;
    const render=()=>{
      const api=turnstile(); const sitekey=process.env.NEXT_PUBLIC_PROPERTIES_TURNSTILE_SITE_KEY;
      if(api && sitekey && container.current && !widget.current) widget.current=api.render(container.current,{sitekey,theme:"auto"})??null;
    };
    render();
    const interval=window.setInterval(render,500);
    return ()=>{window.clearInterval(interval);if(widget.current){turnstile()?.remove(widget.current);widget.current=null;}};
  },[available]);

  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(state==="loading")return;
    const form=new FormData(e.currentTarget);
    const token=String(form.get("cf-turnstile-response")??"");
    if(!token){setState("error");setError("Please complete the verification.");return;}
    setState("loading");setError("");setResult(null);
    try{
      const response=await fetch("/api/rental-estimate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({address,turnstileToken:token})});
      const data=await response.json() as Estimate & {message?:string};
      if(!response.ok || !data.ok)throw Error(data.message||"Rental estimate unavailable.");
      setResult(data);setState("success");
    }catch(ex){setError(ex instanceof Error?ex.message:"Please try again.");setState("error");}
    finally{if(widget.current)turnstile()?.reset(widget.current);}
  }
  if(!available) return <p className="koinonia-copy">Automated estimates are being prepared. You can request a personalized rental assessment using the inquiry form below.</p>;
  return <div className="properties-lead-form">
    <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive"/>
    <h3>Find your estimated monthly rent</h3>
    <p>Enter a complete U.S. street address, including city, state and ZIP code. No contact information required.</p>
    <form onSubmit={submit}>
      <label>Property address <span aria-hidden="true">*</span><input autoComplete="street-address" name="property" value={address} onChange={e=>setAddress(e.target.value)} placeholder="123 Main St, Parker, CO 80134" minLength={12} maxLength={220} required/></label>
      <div ref={container}/>
      <button type="submit" disabled={state==="loading"} className="koinonia-button primary">{state==="loading"?"Checking rental market...":"See My Rental Estimate"}</button>
    </form>
    {state==="error"&&<p role="alert" className="properties-lead-error">{error}</p>}
    {result&&<section aria-live="polite" style={{marginTop:24}}>
      <p className="koinonia-eyebrow">Automated rental market estimate</p>
      <h3>{result.address}</h3>
      <p style={{fontSize:"2rem",fontWeight:700,margin:"10px 0"}}>{money(result.rent)} <span style={{fontSize:".85rem",fontWeight:400}}>per month</span></p>
      {result.low!==null&&result.high!==null&&<p>Estimated range: <strong>{money(result.low)} – {money(result.high)}/month</strong></p>}
      <p>{[result.property.type,result.property.bedrooms!==null?`${result.property.bedrooms} beds`:null,result.property.bathrooms!==null?`${result.property.bathrooms} baths`:null,result.property.squareFootage!==null?`${result.property.squareFootage.toLocaleString()} sq ft`:null].filter(Boolean).join(" · ")}</p>
      <h3>Rental income after management fees</h3>
      <p>Managed With You (8%): fee <strong>{money(result.rent*0.08)}/month</strong>; rent after management fee <strong>{money(result.rent*0.92)}/month</strong></p>
      <p>Managed for You (10%): fee <strong>{money(result.rent*0.10)}/month</strong>; rent after management fee <strong>{money(result.rent*0.90)}/month</strong></p>
      <p>Potential annual gross scheduled rent: <strong>{money(result.rent*12)}</strong> (before vacancy, management, leasing, repairs, taxes, insurance and other costs).</p>
      <p>These after-management figures are not net profit and exclude vacancy, leasing, renewals, maintenance, mortgage, property taxes, insurance and other expenses.</p>
      <h3>Nearby rental comparisons</h3>
      {result.comparables.length ? <div style={{overflowX:"auto"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr><th style={{textAlign:"left",padding:8}}>Property</th><th style={{textAlign:"right",padding:8}}>Rent / month</th><th style={{textAlign:"right",padding:8}}>Distance</th></tr></thead>
          <tbody>{result.comparables.map((c,i)=><tr key={i}>
            <td style={{padding:8,borderTop:"1px solid #ddd"}}>{c.address}<div style={{fontSize:".8rem",opacity:.75}}>{[c.bedrooms!==null?c.bedrooms+" beds":null,c.bathrooms!==null?c.bathrooms+" baths":null,c.status].filter(Boolean).join(" · ")}</div></td>
            <td style={{padding:8,borderTop:"1px solid #ddd",textAlign:"right",whiteSpace:"nowrap"}}>{money(c.rent)}</td>
            <td style={{padding:8,borderTop:"1px solid #ddd",textAlign:"right",whiteSpace:"nowrap"}}>{c.distance!==null?c.distance.toFixed(1)+" mi":"—"}</td>
          </tr>)}</tbody>
        </table>
      </div> : <p>Not enough comparable listings were returned. Our team can provide a personalized market review.</p>}
      <p className="properties-lead-privacy">Source: RentCast automated rent estimate and rental listing comparables. These figures are estimates, not guaranteed rents, and do not account for property condition, lease restrictions or all expenses. For multi-family properties, estimates may be per unit.</p>
      <a className="koinonia-button primary" href="#rental-inquiry">Request a personalized rental assessment</a>
    </section>}
  </div>;
}
