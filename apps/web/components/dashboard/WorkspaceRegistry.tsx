import { workspaces } from "../../lib/workspace";

export function WorkspaceRegistry() {
  return (
    <article className="ros-card">
      <h2>Workspace Registry</h2>

      <table className="ros-table">
        <thead>
          <tr>
            <th>Workspace</th>
            <th>Status</th>
            <th>Purpose</th>
          </tr>
        </thead>

        <tbody>
          {workspaces.map((workspace) => (
            <tr key={workspace.id}>
              <td>
                <strong>{workspace.name}</strong>
                <br />
                <small>{workspace.category}</small>
              </td>
              <td>{workspace.status}</td>
              <td>{workspace.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}