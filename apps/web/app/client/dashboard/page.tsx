import type { Metadata } from "next";
import { absoluteUrl } from "../../../config/seo.config";
import { Footer, Header } from "../../../components/site";
import { requirePortalPermission } from "../../../lib/portal-auth";
import { prisma } from "../../../lib/db";
import { clientTransactionObjectType } from "../../../lib/client-transactions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Client Dashboard | Koinonia",
  description: "Your Koinonia transactions, next actions, documents, and closing progress.",
  alternates: {
    canonical: absoluteUrl("/client/dashboard")
  },
  robots: {
    index: false,
    follow: false
  }
};

type DashboardFilter = "active" | "closing" | "closed";

type DashboardTransaction = {
  clientName: string;
  closingDate: string | null;
  health: string;
  id: string;
  name: string;
  nextAction: string | null;
  propertyAddress: string;
  side: "Buyer" | "Seller";
  status: string;
};

type DashboardView = {
  attention: DashboardTransaction[];
  notice?: string;
  transactions: DashboardTransaction[];
};

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ClientDashboardPage({ searchParams }: PageProps) {
  const actor = await requirePortalPermission("client-portal:view", "/client/dashboard");
  const params = (await searchParams) ?? {};
  const filter = getDashboardFilter(params.filter);
  const search = getStringParam(params.q);
  const view = await getDashboardView(actor.workspaceId, actor.id);
  const visibleTransactions = filterTransactions(view.transactions, filter, search);

  return (
    <main className="koinonia-site koinonia-client-dashboard">
      <Header
        canAccessClientPortal={actor.permissions.includes("client-portal:view")}
        canAccessEmployeePortal={actor.permissions.includes("employee-portal:view")}
      />

      <section className="koinonia-section koinonia-client-dashboard-hero">
        <div className="koinonia-container">
          <div className="koinonia-section-header">
            <p className="koinonia-eyebrow">Client Portal</p>
            <h1 className="koinonia-title">Welcome back.</h1>
            <p className="koinonia-lead">
              See what is happening with your files, what needs your attention, and what Koinonia is handling next.
            </p>
          </div>

          <a className="koinonia-button koinonia-button-primary" href="/client/transactions/new">
            + Start New File
          </a>
        </div>
      </section>

      <section className="koinonia-section">
        <div className="koinonia-container">
          <div className="koinonia-client-main-stack">
            {view.notice ? (
              <p className="koinonia-client-security-note">{view.notice}</p>
            ) : null}

            {view.attention.length ? (
              <section className="koinonia-client-work-panel" aria-labelledby="needs-attention-title">
                <div className="koinonia-client-panel-heading">
                  <p className="koinonia-eyebrow">Needs Your Attention</p>
                  <h2 id="needs-attention-title">A few things need you.</h2>
                  <p>Only files that need a decision, confirmation, or missing information appear here.</p>
                </div>

                <div className="koinonia-client-work-list">
                  {view.attention.slice(0, 4).map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} showNextAction />
                  ))}
                </div>
              </section>
            ) : null}

            <section className="koinonia-client-work-panel" aria-labelledby="transactions-title">
              <div className="koinonia-client-panel-heading">
                <div>
                  <p className="koinonia-eyebrow">Transactions</p>
                  <h2 id="transactions-title">Your files</h2>
                </div>
                <p>Search by client or property, then narrow the list if needed.</p>
              </div>

              <div className="koinonia-client-dashboard-toolbar">
                <nav className="koinonia-client-dashboard-filters" aria-label="Transaction filters">
                  <FilterLink active={filter === "active"} filter="active" label="Active" search={search} />
                  <FilterLink active={filter === "closing"} filter="closing" label="Closing Soon" search={search} />
                  <FilterLink active={filter === "closed"} filter="closed" label="Closed" search={search} />
                </nav>

                <form action="/client/dashboard" method="get" className="koinonia-client-dashboard-search">
                  <label className="koinonia-client-dashboard-search-field">
                    <span className="koinonia-sr-only">Search transactions</span>
                    <input
                      type="search"
                      name="q"
                      defaultValue={search}
                      placeholder="Search client or property"
                    />
                  </label>
                  <input type="hidden" name="filter" value={filter} />
                  <button className="koinonia-button" type="submit">Search</button>
                </form>
              </div>

              <div className="koinonia-client-work-list">
                {visibleTransactions.length ? (
                  visibleTransactions.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))
                ) : (
                  <article className="koinonia-client-work-item">
                    <div>
                      <span>{search ? "No matches" : "Nothing here yet"}</span>
                      <h3>{search ? "Try another client or address." : "Start your first file when you are ready."}</h3>
                      <p>
                        {search
                          ? "Clear the search or choose another transaction filter."
                          : "Upload the document you already have and Koinonia will build the file from it."}
                      </p>
                    </div>
                  </article>
                )}
              </div>
            </section>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function TransactionRow({
  transaction,
  showNextAction = false
}: {
  transaction: DashboardTransaction;
  showNextAction?: boolean;
}) {
  return (
    <article className="koinonia-client-work-item">
      <div>
        <span>{transaction.side}</span>
        <h3>{transaction.propertyAddress}</h3>
        <p>{transaction.clientName}</p>
        {showNextAction && transaction.nextAction ? <p>{transaction.nextAction}</p> : null}
        <a className="koinonia-document-link" href={`/client/work/${transaction.id}`}>
          Open File
        </a>
      </div>
      <div className="koinonia-client-work-meta">
        <strong>{transaction.status}</strong>
        <span>{transaction.closingDate ? `Closing ${formatDate(transaction.closingDate)}` : "Closing not set"}</span>
      </div>
    </article>
  );
}

