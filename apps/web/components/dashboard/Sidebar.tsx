"use client";

import { usePathname } from "next/navigation";

import {
  workspaceNavigation
} from "../../lib/workspaceNavigation";

type SidebarProps = {
  workspace: string;
  version: string;
};

function routeIsActive(
  pathname: string,
  href: string
): boolean {
  if (href === "/") {
    return pathname === "/";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function Sidebar({
  workspace,
  version
}: SidebarProps) {
  const pathname = usePathname() ?? "";

  const enabledItems =
    workspaceNavigation.filter(
      (item) =>
        item.enabled &&
        Boolean(item.href)
    );

  const plannedCount =
    workspaceNavigation.length -
    enabledItems.length;

  return (
    <aside className="ros-sidebar">
      <div className="ros-brand">
        <div
          aria-hidden="true"
          className="ros-mark"
        >
          R
        </div>

        <div className="ros-brand-copy">
          <strong>Reynalds</strong>
          <span>Operating System</span>
        </div>
      </div>

      <span className="ros-sidebar-section-label">
        Workspaces
      </span>

      <nav
        aria-label="Primary workspace navigation"
        className="ros-sidebar-nav"
      >
        {enabledItems.map((item) => {
          const href = item.href;

          if (!href) {
            return null;
          }

          const active =
            routeIsActive(
              pathname,
              href
            );

          return (
            <a
              aria-current={
                active ? "page" : undefined
              }
              className={
                active ? "active" : undefined
              }
              href={href}
              key={item.label}
            >
              <span
                aria-hidden="true"
                className="ros-nav-indicator"
              />

              <span className="ros-nav-label">
                {item.label}
              </span>
            </a>
          );
        })}
      </nav>

      {plannedCount > 0 ? (
        <div className="ros-nav-planned">
          <span aria-hidden="true">＋</span>

          <div>
            <strong>
              {plannedCount} planned
            </strong>

            <small>
              Hidden until ready
            </small>
          </div>
        </div>
      ) : null}

      <footer className="ros-sidebar-footer">
        <span>Current workspace</span>

        <strong title={workspace}>
          {workspace}
        </strong>

        <small>
          Version {version}
        </small>
      </footer>
    </aside>
  );
}
