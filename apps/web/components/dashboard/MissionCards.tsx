import { brainState } from "../../lib/brain";
import {
  objectEnginePrinciples
} from "../../lib/objectEngine";
import {
  activeWorkspace
} from "../../lib/workspace";

const missionItems = [
  {
    label: "Current sprint",
    value: brainState.milestone,
    detail: brainState.nextTask
  },
  {
    label: "Platform",
    value: `v${brainState.version}`,
    detail: brainState.branch
  },
  {
    label: "Workspace",
    value: activeWorkspace.name,
    detail: activeWorkspace.description
  },
  {
    label: "Architecture",
    value: brainState.objectEngineStatus,
    detail:
      objectEnginePrinciples.currentStatus
  }
];

export function MissionCards() {
  return (
    <section
      aria-label="Mission status"
      className="ros-mission-strip"
    >
      {missionItems.map((item) => (
        <article
          className="ros-mission-item"
          key={item.label}
        >
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </section>
  );
}
