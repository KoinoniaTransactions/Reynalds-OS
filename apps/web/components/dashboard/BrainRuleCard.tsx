import { brainState } from "../../lib/brain";
import {
  coreObjectTypes,
  objectEnginePrinciples
} from "../../lib/objectEngine";

export function BrainRuleCard() {
  return (
    <aside className="ros-briefing">
      <span className="ros-section-kicker">
        Operating principle
      </span>

      <h2>Brain rule</h2>

      <blockquote>
        {objectEnginePrinciples.rule}
      </blockquote>

      <section className="ros-briefing-section">
        <span>Active objective</span>
        <p>{brainState.nextTask}</p>
      </section>

      <section className="ros-briefing-section">
        <span>Core objects</span>

        <div className="ros-chip-list">
          {coreObjectTypes.map((type) => (
            <small key={type}>
              {type}
            </small>
          ))}
        </div>
      </section>
    </aside>
  );
}
