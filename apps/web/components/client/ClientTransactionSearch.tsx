"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SearchTransaction = {
  id: string;
  propertyAddress: string;
  clientName: string;
  status: string;
  side: "Buyer" | "Seller";
};

type Props = {
  transactions: SearchTransaction[];
  initialQuery: string;
  filter: "active" | "closing" | "closed";
};

export function ClientTransactionSearch({ transactions, initialQuery, filter }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const suggestions = useMemo(() => rankSuggestions(transactions, query).slice(0, 6), [transactions, query]);
  const showSuggestions = focused && query.trim().length > 0;

  function submitSearch() {
    const trimmed = query.trim();
    const params = new URLSearchParams({ filter });
    if (trimmed) params.set("q", trimmed);
    router.push(`/client/dashboard?${params.toString()}`);
  }

  function openSuggestion(index: number) {
    const suggestion = suggestions[index];
    if (!suggestion) return;
    router.push(`/client/work/${suggestion.id}`);
  }

  return (
    <div className="koinonia-client-live-search">
      <form
        action="/client/dashboard"
        method="get"
        className="koinonia-client-dashboard-search koinonia-client-dashboard-search-modern"
        onSubmit={(event) => {
          event.preventDefault();
          if (activeIndex >= 0 && suggestions[activeIndex]) {
            openSuggestion(activeIndex);
            return;
          }
          submitSearch();
        }}
      >
        <label className="koinonia-client-dashboard-search-field">
          <span className="koinonia-sr-only">Search transactions</span>
          <input
            type="search"
            name="q"
            value={query}
            autoComplete="off"
            placeholder="Search property or client"
            aria-autocomplete="list"
            aria-expanded={showSuggestions}
            aria-controls="transaction-search-suggestions"
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={(event) => {
              if (!showSuggestions) return;
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActiveIndex((current) => Math.min(current + 1, suggestions.length - 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((current) => Math.max(current - 1, -1));
              } else if (event.key === "Escape") {
                setFocused(false);
              }
            }}
          />
        </label>
        <input type="hidden" name="filter" value={filter} />
      </form>

      {showSuggestions ? (
        <div id="transaction-search-suggestions" className="koinonia-client-search-suggestions" role="listbox">
          {suggestions.length ? (
            suggestions.map((transaction, index) => (
              <button
                type="button"
                role="option"
                aria-selected={activeIndex === index}
                className={activeIndex === index ? "is-active" : undefined}
                key={transaction.id}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => openSuggestion(index)}
              >
                <span>
                  <strong>{transaction.propertyAddress}</strong>
                  <small>{transaction.clientName}</small>
                </span>
                <em>{transaction.side} · {humanizeStatus(transaction.status)}</em>
              </button>
            ))
          ) : (
            <div className="koinonia-client-search-empty">No matching transactions</div>
          )}

          {suggestions.length ? (
            <button
              type="button"
              className="koinonia-client-search-all"
              onMouseDown={(event) => event.preventDefault()}
              onClick={submitSearch}
            >
              See all results for “{query.trim()}”
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function rankSuggestions(transactions: SearchTransaction[], query: string): SearchTransaction[] {
  const needle = normalize(query);
  if (!needle) return [];

  return transactions
    .map((transaction) => {
      const address = normalize(transaction.propertyAddress);
      const client = normalize(transaction.clientName);
      const combined = `${address} ${client}`;
      let score = 0;

      if (address.startsWith(needle)) score += 100;
      else if (address.includes(needle)) score += 70;
      if (client.startsWith(needle)) score += 85;
      else if (client.includes(needle)) score += 60;
      if (combined.includes(needle)) score += 10;

      return { transaction, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.transaction);
}

function normalize(value: string): string {
  return value.toLocaleLowerCase("en-US").trim().replace(/\s+/g, " ");
}

function humanizeStatus(value: string): string {
  const normalized = value.toLocaleLowerCase("en-US");
  if (normalized.includes("closed") || normalized.includes("complete")) return "Closed";
  if (normalized.includes("processing") || normalized.includes("intake")) return "Setting up";
  if (normalized.includes("waiting") || normalized.includes("needs") || normalized.includes("review")) return "In progress";
  return value;
}
