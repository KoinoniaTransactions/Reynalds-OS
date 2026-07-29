const nav = [
  "Dashboard",
  "Reynalds Brothers",
  "CRM",
  "Transactions",
  "Contracts",
  "Showings",
  "Operations",
  "Finance",
  "Customer Success",
  "Knowledge",
  "Reports",
  "Administration",
  "Object Explorer",
  "Timeline",
  "Workflows",
  "Automations",
  "Intelligence"
];

function navHref(item: string) {
  if (item === "CRM") return "/crm";
  if (item === "Reynalds Brothers") return "/reynalds-brothers";
  if (item === "Transactions") return "/transactions";
  if (item === "Operations") return "/operations";
  if (item === "Finance") return "/finance";
  if (item === "Object Explorer") return "/objects";
  return "#";
}

type SidebarProps = {
  workspace: string;
  version: string;
};

export function Sidebar({ workspace, version }: SidebarProps) {
  return (
    <aside className="ros-sidebar">
      <div className="ros-brand">
        <div className="ros-mark">R</div>
        <div>
          <strong>ROS</strong>
          <span>{workspace} · v{version}</span>
        </div>
      </div>

      <nav>
        {nav.map((item) => (
          <a key={item} href={navHref(item)} className={item === "Dashboard" ? "active" : ""}>
            {item}
          </a>
        ))}
      </nav>
    </aside>
  );
}
