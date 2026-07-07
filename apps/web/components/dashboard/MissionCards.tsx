import { brainState } from "../../lib/brain";
import { objectEnginePrinciples } from "../../lib/objectEngine";
import { activeWorkspace } from "../../lib/workspace";

export function MissionCards() {
  return (
    <section className="ros-grid">
      <article className="ros-card">
        <span>Current Sprint</span>
        <strong>{brainState.milestone}</strong>
        <p>{brainState.nextTask}</p>
      </article>

      <article className="ros-card">
        <span>Platform Version</span>
        <strong>{brainState.version}</strong>
        <p>{brainState.branch}</p>
      </article>

      <article className="ros-card">
        <span>Active Workspace</span>
        <strong>{activeWorkspace.name}</strong>
        <p>{activeWorkspace.description}</p>
      </article>

      <article className="ros-card">
        <span>Architecture Status</span>
        <strong>{brainState.objectEngineStatus}</strong>
        <p>{objectEnginePrinciples.currentStatus}</p>
      </article>
    </section>
  );
}