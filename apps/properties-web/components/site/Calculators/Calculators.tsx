"use client";

import { useId, useState } from "react";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

function toNumber(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function Field({
  label,
  value,
  onChange,
  hint,
  suffix
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  suffix?: string;
}) {
  const id = useId();
  return (
    <label className="properties-calc-field" htmlFor={id}>
      <span>{label}</span>
      <span className="properties-calc-input">
        {suffix ? null : <span aria-hidden="true">$</span>}
        <input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {suffix ? <span aria-hidden="true">{suffix}</span> : null}
      </span>
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

/** "Can rent cover my mortgage?" — used on /home-not-selling. */
export function MortgageCoverageCalculator() {
  const [rent, setRent] = useState("3000");
  const [mortgage, setMortgage] = useState("3400");
  const [hoa, setHoa] = useState("100");
  const [reserve, setReserve] = useState("5");
  const [plan, setPlan] = useState<"full" | "involved">("full");

  const rentValue = toNumber(rent);
  const rate = plan === "full" ? 0.1 : 0.08;
  const management = rentValue * rate;
  const repairs = rentValue * (toNumber(reserve) / 100);
  const costs = toNumber(mortgage) + toNumber(hoa) + management + repairs;
  const net = rentValue - costs;
  const yearly = net * 12;

  return (
    <div className="properties-calc">
      <div className="properties-calc-inputs">
        <Field label="Expected monthly rent" value={rent} onChange={setRent} hint="Not sure? Get a free estimate on our rental analysis page." />
        <Field label="Monthly mortgage payment" value={mortgage} onChange={setMortgage} hint="Include principal, interest, taxes and insurance." />
        <Field label="Monthly HOA dues" value={hoa} onChange={setHoa} />
        <Field label="Repair reserve" value={reserve} onChange={setReserve} suffix="% of rent" hint="Many owners set aside 5–10%." />
        <fieldset className="properties-calc-plan">
          <legend>Management plan</legend>
          <label>
            <input type="radio" name="plan" checked={plan === "full"} onChange={() => setPlan("full")} /> Managed for You (10%)
          </label>
          <label>
            <input type="radio" name="plan" checked={plan === "involved"} onChange={() => setPlan("involved")} /> Managed With You (8%)
          </label>
        </fieldset>
      </div>

      <div className="properties-calc-result" aria-live="polite">
        <dl>
          <div><dt>Rent</dt><dd>{money.format(rentValue)}</dd></div>
          <div><dt>Mortgage, HOA and repairs</dt><dd>−{money.format(toNumber(mortgage) + toNumber(hoa) + repairs)}</dd></div>
          <div><dt>Management fee</dt><dd>−{money.format(management)}</dd></div>
        </dl>
        <p className={net >= 0 ? "properties-calc-net positive" : "properties-calc-net negative"}>
          <span>{net >= 0 ? "Estimated monthly surplus" : "Estimated monthly shortfall"}</span>
          <strong>{money.format(Math.abs(net))}</strong>
          <small>{money.format(Math.abs(yearly))} per year</small>
        </p>
        <p className="properties-calc-note">
          {net >= 0
            ? "Rent may cover your costs while you wait for a better time to sell."
            : "Rent may not fully cover your costs. A smaller shortfall can still cost less than a price cut, a second mortgage payment or months of carrying a vacant home. We'll walk through the numbers with you honestly."}
        </p>
        <p className="properties-calc-disclaimer">
          Estimate only. Placement, vacancy and one-time costs are not included. Not financial or tax advice.
        </p>
      </div>
    </div>
  );
}

/** First-year cost comparison for both plans — used on /pricing. */
export function FirstYearCostCalculator() {
  const [rent, setRent] = useState("2800");
  const rentValue = toNumber(rent);
  const placement = rentValue * 0.5;

  const rows = [
    { name: "Managed for You (10%)", rate: 0.1 },
    { name: "Managed With You (8%)", rate: 0.08 }
  ].map((plan) => ({
    ...plan,
    monthly: rentValue * plan.rate,
    yearOne: rentValue * plan.rate * 12 + placement,
    yearTwo: rentValue * plan.rate * 12 + 199
  }));

  return (
    <div className="properties-calc">
      <div className="properties-calc-inputs">
        <Field label="Monthly rent" value={rent} onChange={setRent} />
        <p className="properties-calc-note">
          Year 1 includes the placement fee (50% of one month&apos;s rent). Year 2 assumes the same tenant renews ($199).
          Repairs, the 10% coordination charge on vendor work and optional inspections are not included.
        </p>
      </div>
      <div className="properties-table-wrap">
        <table className="properties-table">
          <caption className="properties-visually-hidden">First-year cost by plan</caption>
          <thead>
            <tr>
              <th scope="col">Plan</th>
              <th scope="col">Monthly fee</th>
              <th scope="col">Year 1 total</th>
              <th scope="col">Year 2 total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <th scope="row">{row.name}</th>
                <td>{money.format(row.monthly)}</td>
                <td>{money.format(row.yearOne)}</td>
                <td>{money.format(row.yearTwo)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
