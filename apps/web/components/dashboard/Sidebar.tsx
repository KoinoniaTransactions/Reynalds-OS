import { workspaceNavigation } from "../../lib/workspaceNavigation";

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
          <span>
            {workspace} · v{version}
          </span>
        </div>
      </div>

      <nav>
        {workspaceNavigation.map((item) =>
          item.enabled && item.href ? (
            <a
              key={item.label}
              href={item.href}
              className={item.href === "/" ? "active" : ""}
            >
              {item.label}
            </a>
          ) : (
            <span key={item.label} aria-disabled="true">
              {item.label}
            </span>
          )
        )}
      </nav>
    </aside>
  );
}
