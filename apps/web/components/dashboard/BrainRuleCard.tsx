import { brainState } from "../../lib/brain";
import { objectEnginePrinciples, coreObjectTypes } from "../../lib/objectEngine";

export function BrainRuleCard() {
  return (
    <aside className="ros-card">
      <h2>Brain Operating Rule</h2>
      <p>{objectEnginePrinciples.rule}</p>

      <h3>Active Objective</h3>
      <p>{brainState.nextTask}</p>

      <h3>Core Object Types</h3>
      <ul>
        {coreObjectTypes.map((type) => (
          <li key={type}>{type}</li>
        ))}
      </ul>
    </aside>
  );
}