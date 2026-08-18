"use client";

import { useEffect, useMemo, useState } from "react";
import {
  relationshipLifecycleStages,
  relationshipMaterialOptions,
  relationshipPaths,
  relationshipPressureCategories,
  relationshipServiceOptions,
  relationshipSources,
  suggestRelationshipQuickCapture,
  type RelationshipQuickCaptureSuggestion
} from "../lib/koinonia-relationship";
import { suggestFollowUpDueDate } from "../lib/relationship-follow-up-date";

type Props = {
  relationshipId: string;
  relationshipName: string;
  onSaved: () => Promise<void> | void;
};

const blankSuggestion: RelationshipQuickCaptureSuggestion = {};

function patchSuggestion(
  current: RelationshipQuickCaptureSuggestion,
  patch: Partial<RelationshipQuickCaptureSuggestion>
) {
  return { ...current, ...patch };
}

export function RelationshipQuickCapture({
  relationshipId,
  relationshipName,
  onSaved
}: Props) {
  const [note, setNote] = useState("");
  const [suggestion, setSuggestion] = useState<RelationshipQuickCaptureSuggestion>(blankSuggestion);
  const [reviewing, setReviewing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [createFollowUpTask, setCreateFollowUpTask] = useState(false);
  const [followUpDueDate, setFollowUpDueDate] = useState("");

  useEffect(() => {
    setNote("");
    setSuggestion(blankSuggestion);
    setReviewing(false);
    setError("");
    setSavedMessage("");
    setCreateFollowUpTask(false);
    setFollowUpDueDate("");
  }, [relationshipId]);

  const suggestionCount = useMemo(
    () => Object.values(suggestion).filter(Boolean).length,
    [suggestion]
  );

  function analyzeNote() {
    const trimmed = note.trim();
    if (!trimmed) return;

    const nextSuggestion = suggestRelationshipQuickCapture(trimmed);
    setSuggestion(nextSuggestion);
    setCreateFollowUpTask(Boolean(nextSuggestion.nextAction));
    setFollowUpDueDate(
      nextSuggestion.nextAction ? suggestFollowUpDueDate(trimmed) : ""
    );
    setReviewing(true);
    setSavedMessage("");
    setError("");
  }

  async function confirmSave() {
    const trimmed = note.trim();
    if (!trimmed) return;

    setSaving(true);
    setError("");
    setSavedMessage("");

    try {
      const response = await fetch(
        `/api/objects/${relationshipId}/relationship-interactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            note: trimmed,
            confirmed: suggestion,
            createFollowUpTask,
            followUpDueDate: createFollowUpTask ? followUpDueDate : ""
          })
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to save relationship interaction.");
      }

      setNote("");
      setSuggestion(blankSuggestion);
      setReviewing(false);
      setCreateFollowUpTask(false);
      setFollowUpDueDate("");
      setSavedMessage(
        data.followUpTask
          ? data.followUpTaskAlreadyOpen
            ? data.followUpTaskDueDateUpdated
              ? "Interaction saved. The existing staff follow-up was updated with the confirmed due date."
              : "Interaction saved. An identical open staff follow-up already exists."
            : "Interaction saved and a staff follow-up task was created."
          : "Interaction saved to the relationship history."
      );
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error.");
    } finally {
      setSaving(false);
    }
  }

  function patch(patch: Partial<RelationshipQuickCaptureSuggestion>) {
    setSuggestion((current) => patchSuggestion(current, patch));
  }

  return (
    <div className="ros-panel" style={{ marginBottom: 18 }}>
      <h3>Quick Capture</h3>
      <p>
        Paste your natural-language note from a conversation with {relationshipName}. The system will suggest structure, but nothing changes until you confirm it.
      </p>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        rows={5}
        placeholder="Example: Met Sarah from ABC Realty at the office meeting. She said she already has a TC but hates losing Saturdays to open houses. I gave her the tri-fold and she wants to try one standalone open house next month."
      />

      <div className="ros-actions" style={{ marginTop: 10 }}>
        <button type="button" onClick={analyzeNote} disabled={!note.trim() || saving}>
          Review Suggestions
        </button>
        {reviewing ? (
          <button
            type="button"
            onClick={() => {
              setSuggestion(blankSuggestion);
              setReviewing(false);
              setCreateFollowUpTask(false);
              setFollowUpDueDate("");
            }}
            disabled={saving}
          >
            Clear Review
          </button>
        ) : null}
      </div>

      {error ? <p className="ros-error">{error}</p> : null}
      {savedMessage ? <p>{savedMessage}</p> : null}

      {reviewing ? (
        <div className="ros-form" style={{ marginTop: 14 }}>
          <strong>
            Suggested structure {suggestionCount ? `(${suggestionCount} fields)` : "(no confident fields yet)"}
          </strong>
          <p>
            Edit or clear anything that is wrong. The original note will still be preserved exactly as entered.
          </p>

          <input
            value={suggestion.brokerage ?? ""}
            onChange={(event) => patch({ brokerage: event.target.value })}
            placeholder="Brokerage / team"
          />

          <select
            value={suggestion.lifecycle ?? ""}
            onChange={(event) => patch({ lifecycle: event.target.value })}
          >
            <option value="">No lifecycle change</option>
            {relationshipLifecycleStages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>

          <select
            value={suggestion.source ?? ""}
            onChange={(event) => patch({ source: event.target.value })}
          >
            <option value="">Source not suggested</option>
            {relationshipSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>

          <select
            value={suggestion.material ?? ""}
            onChange={(event) => patch({ material: event.target.value })}
          >
            {relationshipMaterialOptions.map((material) => (
              <option key={material || "none"} value={material}>
                {material || "Material not suggested"}
              </option>
            ))}
          </select>

          <select
            value={suggestion.primaryPressure ?? ""}
            onChange={(event) => patch({ primaryPressure: event.target.value })}
          >
            <option value="">Pressure not suggested</option>
            {relationshipPressureCategories.map((pressure) => (
              <option key={pressure} value={pressure}>{pressure}</option>
            ))}
          </select>

          <select
            value={suggestion.path ?? ""}
            onChange={(event) => patch({ path: event.target.value })}
          >
            <option value="">No keep/refer suggestion</option>
            {relationshipPaths.map((path) => (
              <option key={path} value={path}>{path}</option>
            ))}
          </select>

          <select
            value={suggestion.requestedService ?? ""}
            onChange={(event) => patch({ requestedService: event.target.value })}
          >
            {relationshipServiceOptions.map((service) => (
              <option key={`requested-${service || "none"}`} value={service}>
                {service || "Requested service not suggested"}
              </option>
            ))}
          </select>

          <select
            value={suggestion.recommendedService ?? ""}
            onChange={(event) => patch({ recommendedService: event.target.value })}
          >
            {relationshipServiceOptions.map((service) => (
              <option key={`recommended-${service || "none"}`} value={service}>
                {service || "Recommended service not suggested"}
              </option>
            ))}
          </select>

          <input
            value={suggestion.nextAction ?? ""}
            onChange={(event) => {
              const nextAction = event.target.value;
              patch({ nextAction });
              if (!nextAction.trim()) {
                setCreateFollowUpTask(false);
                setFollowUpDueDate("");
              }
            }}
            placeholder="Next action"
          />

          <label style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <input
              type="checkbox"
              checked={createFollowUpTask}
              onChange={(event) => setCreateFollowUpTask(event.target.checked)}
              disabled={!suggestion.nextAction?.trim()}
            />
            <span>
              <strong>Create staff follow-up task</strong>
              <br />
              Keep this next action inside the Koinonia staff workflow. It will not appear as a client portal request.
            </span>
          </label>

          {createFollowUpTask ? (
            <label>
              Staff follow-up due date
              <input
                type="date"
                value={followUpDueDate}
                onChange={(event) => setFollowUpDueDate(event.target.value)}
              />
              <small>
                Suggested only from clear calendar language in the note. Change or clear it before saving if needed.
              </small>
            </label>
          ) : null}

          <button type="button" onClick={() => void confirmSave()} disabled={saving}>
            {saving ? "Saving..." : "Confirm & Save Interaction"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
