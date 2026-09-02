"use client";

import { useEffect, useMemo, useState } from "react";

type RosObject = {
  id: string;
  objectType: string;
  name: string;
  status: string;
  health: string;
  nextAction?: string | null;
  data?: Record<string, unknown> | null;
  events?: Array<{ id: string; eventType: string; summary: string; createdAt: string }>;
  sourceLinks?: Array<{ id: string; relationshipType: string; targetObject: RosObject }>;
  targetLinks?: Array<{ id: string; relationshipType: string; sourceObject: RosObject }>;
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt?: string | null;
};

type ListingForm = {
  propertyAddress: string;
  sellerNames: string;
  targetListDate: string;
  listingAgreementStatus: "signed" | "pending" | "not_yet";
  listPrice: string;
  occupancyStatus: string;
  sellerContactPermission: string;
  mediaPreference: string;
  signLockboxNeeded: string;
  openHousePlan: string;
  marketingRequested: boolean;
  specialInstructions: string;
};

type OfferForm = {
  buyerNames: string;
  buyerAgent: string;
  closingDate: string;
  closingCompany: string;
  contractNotes: string;
};

const blankListing: ListingForm = {
  propertyAddress: "",
  sellerNames: "",
  targetListDate: "",
  listingAgreementStatus: "signed",
  listPrice: "",
  occupancyStatus: "occupied",
  sellerContactPermission: "coordinate_through_agent",
  mediaPreference: "koinonia_coordinate",
  signLockboxNeeded: "yes",
  openHousePlan: "maybe",
  marketingRequested: true,
  specialInstructions: ""
};

const blankOffer: OfferForm = {
  buyerNames: "",
  buyerAgent: "",
  closingDate: "",
  closingCompany: "",
  contractNotes: ""
};

function value(data: Record<string, unknown> | null | undefined, key: string) {
  const item = data?.[key];
  return typeof item === "string" && item.trim() ? item : "—";
}