function FilterLink({
  active,
  filter,
  label,
  search
}: {
  active: boolean;
  filter: DashboardFilter;
  label: string;
  search: string;
}) {
  const query = new URLSearchParams({ filter });
  if (search) query.set("q", search);

  return (
    <a
      className={`koinonia-client-dashboard-filter${active ? " is-active" : ""}`}
      href={`/client/dashboard?${query.toString()}`}
      aria-current={active ? "page" : undefined}
    >
      {label}
    </a>
  );
}

async function getDashboardView(workspaceId: string, userId: string): Promise<DashboardView> {
  try {
    const objects = await prisma.rosObject.findMany({
      where: {
        workspaceId,
        objectType: clientTransactionObjectType,
        archivedAt: null,
        OR: [{ clientUserId: userId }, { ownerId: userId }]
      },
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      take: 100
    });

    const transactions = objects.map((object) => {
      const data = asRecord(object.data) ?? {};
      const extraction = asRecord(data.extraction);
      const proposal = asRecord(extraction?.proposal);
      const confirmed = asRecord(data.confirmedExtraction);
      const side = data.side === "seller" ? "Seller" : "Buyer";
      const clientName = firstString(
        confirmed?.clientName,
        data.clientName,
        formatClientNames(confirmed?.clientNames),
        formatClientNames(proposal?.clientNames)
      );
      const propertyAddress = firstString(
        confirmed?.propertyAddress,
        data.propertyAddress,
        proposal?.propertyAddress,
        stripTransactionSuffix(object.name)
      );
      const closingDate = firstString(
        confirmed?.closingDate,
        data.closingDate,
        proposal?.closingDate
      );

      return {
        clientName: clientName || "Client details pending",
        closingDate: closingDate || null,
        health: object.health,
        id: object.id,
        name: object.name,
        nextAction: object.nextAction,
        propertyAddress: propertyAddress || object.name,
        side,
        status: object.status
      } satisfies DashboardTransaction;
    });

    return {
      attention: transactions.filter(needsAttention),
      transactions
    };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "PrismaClientInitializationError" ||
        error.message.includes("Can't reach database server") ||
        error.message.includes("ECONNREFUSED"))
    ) {
      return {
        attention: [],
        transactions: [],
        notice: "Your transaction list is temporarily unavailable. Koinonia can still accept a new file."
      };
    }

    throw error;
  }
}

function filterTransactions(
  transactions: DashboardTransaction[],
  filter: DashboardFilter,
  search: string
): DashboardTransaction[] {
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
  return (
    transaction.health === "Attention" ||
    status.includes("waiting") ||
    status.includes("needs") ||
    status.includes("review") ||
    status.includes("processing") ||
    status.includes("wrong document")
  );
}

function isClosed(transaction: DashboardTransaction): boolean {
  const status = transaction.status.toLocaleLowerCase("en-US");
  return status.includes("closed") || status.includes("complete");
}

function isClosingSoon(value: string | null): boolean {
  if (!value) return false;
  const closing = new Date(value);
  if (Number.isNaN(closing.getTime())) return false;

  const now = new Date();
  const fourteenDays = 14 * 24 * 60 * 60 * 1000;
  const difference = closing.getTime() - now.getTime();
  return difference >= 0 && difference <= fourteenDays;
}

function getDashboardFilter(value: string | string[] | undefined): DashboardFilter {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === "closing" || normalized === "closed" ? normalized : "active";
}

function getStringParam(value: string | string[] | undefined): string {
  const normalized = Array.isArray(value) ? value[0] : value;
  return typeof normalized === "string" ? normalized.trim() : "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function formatClientNames(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).join(" & ");
}

function stripTransactionSuffix(value: string): string {
  return value.replace(/\s+—\s+(Buyer|Seller)$/i, "").trim();
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}
