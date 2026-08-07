"use client";

import {
  useEffect,
  useState
} from "react";

import type {
  FormEvent
} from "react";

import {
  personalFinanceNextPeriodKey,
  personalFinancePeriodLabel,
  personalFinancePreviousPeriodKey
} from "../lib/personal-finance-income-schedule";

import type {
  PersonalFinanceIncomeOccurrence,
  PersonalFinanceIncomeSchedule,
  PersonalFinanceIncomeSource,
  PersonalFinanceIncomeWorkspaceData
} from "../lib/personal-finance-income-types";

import styles from "./personal-finance-income-workspace.module.css";

type Props = {
  initialWorkspace:
    PersonalFinanceIncomeWorkspaceData;
};

function money(
  value: number
): string {
  return new Intl.NumberFormat(
    "en-US",
    {
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      style: "currency"
    }
  ).format(value);
}

function readableDate(
  value: string
): string {
  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric"
    }
  ).format(date);
}

function scheduleLabel(
  schedule:
    PersonalFinanceIncomeSchedule
): string {
  switch (schedule) {
    case "weekly":
      return "Weekly";
    case "biweekly":
      return "Every two weeks";
    case "semimonthly":
      return "Twice monthly";
    case "monthly":
      return "Monthly";
    case "irregular":
      return "Irregular / manual";
  }
}

function sourceTypeLabel(
  value:
    PersonalFinanceIncomeSource[
      "sourceType"
    ]
): string {
  switch (value) {
    case "employment":
      return "Employment";
    case "self_employment":
      return "Self-employment";
    case "retirement":
      return "Retirement";
    case "benefit":
      return "Benefit";
    case "other":
      return "Other";
  }
}

function occurrenceKindLabel(
  occurrence:
    PersonalFinanceIncomeOccurrence
): string {
  if (
    occurrence.kind ===
    "imported"
  ) {
    return "Imported";
  }

  if (
    occurrence.kind ===
    "misc"
  ) {
    return "Miscellaneous";
  }

  return "Scheduled";
}

function statusLabel(
  occurrence:
    PersonalFinanceIncomeOccurrence
): string {
  if (
    occurrence.status ===
    "received"
  ) {
    return "Received";
  }

  if (
    occurrence.status ===
    "partial"
  ) {
    return "Partially received";
  }

  return "Pending";
}