export function ListingsMvp() {
  const [listings, setListings] = useState<RosObject[]>([]);
  const [selected, setSelected] = useState<RosObject | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState("");
  const [listingForm, setListingForm] = useState<ListingForm>(blankListing);
  const [offerForm, setOfferForm] = useState<OfferForm>(blankOffer);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return listings;
    return listings.filter((listing) =>
      [listing.name, listing.status, listing.health, listing.nextAction ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [listings, search]);

  const linkedTransaction = selected?.sourceLinks?.find(
    (link) => link.relationshipType === "converted_to_transaction"
  )?.targetObject;

  async function loadListings(preferredId?: string) {
    setError("");
    try {
      const response = await fetch("/api/koinonia/listings");
      if (!response.ok) throw new Error("Failed to load listings.");
      const data = await response.json();
      const nextListings = data.listings ?? [];
      setListings(nextListings);

      const id = preferredId ?? selected?.id ?? nextListings[0]?.id;
      if (id) await loadListing(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function loadListing(id: string) {
    setError("");
    try {
      const [objectResponse, taskResponse] = await Promise.all([
        fetch(`/api/objects/${id}`),
        fetch(`/api/tasks?relatedObjectId=${id}`)
      ]);

      if (!objectResponse.ok) throw new Error("Failed to load listing detail.");
      const objectData = await objectResponse.json();
      setSelected(objectData.object);

      if (taskResponse.ok) {
        const taskData = await taskResponse.json();
        setTasks(taskData.tasks ?? []);
      } else {
        setTasks([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    }
  }

  async function createListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/koinonia/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listingForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create listing engagement.");

      setListingForm(blankListing);
      setNotice("Listing received. Koinonia launch tasks are ready.");
      await loadListings(data.listing.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handoffAcceptedOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/koinonia/listings/${selected.id}/accepted-offer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to create transaction handoff.");

      setOfferForm(blankOffer);
      setNotice(
        data.existing
          ? "This listing was already handed off to Transaction Management."
          : "Accepted offer handed off. The Transaction file is now open."
      );
      await loadListings(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    void loadListings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openTasks = tasks.filter((task) => task.status !== "Complete");

  return (
    <main className="ros-app">
      <aside className="ros-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">K</div>
          <div>
            <strong>Koinonia</strong>
            <span>Listing Operations</span>
          </div>
        </div>
        <nav>
          <a href="/">Dashboard</a>
          <a href="/crm">CRM</a>
          <a href="/listings" className="active">Listings</a>
          <a href="/transactions">Transactions</a>
          <a href="/operations">Operations</a>
          <a href="/objects">Object Explorer</a>
        </nav>
      </aside>

      <section className="ros-main">
        <header className="ros-topbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search listings, sellers, status..."
          />
          <button onClick={() => void loadListings()}>Refresh</button>
          <a className="ros-button-link" href="#new-listing">+ New Listing</a>
        </header>

        <div className="ros-eyebrow">Hand Us the Listing · Production Backbone</div>
        <h1>Listing Center</h1>
        <p className="ros-subtitle">
          One operational record from seller intake through launch, marketing, field support,
          accepted-offer handoff, and transaction management.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}
        {notice ? <div className="ros-panel"><strong>{notice}</strong></div> : null}

        <section className="ros-grid" style={{ marginBottom: 18 }}>
          <article className="ros-card">
            <span>Listings</span>
            <strong>{listings.length}</strong>
            <p>active engagement records</p>
          </article>
          <article className="ros-card">
            <span>Active</span>
            <strong>{listings.filter((item) => item.status === "Active").length}</strong>
            <p>currently on market</p>
          </article>
          <article className="ros-card">
            <span>Under Contract</span>
            <strong>{listings.filter((item) => item.status === "Under Contract").length}</strong>
            <p>handed to transaction management</p>
          </article>
          <article className="ros-card">
            <span>Open Tasks</span>
            <strong>{openTasks.length}</strong>
            <p>for selected listing</p>
          </article>
        </section>

        <section className="ros-object-layout">
          <div>
            <article className="ros-card" id="new-listing">
              <h2>New Listing — Hand It to Koinonia</h2>
              <p>Start with the essentials. The launch team can collect the rest through the work queue.</p>
              <form className="ros-form" onSubmit={createListing}>
                <input
                  required
                  value={listingForm.propertyAddress}
                  onChange={(event) => setListingForm({ ...listingForm, propertyAddress: event.target.value })}
                  placeholder="Property address"
                />
                <input
                  required
                  value={listingForm.sellerNames}
                  onChange={(event) => setListingForm({ ...listingForm, sellerNames: event.target.value })}
                  placeholder="Seller name(s)"
                />
                <label>
                  Target list date
                  <input
                    type="date"
                    value={listingForm.targetListDate}
                    onChange={(event) => setListingForm({ ...listingForm, targetListDate: event.target.value })}
                  />
                </label>
                <select
                  value={listingForm.listingAgreementStatus}
                  onChange={(event) => setListingForm({ ...listingForm, listingAgreementStatus: event.target.value as ListingForm["listingAgreementStatus"] })}
                >
                  <option value="signed">Listing agreement signed</option>
                  <option value="pending">Listing agreement pending</option>
                  <option value="not_yet">Not signed yet</option>
                </select>
                <input
                  value={listingForm.listPrice}
                  onChange={(event) => setListingForm({ ...listingForm, listPrice: event.target.value })}
                  placeholder="List price (if final)"
                />
                <select
                  value={listingForm.occupancyStatus}
                  onChange={(event) => setListingForm({ ...listingForm, occupancyStatus: event.target.value })}
                >
                  <option value="occupied">Occupied</option>
                  <option value="vacant">Vacant</option>
                  <option value="tenant_occupied">Tenant occupied</option>
                  <option value="unknown">Not sure yet</option>
                </select>
                <select
                  value={listingForm.mediaPreference}
                  onChange={(event) => setListingForm({ ...listingForm, mediaPreference: event.target.value })}
                >
                  <option value="koinonia_coordinate">Koinonia coordinate media</option>
                  <option value="agent_vendor">I have a preferred media vendor</option>
                  <option value="already_complete">Media already complete</option>
                </select>
                <select
                  value={listingForm.signLockboxNeeded}
                  onChange={(event) => setListingForm({ ...listingForm, signLockboxNeeded: event.target.value })}
                >
                  <option value="yes">Sign / lockbox help needed</option>
                  <option value="no">No sign / lockbox help</option>
                  <option value="unknown">Not sure yet</option>
                </select>
                <select
                  value={listingForm.openHousePlan}
                  onChange={(event) => setListingForm({ ...listingForm, openHousePlan: event.target.value })}
                >
                  <option value="yes">Open house planned</option>
                  <option value="maybe">Maybe / help me plan it</option>
                  <option value="no">No open house planned</option>
                </select>
                <label>
                  <input
                    type="checkbox"
                    checked={listingForm.marketingRequested}
                    onChange={(event) => setListingForm({ ...listingForm, marketingRequested: event.target.checked })}
                  />{" "}
                  Create the listing marketing workstream
                </label>
                <textarea
                  value={listingForm.specialInstructions}
                  onChange={(event) => setListingForm({ ...listingForm, specialInstructions: event.target.value })}
                  placeholder="Anything Koinonia should know about the seller, property, access, launch, or marketing?"
                  rows={4}
                />
                <button disabled={isSaving}>{isSaving ? "Creating..." : "Hand It to Koinonia"}</button>
              </form>
            </article>

            <article className="ros-card" style={{ marginTop: 18 }}>
              <h2>Listing Queue</h2>
              {filtered.length === 0 ? <p>No listing engagements yet.</p> : null}
              <table className="ros-table">
                <thead>
                  <tr>
                    <th>Listing</th>
                    <th>Status</th>
                    <th>Health</th>
                    <th>Next Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((listing) => (
                    <tr key={listing.id} onClick={() => void loadListing(listing.id)}>
                      <td><strong>{listing.name}</strong><span>{listing.id}</span></td>
                      <td>{listing.status}</td>
                      <td>{listing.health}</td>
                      <td>{listing.nextAction ?? "None"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>

          <aside className="ros-card">
            <h2>Listing Detail</h2>
            {!selected ? (
              <p>Select a listing.</p>
            ) : (
              <>
                <p><strong>{selected.name}</strong></p>
                <p><b>Status:</b> {selected.status}</p>
                <p><b>Next action:</b> {selected.nextAction ?? "None"}</p>
                <p><b>Target list date:</b> {value(selected.data, "targetListDate")}</p>
                <p><b>List price:</b> {value(selected.data, "listPrice")}</p>
                <p><b>Media:</b> {value(selected.data, "mediaPreference")}</p>
                <p><b>Open house:</b> {value(selected.data, "openHousePlan")}</p>

                <h3>Launch Tasks</h3>
                {tasks.length === 0 ? <p>No listing tasks yet.</p> : (
                  <ul>
                    {tasks.map((task) => (
                      <li key={task.id}><strong>{task.priority}</strong> · {task.title} · {task.status}</li>
                    ))}
                  </ul>
                )}

                <h3>Accepted Offer</h3>
                {linkedTransaction ? (
                  <div>
                    <p>This listing is linked to <strong>{linkedTransaction.name}</strong>.</p>
                    <a className="ros-button-link" href="/transactions">Open Transaction Center</a>
                  </div>
                ) : (
                  <form className="ros-form" onSubmit={handoffAcceptedOffer}>
                    <input value={offerForm.buyerNames} onChange={(event) => setOfferForm({ ...offerForm, buyerNames: event.target.value })} placeholder="Buyer name(s)" />
                    <input value={offerForm.buyerAgent} onChange={(event) => setOfferForm({ ...offerForm, buyerAgent: event.target.value })} placeholder="Buyer agent" />
                    <label>
                      Closing date
                      <input type="date" value={offerForm.closingDate} onChange={(event) => setOfferForm({ ...offerForm, closingDate: event.target.value })} />
                    </label>
                    <input value={offerForm.closingCompany} onChange={(event) => setOfferForm({ ...offerForm, closingCompany: event.target.value })} placeholder="Title / closing company" />
                    <textarea value={offerForm.contractNotes} onChange={(event) => setOfferForm({ ...offerForm, contractNotes: event.target.value })} placeholder="Contract handoff notes" rows={3} />
                    <button disabled={isSaving}>{isSaving ? "Opening..." : "Open Transaction from Accepted Offer"}</button>
                  </form>
                )}

                <h3>Timeline</h3>
                {selected.events?.length ? (
                  <ul>
                    {selected.events.map((event) => (
                      <li key={event.id}><strong>{event.eventType}</strong>: {event.summary}</li>
                    ))}
                  </ul>
                ) : <p>No timeline events yet.</p>}
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
