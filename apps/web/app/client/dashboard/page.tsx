import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { ClientTransactionQuickActions } from "../../../components/client/ClientTransactionQuickActions";
import { ClientTransactionSearch } from "../../../components/client/ClientTransactionSearch";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Transactions | Koinonia",
  description: "Your Koinonia transactions, attention items, documents, and closing progress.",
  alternates: { canonical: absoluteUrl("/client/dashboard") },
  robots: { index: false, follow: false }
};

type DashboardFilter = "active" | "closing" | "closed";
type DashboardTransaction = {
  clientName: string;
  closingDate: string | null;
  health: string;
  id: string;
  inboundEmail: string | null;
  name: string;
  nextAction: string | null;
  propertyAddress: string;
  side: "Buyer" | "Seller";
  status: string;
};
type DashboardView = { attention: DashboardTransaction[]; notice?: string; transactions: DashboardTransaction[] };
type PageProps = { searchParams?: Promise<Record<string, string | string[] | undefined>> };

export default async function ClientDashboardPage({ searchParams }: PageProps) {
  const actor = await requirePortalPermission("client-portal:view", "/client/dashboard");
  const params = (await searchParams) ?? {};
  const filter = getDashboardFilter(params.filter);
  const search = getStringParam(params.q);
  const view = await getDashboardView(actor.workspaceId, actor.id);
  const visibleTransactions = filterTransactions(view.transactions, filter, search);
  const activeCount = view.transactions.filter((transaction) => !isClosed(transaction)).length;

  return (
    <main className="koinonia-site koinonia-client-dashboard koinonia-client-dashboard-modern">
      <Header />

      <section className="koinonia-section koinonia-client-dashboard-hero koinonia-client-dashboard-hero-modern">
        <div className="koinonia-container">
          <div className="koinonia-client-dashboard-topline">
            <div>
              <p className="koinonia-client-transaction-kicker">Koinonia Transactions</p>
              <h1 className="koinonia-client-dashboard-title">Your transactions</h1>
              <p className="koinonia-client-dashboard-subtitle">
                {activeCount ? `${activeCount} active ${activeCount === 1 ? "file" : "files"}. ` : ""}
                Koinonia is managing the details and will surface only what actually needs you.
              </p>
            </div>
            <a className="koinonia-button primary" href="/client/transactions/new">Start a file</a>
          </div>

          {view.notice ? <p className="koinonia-client-security-note">{view.notice}</p> : null}

          {view.attention.length ? (
            <section className="koinonia-client-attention-strip" aria-labelledby="needs-attention-title">
              <div className="koinonia-client-attention-copy">
                <span>{view.attention.length}</span>
                <div>
                  <strong id="needs-attention-title">Needs your attention</strong>
                  <p>Only items Koinonia cannot move forward without are shown here.</p>
                </div>
              </div>
              <div className="koinonia-client-attention-links">
                {view.attention.slice(0, 3).map((transaction) => (
                  <a href={`/client/work/${transaction.id}`} key={transaction.id}>
                    <strong>{transaction.propertyAddress}</strong>
                    <span>{transaction.nextAction ?? "Open file"}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : (
            <div className="koinonia-client-calm-status">
              <span aria-hidden="true">✓</span>
              <p><strong>Nothing needs you right now.</strong> Koinonia has the active files moving.</p>
            </div>
          )}
        </div>
      </section>

      <section className="koinonia-section koinonia-client-dashboard-body">
        <div className="koinonia-container">
          <section className="koinonia-client-transaction-index" aria-labelledby="transactions-title">
            <div className="koinonia-client-index-heading">
              <div>
                <h2 id="transactions-title">Files</h2>
                <p>Property first. Client, status, and closing date stay visible without opening the file.</p>
              </div>

              <ClientTransactionSearch
                transactions={view.transactions.map((transaction) => ({
                  id: transaction.id,
                  propertyAddress: transaction.propertyAddress,
                  clientName: transaction.clientName,
                  status: transaction.status,
                  side: transaction.side
                }))}
                initialQuery={search}
                filter={filter}
              />
            </div>

            <div className="koinonia-client-dashboard-toolbar koinonia-client-dashboard-toolbar-modern">
              <nav className="koinonia-client-dashboard-filters" aria-label="Transaction filters">
                <FilterLink active={filter === "active"} filter="active" label="Active" search={search} />
                <FilterLink active={filter === "closing"} filter="closing" label="Closing soon" search={search} />
                <FilterLink active={filter === "closed"} filter="closed" label="Closed" search={search} />
              </nav>
              {search ? <a className="koinonia-client-clear-search" href={`/client/dashboard?filter=${filter}`}>Clear search</a> : null}
            </div>

            <div className="koinonia-client-transaction-list">
              {visibleTransactions.length ? (
                visibleTransactions.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)
              ) : (
                <div className="koinonia-client-empty-state">
                  <strong>{search ? "No matching files" : "No files in this view"}</strong>
                  <p>{search ? "Try another property address or client name." : "When a file belongs here, it will appear automatically."}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function TransactionRow({ transaction }: { transaction: DashboardTransaction }) {
  const needsYou = needsAttention(transaction);
  return (
    <article className="koinonia-client-transaction-row">
      <a className="koinonia-client-transaction-row-link" href={`/client/work/${transaction.id}`}>
        <div className="koinonia-client-transaction-row-main">
          <div className="koinonia-client-transaction-row-title">
            <h3>{transaction.propertyAddress}</h3>
            {needsYou ? <span className="is-attention">Needs you</span> : <span>{transaction.side}</span>}
          </div>
          <p>{transaction.clientName}</p>
        </div>
        <div className="koinonia-client-transaction-row-status">
          <strong>{humanizeStatus(transaction.status)}</strong>
          <span>{transaction.closingDate ? `Closing ${formatDate(transaction.closingDate)}` : "Closing date pending"}</span>
        </div>
      </a>
      <ClientTransactionQuickActions inboundEmail={transaction.inboundEmail} transactionId={transaction.id} />
    </article>
  );
}

function FilterLink({ active, filter, label, search }: { active: boolean; filter: DashboardFilter; label: string; search: string }) {
  const query = new URLSearchParams({ filter });
  if (search) query.set("q", search);
  return <a className={`koinonia-client-dashboard-filter${active ? " is-active" : ""}`} href={`/client/dashboard?${query.toString()}`} aria-current={active ? "page" : undefined}>{label}</a>;
}

async function getDashboardView(workspaceId: string, userId: string): Promise<DashboardView> {
  try {
    const objects = await prisma.rosObject.findMany({
      where: { workspaceId, objectType: "Transaction", archivedAt: null, OR: [{ clientUserId: userId }, { ownerId: userId }] },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 100
    });
    const transactions = objects.map((object) => {
      const data = asRecord(object.data) ?? {};
      const extraction = asRecord(data.extraction);
      const proposal = asRecord(extraction?.proposal);
      const confirmed = asRecord(data.confirmedExtraction);
      const side = data.side === "seller" ? "Seller" : "Buyer";
      const clientName = firstString(confirmed?.clientName, data.clientName, formatClientNames(confirmed?.clientNames), formatClientNames(proposal?.clientNames));
      const propertyAddress = firstString(confirmed?.propertyAddress, data.propertyAddress, proposal?.propertyAddress, stripTransactionSuffix(object.name));
      const closingDate = firstString(confirmed?.closingDate, data.closingDate, proposal?.closingDate);
      return {
        clientName: clientName || "Client details pending",
        closingDate: closingDate || null,
        health: object.health,
        id: object.id,
        inboundEmail: null,
        name: object.name,
        nextAction: object.nextAction,
        propertyAddress: propertyAddress || object.name,
        side,
        status: object.status
      } satisfies DashboardTransaction;
    });
    return { attention: transactions.filter(needsAttention), transactions };
  } catch (error) {
    if (error instanceof Error && (error.name === "PrismaClientInitializationError" || error.message.includes("Can't reach database server") || error.message.includes("ECONNREFUSED"))) {
      return { attention: [], transactions: [], notice: "Your transaction list is temporarily unavailable. Koinonia can still accept a new file." };
    }
    throw error;
  }
}

function filterTransactions(transactions: DashboardTransaction[], filter: DashboardFilter, search: string): DashboardTransaction[] {
  const normalizedSearch = search.trim().toLocaleLowerCase("en-US");
  return transactions.filter((transaction) => {
    if (normalizedSearch) {
      const haystack = `${transaction.name} ${transaction.clientName} ${transaction.propertyAddress}`.toLocaleLowerCase("en-US");
      if (!haystack.includes(normalizedSearch)) return false;
    }
    if (filter === "closed") return isClosed(transaction);
    if (filter === "closing") return !isClosed(transaction) && isClosingSoon(transaction.closingDate);
    return !isClosed(transaction);
  });
}

function needsAttention(transaction: DashboardTransaction): boolean {
  const status = transaction.status.toLocaleLowerCase("en-US");
  return transaction.health === "Attention" || status.includes("waiting") || status.includes("needs") || status.includes("review") || status.includes("wrong document");
}
function isClosed(transaction: DashboardTransaction): boolean { const status = transaction.status.toLocaleLowerCase("en-US"); return status.includes("closed") || status.includes("complete"); }
function isClosingSoon(value: string | null): boolean { if (!value) return false; const closing = new Date(value); if (Number.isNaN(closing.getTime())) return false; const difference = closing.getTime() - Date.now(); return difference >= 0 && difference <= 14 * 24 * 60 * 60 * 1000; }
function getDashboardFilter(value: string | string[] | undefined): DashboardFilter { const normalized = Array.isArray(value) ? value[0] : value; return normalized === "closing" || normalized === "closed" ? normalized : "active"; }
function getStringParam(value: string | string[] | undefined): string { const normalized = Array.isArray(value) ? value[0] : value; return typeof normalized === "string" ? normalized.trim() : ""; }
function asRecord(value: unknown): Record<string, unknown> | null { return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null; }
function firstString(...values: unknown[]): string { for (const value of values) if (typeof value === "string" && value.trim()) return value.trim(); return ""; }
function formatClientNames(value: unknown): string { return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).join(" & ") : ""; }
function stripTransactionSuffix(value: string): string { return value.replace(/\s+—\s+(Buyer|Seller)$/i, "").trim(); }
function formatDate(value: string): string { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date); }
function humanizeStatus(value: string): string {
  const normalized = value.toLocaleLowerCase("en-US");
  if (normalized.includes("closed") || normalized.includes("complete")) return "Closed";
  if (normalized.includes("processing") || normalized.includes("intake")) return "Koinonia is setting it up";
  if (normalized.includes("waiting") || normalized.includes("needs") || normalized.includes("review")) return "In progress";
  return value;
}