export function PersonalFinanceIncomeWorkspace({
  initialWorkspace
}: Props) {
  const [
    workspace,
    setWorkspace
  ] = useState(
    initialWorkspace
  );

  const [
    showSourceForm,
    setShowSourceForm
  ] = useState(false);

  const [
    showMiscForm,
    setShowMiscForm
  ] = useState(false);

  const [
    schedule,
    setSchedule
  ] =
    useState<
      PersonalFinanceIncomeSchedule
    >("biweekly");

  const [
    saving,
    setSaving
  ] = useState(false);

  const [
    savingOccurrenceId,
    setSavingOccurrenceId
  ] = useState<
    string | null
  >(null);

  const [
    loadingPeriod,
    setLoadingPeriod
  ] = useState(false);

  const [
    error,
    setError
  ] = useState<
    string | null
  >(null);

  const [
    notice,
    setNotice
  ] = useState<
    string | null
  >(null);

  const nextPeriodKey =
    personalFinanceNextPeriodKey(
      workspace.periodKey
    );

  const defaultSourcePeriod =
    workspace.importedCount > 0
      ? nextPeriodKey
      : workspace.periodKey;

  const scheduledOccurrences =
    workspace.occurrences.filter(
      (occurrence) =>
        occurrence.kind !==
        "misc"
    );

  const miscOccurrences =
    workspace.occurrences.filter(
      (occurrence) =>
        occurrence.kind ===
        "misc"
    );

  async function loadPeriod(
    periodKey: string,
    updateUrl = true
  ) {
    if (
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(
        periodKey
      )
    ) {
      setError(
        "Choose a valid income month."
      );
      return;
    }

    setLoadingPeriod(true);
    setError(null);
    setNotice(null);

    try {
      const response =
        await fetch(
          `/api/personal/income?period=${encodeURIComponent(
            periodKey
          )}`,
          {
            method: "GET",
            cache: "no-store"
          }
        );

      const body =
        await response.json() as {
          workspace?:
            PersonalFinanceIncomeWorkspaceData;
          error?: string;
        };

      if (
        !response.ok ||
        !body.workspace
      ) {
        throw new Error(
          body.error ??
            "Income month could not be loaded."
        );
      }

      setWorkspace(
        body.workspace
      );

      if (
        updateUrl &&
        typeof window !==
          "undefined"
      ) {
        const url =
          new URL(
            window.location.href
          );

        url.searchParams.set(
          "period",
          body.workspace.periodKey
        );

        window.history.replaceState(
          {},
          "",
          url
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Income month could not be loaded."
      );
    } finally {
      setLoadingPeriod(false);
    }
  }

  useEffect(() => {
    const queryPeriod =
      new URLSearchParams(
        window.location.search
      ).get("period");

    if (
      queryPeriod &&
      queryPeriod !==
        workspace.periodKey &&
      /^\d{4}-(0[1-9]|1[0-2])$/.test(
        queryPeriod
      )
    ) {
      void loadPeriod(
        queryPeriod,
        false
      );
    }
  }, []);

  async function postAction(
    action: string,
    payload:
      Record<
        string,
        unknown
      >
  ): Promise<
    PersonalFinanceIncomeWorkspaceData
  > {
    const response =
      await fetch(
        "/api/personal/income",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify({
              action,
              periodKey:
                workspace.periodKey,
              ...payload
            })
        }
      );

    const body =
      await response.json() as {
        workspace?:
          PersonalFinanceIncomeWorkspaceData;
        error?: string;
      };

    if (
      !response.ok ||
      !body.workspace
    ) {
      throw new Error(
        body.error ??
          "Income could not be updated."
      );
    }

    return body.workspace;
  }

  async function submitSource(
    event:
      FormEvent<
        HTMLFormElement
      >
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setNotice(null);

    const form =
      event.currentTarget;

    const data =
      new FormData(form);

    try {
      const updated =
        await postAction(
          "create-source",
          {
            recipientName:
              String(
                data.get(
                  "recipientName"
                ) ?? ""
              ),
            sourceName:
              String(
                data.get(
                  "sourceName"
                ) ?? ""
              ),
            sourceType:
              String(
                data.get(
                  "sourceType"
                ) ?? ""
              ),
            schedule:
              String(
                data.get(
                  "schedule"
                ) ?? ""
              ),
            expectedAmount:
              String(
                data.get(
                  "expectedAmount"
                ) ?? ""
              ),
            anchorDate:
              String(
                data.get(
                  "anchorDate"
                ) ?? ""
              ),
            secondPayDay:
              String(
                data.get(
                  "secondPayDay"
                ) ?? ""
              ),
            activeFromPeriod:
              String(
                data.get(
                  "activeFromPeriod"
                ) ?? ""
              ),
            depositAccountLabel:
              String(
                data.get(
                  "depositAccountLabel"
                ) ?? ""
              ),
            notes:
              String(
                data.get(
                  "notes"
                ) ?? ""
              )
          }
        );

      setWorkspace(
        updated
      );

      setNotice(
        "Income source saved. Its pay schedule is ready for current and future periods."
      );

      setShowSourceForm(
        false
      );

      setSchedule(
        "biweekly"
      );

      form.reset();

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );
    } catch (saveError) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Income source could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitMisc(
    event:
      FormEvent<
        HTMLFormElement
      >
  ) {
    event.preventDefault();

    setSaving(true);
    setError(null);
    setNotice(null);

    const form =
      event.currentTarget;

    const data =
      new FormData(form);

    try {
      const updated =
        await postAction(
          "create-misc",
          {
            label:
              String(
                data.get(
                  "label"
                ) ?? ""
              ),
            recipientName:
              String(
                data.get(
                  "recipientName"
                ) ?? ""
              ),
            expectedAmount:
              String(
                data.get(
                  "expectedAmount"
                ) ?? ""
              ),
            expectedDate:
              String(
                data.get(
                  "expectedDate"
                ) ?? ""
              ),
            receivedAmount:
              String(
                data.get(
                  "receivedAmount"
                ) ?? ""
              ),
            receivedDate:
              String(
                data.get(
                  "receivedDate"
                ) ?? ""
              ),
            notes:
              String(
                data.get(
                  "notes"
                ) ?? ""
              )
          }
        );

      setWorkspace(
        updated
      );

      setNotice(
        "Miscellaneous income added."
      );

      setShowMiscForm(
        false
      );

      form.reset();

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );
    } catch (saveError) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Miscellaneous income could not be saved."
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitReceipt(
    event:
      FormEvent<
        HTMLFormElement
      >,
    occurrence:
      PersonalFinanceIncomeOccurrence
  ) {
    event.preventDefault();

    const data =
      new FormData(
        event.currentTarget
      );

    const targetOccurrenceId =
      String(
        data.get(
          "occurrenceId"
        ) ?? ""
      ).trim();

    if (
      !targetOccurrenceId ||
      targetOccurrenceId !==
        occurrence.id
    ) {
      setError(
        "The receipt target could not be resolved. No income record was changed."
      );
      return;
    }

    setSaving(true);
    setSavingOccurrenceId(
      occurrence.id
    );
    setError(null);
    setNotice(null);

    try {
      const updated =
        await postAction(
          "update-receipt",
          {
            occurrenceId:
              targetOccurrenceId,
            receivedAmount:
              String(
                data.get(
                  "receivedAmount"
                ) ?? ""
              ),
            receivedDate:
              String(
                data.get(
                  "receivedDate"
                ) ?? ""
              )
          }
        );

      setWorkspace(
        updated
      );

      setNotice(
        `Receipt updated for ${occurrence.recipientName} — ${occurrence.label} (${readableDate(
          occurrence.expectedDate
        )}).`
      );

      window.dispatchEvent(
        new Event(
          "personal-finance-updated"
        )
      );
    } catch (saveError) {
      setError(
        saveError instanceof
          Error
          ? saveError.message
          : "Income receipt could not be updated."
      );
    } finally {
      setSaving(false);
      setSavingOccurrenceId(
        null
      );
    }
  }

  return (
    <div
      className={styles.workspace}
    >
      {error ? (
        <div
          className={styles.error}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      {notice ? (
        <div
          className={styles.success}
          role="status"
        >
          {notice}
        </div>
      ) : null}

      <section
        aria-label="Income month"
        className={
          styles.periodToolbar
        }
      >
        <div
          className={
            styles.periodIdentity
          }
        >
          <span>
            Viewing income month
          </span>

          <strong>
            {workspace.periodLabel}
          </strong>
        </div>

        <div
          className={
            styles.periodControls
          }
        >
          <button
            className={
              styles.secondaryButton
            }
            disabled={
              loadingPeriod
            }
            onClick={() =>
              void loadPeriod(
                personalFinancePreviousPeriodKey(
                  workspace.periodKey
                )
              )
            }
            type="button"
          >
            Previous
          </button>

          <label
            className={
              styles.periodPicker
            }
          >
            <span>
              Month
            </span>

            <input
              aria-label="Select income month"
              disabled={
                loadingPeriod
              }
              onChange={(
                event
              ) =>
                void loadPeriod(
                  event.target
                    .value
                )
              }
              type="month"
              value={
                workspace.periodKey
              }
            />
          </label>

          <button
            className={
              styles.secondaryButton
            }
            disabled={
              loadingPeriod
            }
            onClick={() =>
              void loadPeriod(
                personalFinanceNextPeriodKey(
                  workspace.periodKey
                )
              )
            }
            type="button"
          >
            Next
          </button>
        </div>
      </section>

      <section
        aria-label="Income summary"
        className={
          styles.summary
        }
      >
        <article>
          <span>
            Expected
          </span>

          <strong>
            {money(
              workspace
                .totals
                .expected
            )}
          </strong>

          <small>
            Planned for{" "}
            {
              workspace.periodLabel
            }
          </small>
        </article>

        <article>
          <span>
            Received
          </span>

          <strong
            className={
              styles.positive
            }
          >
            {money(
              workspace
                .totals
                .received
            )}
          </strong>

          <small>
            Actual income recorded
          </small>
        </article>

        <article>
          <span>
            Still expected
          </span>

          <strong>
            {money(
              workspace
                .totals
                .pending
            )}
          </strong>

          <small>
            Remaining planned income
          </small>
        </article>

        <article>
          <span>
            Upcoming
          </span>

          <strong>
            {
              workspace
                .totals
                .upcoming
            }
          </strong>

          <small>
            Deposits not fully received
          </small>
        </article>
      </section>

      {workspace.importedCount >
      0 ? (
        <aside
          className={
            styles.importNotice
          }
        >
          <strong>
            Existing{" "}
            {
              workspace.periodLabel
            }{" "}
            income preserved
          </strong>

          <p>
            The existing budget rows
            remain as imported income
            so nothing is lost.
            New recurring sources
            default to{" "}
            {personalFinancePeriodLabel(
              nextPeriodKey
            )}{" "}
            to prevent this month
            from being counted twice.
          </p>
        </aside>
      ) : null}

      <section
        className={
          styles.section
        }
      >
        <header
          className={
            styles.sectionHeader
          }
        >
          <div>
            <span
              className={
                styles.kicker
              }
            >
              Recurring income
            </span>

            <h2>
              Income sources
            </h2>

            <p>
              Define who earns each
              income stream, where it
              comes from, and its normal
              pay schedule.
            </p>
          </div>

          <button
            className={
              styles.primaryButton
            }
            onClick={() =>
              setShowSourceForm(
                (current) =>
                  !current
              )
            }
            type="button"
          >
            {showSourceForm
              ? "Close form"
              : "Add income source"}
          </button>
        </header>

        {showSourceForm ? (
          <form
            className={
              styles.editor
            }
            onSubmit={
              submitSource
            }
          >
            <div
              className={
                styles.editorHeading
              }
            >
              <div>
                <span>
                  New recurring source
                </span>

                <h3>
                  Add paycheck or
                  recurring income
                </h3>
              </div>

              <p>
                Enter the typical net
                amount expected per
                deposit.
              </p>
            </div>

            <div
              className={
                styles.formGrid
              }
            >
              <label>
                <span>
                  Assigned to
                </span>

                <input
                  autoComplete="off"
                  name="recipientName"
                  placeholder="Jeremiah, spouse, household..."
                  required
                />
              </label>

              <label>
                <span>
                  Employer or source
                </span>

                <input
                  autoComplete="off"
                  name="sourceName"
                  placeholder="Employer or income source"
                  required
                />
              </label>

              <label>
                <span>
                  Income type
                </span>

                <select
                  defaultValue="employment"
                  name="sourceType"
                >
                  <option
                    value="employment"
                  >
                    Employment
                  </option>

                  <option
                    value="self_employment"
                  >
                    Self-employment
                  </option>

                  <option
                    value="retirement"
                  >
                    Retirement
                  </option>

                  <option
                    value="benefit"
                  >
                    Benefit
                  </option>

                  <option
                    value="other"
                  >
                    Other
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Pay schedule
                </span>

                <select
                  name="schedule"
                  onChange={(
                    event
                  ) =>
                    setSchedule(
                      event.target
                        .value as
                        PersonalFinanceIncomeSchedule
                    )
                  }
                  value={
                    schedule
                  }
                >
                  <option
                    value="weekly"
                  >
                    Weekly
                  </option>

                  <option
                    value="biweekly"
                  >
                    Every two weeks
                  </option>

                  <option
                    value="semimonthly"
                  >
                    Twice monthly
                  </option>

                  <option
                    value="monthly"
                  >
                    Monthly
                  </option>

                  <option
                    value="irregular"
                  >
                    Irregular / manual
                  </option>
                </select>
              </label>

              <label>
                <span>
                  Typical net pay
                </span>

                <input
                  min="0"
                  name="expectedAmount"
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                />
              </label>

              <label>
                <span>
                  Known payday /
                  anchor date
                </span>

                <input
                  name="anchorDate"
                  required={
                    schedule !==
                    "irregular"
                  }
                  type="date"
                />
              </label>

              {schedule ===
              "semimonthly" ? (
                <label>
                  <span>
                    Second pay day
                  </span>

                  <input
                    max="31"
                    min="1"
                    name="secondPayDay"
                    placeholder="31 = last day"
                    required
                    type="number"
                  />
                </label>
              ) : (
                <input
                  name="secondPayDay"
                  type="hidden"
                  value=""
                />
              )}

              <label>
                <span>
                  Start month
                </span>

                <input
                  defaultValue={
                    defaultSourcePeriod
                  }
                  name="activeFromPeriod"
                  required
                  type="month"
                />
              </label>

              <label>
                <span>
                  Deposit account
                  label
                </span>

                <input
                  autoComplete="off"
                  name="depositAccountLabel"
                  placeholder="Checking, savings..."
                />
              </label>

              <label
                className={
                  styles.fullWidth
                }
              >
                <span>
                  Notes
                </span>

                <textarea
                  name="notes"
                  placeholder="Optional notes about this income source"
                  rows={3}
                />
              </label>
            </div>

            <div
              className={
                styles.formActions
              }
            >
              <button
                className={
                  styles.secondaryButton
                }
                onClick={() =>
                  setShowSourceForm(
                    false
                  )
                }
                type="button"
              >
                Cancel
              </button>

              <button
                className={
                  styles.primaryButton
                }
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Saving..."
                  : "Save income source"}
              </button>
            </div>
          </form>
        ) : null}

        {workspace.sources.length >
        0 ? (
          <div
            className={
              styles.sourceGrid
            }
          >
            {workspace.sources.map(
              (source) => (
                <article
                  className={
                    styles.sourceCard
                  }
                  key={
                    source.id
                  }
                >
                  <div
                    className={
                      styles.sourceTop
                    }
                  >
                    <span
                      className={
                        styles.recipientBadge
                      }
                    >
                      {
                        source.recipientName
                      }
                    </span>

                    <span
                      className={
                        styles.typeBadge
                      }
                    >
                      {sourceTypeLabel(
                        source.sourceType
                      )}
                    </span>
                  </div>

                  <h3>
                    {
                      source.sourceName
                    }
                  </h3>

                  <p>
                    {scheduleLabel(
                      source.schedule
                    )}
                  </p>

                  <dl
                    className={
                      styles.sourceFacts
                    }
                  >
                    <div>
                      <dt>
                        Typical deposit
                      </dt>

                      <dd>
                        {money(
                          source.expectedAmount
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Starts
                      </dt>

                      <dd>
                        {personalFinancePeriodLabel(
                          source.activeFromPeriod
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt>
                        Deposit to
                      </dt>

                      <dd>
                        {source.depositAccountLabel ??
                          "Not assigned"}
                      </dd>
                    </div>
                  </dl>
                </article>
              )
            )}
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            No recurring income
            sources have been
            configured yet.
          </div>
        )}
      </section>

      <section
        className={
          styles.section
        }
      >
        <header
          className={
            styles.sectionHeader
          }
        >
          <div>
            <span
              className={
                styles.kicker
              }
            >
              Monthly schedule
            </span>

            <h2>
              {
                workspace.periodLabel
              }{" "}
              income
            </h2>

            <p>
              Planned deposits and
              actual income received
              for this month.
            </p>
          </div>

          <span
            className={
              styles.countBadge
            }
          >
            {
              scheduledOccurrences.length
            }
          </span>
        </header>

        {scheduledOccurrences.length >
        0 ? (
          <div
            className={
              styles.occurrenceList
            }
          >
            {scheduledOccurrences.map(
              (occurrence) => (
                <IncomeOccurrenceRow
                  key={
                    occurrence.id
                  }
                  occurrence={
                    occurrence
                  }
                  onSubmit={
                    submitReceipt
                  }
                  saving={
                    savingOccurrenceId ===
                    occurrence.id
                  }
                />
              )
            )}
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            No scheduled income is
            recorded for this period.
          </div>
        )}
      </section>

      <section
        className={
          styles.section
        }
      >
        <header
          className={
            styles.sectionHeader
          }
        >
          <div>
            <span
              className={
                styles.kicker
              }
            >
              One-time income
            </span>

            <h2>
              Miscellaneous income
            </h2>

            <p>
              Add refunds, side jobs,
              reimbursements, gifts,
              cash income, or any
              custom one-time source.
            </p>
          </div>

          <button
            className={
              styles.primaryButton
            }
            onClick={() =>
              setShowMiscForm(
                (current) =>
                  !current
              )
            }
            type="button"
          >
            {showMiscForm
              ? "Close form"
              : "Add miscellaneous income"}
          </button>
        </header>

        {showMiscForm ? (
          <form
            className={
              styles.editor
            }
            onSubmit={
              submitMisc
            }
          >
            <div
              className={
                styles.editorHeading
              }
            >
              <div>
                <span>
                  Custom income
                </span>

                <h3>
                  Label the income
                  clearly
                </h3>
              </div>

              <p>
                Example: tax refund,
                garage sale, mileage
                reimbursement, or cash
                job.
              </p>
            </div>

            <div
              className={
                styles.formGrid
              }
            >
              <label>
                <span>
                  Income label
                </span>

                <input
                  autoComplete="off"
                  name="label"
                  placeholder="Tax refund, garage sale..."
                  required
                />
              </label>

              <label>
                <span>
                  Assigned to
                </span>

                <input
                  autoComplete="off"
                  name="recipientName"
                  placeholder="Jeremiah, spouse, household..."
                  required
                />
              </label>

              <label>
                <span>
                  Expected amount
                </span>

                <input
                  min="0"
                  name="expectedAmount"
                  placeholder="0.00"
                  required
                  step="0.01"
                  type="number"
                />
              </label>

              <label>
                <span>
                  Expected date
                </span>

                <input
                  defaultValue={`${workspace.periodKey}-01`}
                  name="expectedDate"
                  required
                  type="date"
                />
              </label>

              <label>
                <span>
                  Already received
                </span>

                <input
                  min="0"
                  name="receivedAmount"
                  placeholder="0.00"
                  step="0.01"
                  type="number"
                />
              </label>

              <label>
                <span>
                  Received date
                </span>

                <input
                  name="receivedDate"
                  type="date"
                />
              </label>

              <label
                className={
                  styles.fullWidth
                }
              >
                <span>
                  Notes
                </span>

                <textarea
                  name="notes"
                  placeholder="Optional description"
                  rows={3}
                />
              </label>
            </div>

            <div
              className={
                styles.formActions
              }
            >
              <button
                className={
                  styles.secondaryButton
                }
                onClick={() =>
                  setShowMiscForm(
                    false
                  )
                }
                type="button"
              >
                Cancel
              </button>

              <button
                className={
                  styles.primaryButton
                }
                disabled={saving}
                type="submit"
              >
                {saving
                  ? "Saving..."
                  : "Add misc income"}
              </button>
            </div>
          </form>
        ) : null}

        {miscOccurrences.length >
        0 ? (
          <div
            className={
              styles.occurrenceList
            }
          >
            {miscOccurrences.map(
              (occurrence) => (
                <IncomeOccurrenceRow
                  key={
                    occurrence.id
                  }
                  occurrence={
                    occurrence
                  }
                  onSubmit={
                    submitReceipt
                  }
                  saving={
                    savingOccurrenceId ===
                    occurrence.id
                  }
                />
              )
            )}
          </div>
        ) : (
          <div
            className={
              styles.empty
            }
          >
            No miscellaneous income
            is recorded for this month.
          </div>
        )}
      </section>
    </div>
  );
}

function IncomeOccurrenceRow({
  occurrence,
  onSubmit,
  saving
}: {
  occurrence:
    PersonalFinanceIncomeOccurrence;
  onSubmit: (
    event:
      FormEvent<
        HTMLFormElement
      >,
    occurrence:
      PersonalFinanceIncomeOccurrence
  ) => Promise<void>;
  saving: boolean;
}) {
  return (
    <article
      className={
        styles.occurrence
      }
    >
      <div
        className={
          styles.occurrenceIdentity
        }
      >
        <div
          className={
            styles.badges
          }
        >
          <span
            className={
              styles.recipientBadge
            }
          >
            {
              occurrence.recipientName
            }
          </span>

          <span
            className={
              styles.typeBadge
            }
          >
            {occurrenceKindLabel(
              occurrence
            )}
          </span>
        </div>

        <h3>
          {occurrence.label}
        </h3>

        <time
          dateTime={
            occurrence.expectedDate
          }
        >
          {readableDate(
            occurrence.expectedDate
          )}
        </time>
      </div>

      <div
        className={
          styles.amounts
        }
      >
        <span>
          <small>
            Expected
          </small>

          <strong>
            {money(
              occurrence.expected
            )}
          </strong>
        </span>

        <span>
          <small>
            Received
          </small>

          <strong
            className={
              styles.positive
            }
          >
            {money(
              occurrence.received
            )}
          </strong>
        </span>

        <span>
          <small>
            Remaining
          </small>

          <strong>
            {money(
              occurrence.remaining
            )}
          </strong>
        </span>
      </div>

      <span
        className={`${styles.status} ${
          occurrence.status ===
          "received"
            ? styles.statusReceived
            : occurrence.status ===
                "partial"
              ? styles.statusPartial
              : styles.statusPending
        }`}
      >
        {statusLabel(
          occurrence
        )}
      </span>

      <form
        className={
          styles.receiptForm
        }
        data-target-occurrence={
          occurrence.id
        }
        id={`income-receipt-${occurrence.id}`}
        onSubmit={(
          event
        ) =>
          onSubmit(
            event,
            occurrence
          )
        }
      >
        <input
          name="occurrenceId"
          type="hidden"
          value={
            occurrence.id
          }
        />

        <div
          className={
            styles.receiptTarget
          }
        >
          <span>
            Receipt target
          </span>

          <strong>
            {occurrence.recipientName}
            {" · "}
            {occurrence.label}
          </strong>

          <small>
            Expected{" "}
            {readableDate(
              occurrence.expectedDate
            )}
          </small>
        </div>

        <label>
          <span>
            Actual received
          </span>

          <input
            defaultValue={
              occurrence.received
            }
            min="0"
            name="receivedAmount"
            required
            step="0.01"
            type="number"
          />
        </label>

        <label>
          <span>
            Received date
          </span>

          <input
            defaultValue={
              occurrence.receivedDate ??
              occurrence.expectedDate
            }
            name="receivedDate"
            type="date"
          />
        </label>

        <button
          aria-label={`${
            occurrence.received > 0
              ? "Update"
              : "Record"
          } receipt for ${occurrence.recipientName} ${occurrence.label}`}
          className={
            styles.secondaryButton
          }
          disabled={saving}
          title={`Receipt target: ${occurrence.recipientName} · ${occurrence.label} · ${readableDate(
            occurrence.expectedDate
          )}`}
          type="submit"
        >
          {saving
            ? "Updating..."
            : occurrence.received > 0
              ? "Update receipt"
              : "Record received"}
        </button>
      </form>
    </article>
  );
}
