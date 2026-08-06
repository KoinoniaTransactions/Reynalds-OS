import {
  workspaces
} from "../../lib/workspace";

export function WorkspaceRegistry() {
  return (
    <article className="ros-surface-section">
      <header className="ros-section-header">
        <div>
          <span className="ros-section-kicker">
            Available areas
          </span>

          <h2>Workspaces</h2>

          <p>
            Select a workspace to continue.
          </p>
        </div>

        <span className="ros-section-count">
          {workspaces.length}
        </span>
      </header>

      <div className="ros-workspace-list">
        {workspaces.map((workspace) => (
          <a
            className="ros-workspace-row"
            href={workspace.route}
            key={workspace.id}
          >
            <div className="ros-workspace-title">
              <strong>
                {workspace.name}
              </strong>

              <span>
                {workspace.category}
              </span>
            </div>

            <p>{workspace.description}</p>

            <div className="ros-workspace-meta">
              <span className="ros-status-chip">
                {workspace.status}
              </span>

              <span
                aria-hidden="true"
                className="ros-row-arrow"
              >
                →
              </span>
            </div>
          </a>
        ))}
      </div>
    </article>
  );
}
