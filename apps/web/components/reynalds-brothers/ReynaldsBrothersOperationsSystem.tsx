"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./ReynaldsBrothersOperationsSystem.module.css";
import {
  type ReynaldsBrothersEmailClassification,
  type ReynaldsBrothersEmailCandidate,
  reynaldsBrothersFallbackEmails
} from "../../lib/reynalds-brothers-email-intake";
import {
  REYNALDS_BROTHERS_WORK_ITEM_TYPE,
  applyChecklistAutomation,
  getActivationPhaseForJobType,
  getBillingPassoffSummary,
  getChecklistProgress,
  getFieldProofSummary,
  getPhaseProgress,
  getRouteBatches,
  getTankInventorySummary,
  getPhaseTrackForJobType,
  getWorkItemData,
  getWorkItemAlerts,
  getWorkItemChecklist,
  getWorkItemLane,
  getWorkItemLocation,
  getWorkItemMetrics,
  isInvoiceReadyStatus,
  needsCrew,
  needsDocumentation,
  previewTrialWorkItemImport,
  reynaldsBrothersBillingApprovalFlow,
  reynaldsBrothersBoardLanes,
  reynaldsBrothersFallbackWorkItems,
  reynaldsBrothersJobTypes,
  reynaldsBrothersLucernexStatuses,
  reynaldsBrothersOfficeUsers,
  type ReynaldsBrothersWorkItemData,
  type ReynaldsBrothersWorkItemCreateInput,
  type ReynaldsBrothersWorkItem
} from "../../lib/reynalds-brothers-work-items";

const systemModules = [
  {
    title: "Approval-Controlled Intake",
    body: "AI can draft jobs from WMTanks email, including multi-store emails, but every AI-created job starts in Needs Approval."
  },
  {
    title: "ACC/UCO/PW Workflows",
    body: "Level 1 triage, Level 2 triage, ACC replacement, UCO replacement, DIY-only work, and pressure washing each carry their own required steps."
  },
  {
    title: "Lucernex and PO Tracking",
    body: "Jobs keep Lucernex links, Lucernex status, APO/PO numbers, permit dates, completion dates, and open fields for new Walmart requirements."
  },
  {
    title: "Tank Inventory Assignment",
    body: "Tank sets and individual tanks are tracked before assignment, with manufacturer and serial numbers required before completion."
  },
  {
    title: "Field Proof",
    body: "CompanyCam links, before/after photos, manager names, signatures, and completion notes become required proof on each job."
  },
  {
    title: "Billing Pass-Off",
    body: "Shay starts billing, Jeremiah approves, Darren gives final approval, and Josh has visibility before the job closes."
  }
];

const operatingRhythm = [
  "Morning: review approval queue, overdue triage, PO red flags, permit delays, and tank assignments.",
  "Planning: keep Lucernex, PO, permitting, tank ordering, and coordinated oil removal moving.",
  "Before field work: confirm route grouping, crews, tanks, permits, oil removal, CompanyCam link, and required documentation.",
  "After field work: verify photos, serial numbers, manager details, completion date, and billing readiness."
];

type ApiPayload = {
  source?: string;
  workItems?: ReynaldsBrothersWorkItem[];
  warning?: string;
};

type EmailApiPayload = {
  candidates?: ReynaldsBrothersEmailCandidate[];
  warning?: string;
};

const defaultCreateForm = {
  name: "",
  serviceLine: "",
  customer: "",
  jobType: "ACC Level 1 Triage",
  storeNumber: "",
  city: "",
  state: "",
  siteName: "",
  workType: "",
  nextAction: ""
};

const trialImportExample = [
  "Store Number\tCity\tState\tJob Type\tPO\tWO\tLucernex Link\tNext Action",
  "1590\tHialeah\tFlorida\tACC Tank Replacement\t\t247399487\t\tConfirm permits and PO.",
  "4672\tMontgomery\tAlabama\tUCO Tank Replacement\tPO-123\t\t\tConfirm Frontline delivery."
].join("\n");

const trialWorkItemsStorageKey = "reynalds-brothers.trial-work-items.v1";

export function ReynaldsBrothersOperationsSystem() {
  const [workItems, setWorkItems] = useState<ReynaldsBrothersWorkItem[]>(reynaldsBrothersFallbackWorkItems);
  const [selectedId, setSelectedId] = useState(reynaldsBrothersFallbackWorkItems[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("fallback");
  const [error, setError] = useState("");
  const [createForm, setCreateForm] = useState(defaultCreateForm);
  const [statusUpdate, setStatusUpdate] = useState("Planning");
  const [healthUpdate, setHealthUpdate] = useState("Healthy");
  const [nextActionUpdate, setNextActionUpdate] = useState("");
  const [crewLeadUpdate, setCrewLeadUpdate] = useState("");
  const [invoiceStatusUpdate, setInvoiceStatusUpdate] = useState("Not Ready");
  const [billingApprovalStatusUpdate, setBillingApprovalStatusUpdate] = useState("Not Started");
  const [customerUpdateStatus, setCustomerUpdateStatus] = useState("");
  const [approvalStatusUpdate, setApprovalStatusUpdate] = useState("Needs Approval");
  const [approvedByUpdate, setApprovedByUpdate] = useState("");
  const [lucernexStatusUpdate, setLucernexStatusUpdate] = useState("Not Started");
  const [lucernexUrlUpdate, setLucernexUrlUpdate] = useState("");
  const [poNumberUpdate, setPoNumberUpdate] = useState("");
  const [poStatusUpdate, setPoStatusUpdate] = useState("Missing");
  const [permitStatusUpdate, setPermitStatusUpdate] = useState("Not Started");
  const [permitSubmittedDateUpdate, setPermitSubmittedDateUpdate] = useState("");
  const [permitApprovedDateUpdate, setPermitApprovedDateUpdate] = useState("");
  const [tankStatusUpdate, setTankStatusUpdate] = useState("");
  const [tankSupplierUpdate, setTankSupplierUpdate] = useState("");
  const [tankSerialNumbersUpdate, setTankSerialNumbersUpdate] = useState("");
  const [oilRemovalStatusUpdate, setOilRemovalStatusUpdate] = useState("");
  const [companyCamUrlUpdate, setCompanyCamUrlUpdate] = useState("");
  const [managerNameUpdate, setManagerNameUpdate] = useState("");
  const [managerTitleUpdate, setManagerTitleUpdate] = useState("");
  const [signatureStatusUpdate, setSignatureStatusUpdate] = useState("");
  const [vacTruckCompanyUpdate, setVacTruckCompanyUpdate] = useState("");
  const [disposalFacilityUpdate, setDisposalFacilityUpdate] = useState("");
  const [completionDateUpdate, setCompletionDateUpdate] = useState("");
  const [emailCandidates, setEmailCandidates] = useState<ReynaldsBrothersEmailCandidate[]>([]);
  const [manualEmailSubject, setManualEmailSubject] = useState("");
  const [manualEmailFrom, setManualEmailFrom] = useState("");
  const [manualEmailBody, setManualEmailBody] = useState("");
  const [emailActionPendingId, setEmailActionPendingId] = useState("");
  const [emailActionMessage, setEmailActionMessage] = useState("");
  const [approvalActionPending, setApprovalActionPending] = useState("");
  const [trialImportText, setTrialImportText] = useState("");
  const [trialImportPending, setTrialImportPending] = useState(false);
  const [trialImportMessage, setTrialImportMessage] = useState("");

  async function loadWorkItems() {
    setError("");

    try {
      const response = await fetch("/api/reynalds-brothers/work-items");
      if (!response.ok) throw new Error("Failed to load Reynalds Brothers work items.");
      const payload = (await response.json()) as ApiPayload;
      const loaded = payload.workItems?.length ? payload.workItems : reynaldsBrothersFallbackWorkItems;
      const trialItems = loadStoredTrialWorkItems();
      const nextItems = mergeWorkItemLists(loaded, trialItems);
      setWorkItems(nextItems);
      setSource(trialItems.length > 0 ? "trial" : payload.source ?? "fallback");
      setSelectedId((current) => (nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? ""));
      if (payload.warning) setError(payload.warning);
    } catch (err) {
      const trialItems = loadStoredTrialWorkItems();
      const nextItems = mergeWorkItemLists(reynaldsBrothersFallbackWorkItems, trialItems);
      setSource("fallback");
      setError(err instanceof Error ? err.message : "Using preview work items.");
      setWorkItems(nextItems);
      setSource(trialItems.length > 0 ? "trial" : "fallback");
      setSelectedId((current) => (nextItems.some((item) => item.id === current) ? current : nextItems[0]?.id ?? ""));
    }
  }

  useEffect(() => {
    void loadWorkItems();
    void loadEmailCandidates();
  }, []);

  async function loadEmailCandidates() {
    try {
      const response = await fetch("/api/reynalds-brothers/email-intake");
      if (!response.ok) throw new Error("Email intake requires live workspace access.");
      const payload = (await response.json()) as EmailApiPayload;
      setEmailCandidates(payload.candidates ?? []);
    } catch {
      setEmailCandidates([]);
    }
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return workItems;

    return workItems.filter((item) =>
      [item.name, item.status, item.health, item.nextAction ?? "", JSON.stringify(item.data ?? {})]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, workItems]);

  const metrics = getWorkItemMetrics(filtered);
  const routeBatches = getRouteBatches(filtered);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? workItems[0];
  const selectedData = selected ? getWorkItemData(selected) : {};
  const selectedTankSummary = selected ? getTankInventorySummary(selected) : null;
  const selectedFieldProofSummary = selected ? getFieldProofSummary(selected) : null;
  const selectedBillingSummary = selected ? getBillingPassoffSummary(selected) : null;
  const trialImportPreview = useMemo(() => previewTrialWorkItemImport(trialImportText), [trialImportText]);

  useEffect(() => {
    if (!selected) return;

    setStatusUpdate(selected.status);
    setHealthUpdate(selected.health);
    setNextActionUpdate(selected.nextAction ?? "");
    setCrewLeadUpdate(selectedData.crewLead ?? "");
    setInvoiceStatusUpdate(selectedData.invoiceStatus ?? "Not Ready");
    setBillingApprovalStatusUpdate(selectedData.billingApprovalStatus ?? "Not Started");
    setCustomerUpdateStatus(selectedData.customerUpdateStatus ?? "");
    setApprovalStatusUpdate(selectedData.approvalStatus ?? "Approved");
    setApprovedByUpdate(selectedData.approvedBy ?? "");
    setLucernexStatusUpdate(selectedData.lucernexStatus ?? "Not Started");
    setLucernexUrlUpdate(selectedData.lucernexUrl ?? "");
    setPoNumberUpdate(selectedData.poNumber ?? "");
    setPoStatusUpdate(selectedData.poStatus ?? "Missing");
    setPermitStatusUpdate(selectedData.permitStatus ?? "Not Started");
    setPermitSubmittedDateUpdate(selectedData.permitSubmittedDate ?? "");
    setPermitApprovedDateUpdate(selectedData.permitApprovedDate ?? "");
    setTankStatusUpdate(selectedData.tankStatus ?? "");
    setTankSupplierUpdate(selectedData.tankSupplier ?? "");
    setTankSerialNumbersUpdate((selectedData.tankSerialNumbers ?? []).join("\n"));
    setOilRemovalStatusUpdate(selectedData.oilRemovalStatus ?? "");
    setCompanyCamUrlUpdate(selectedData.companyCamUrl ?? "");
    setManagerNameUpdate(selectedData.managerName ?? "");
    setManagerTitleUpdate(selectedData.managerTitle ?? "");
    setSignatureStatusUpdate(selectedData.signatureStatus ?? "");
    setVacTruckCompanyUpdate(selectedData.vacTruckCompany ?? "");
    setDisposalFacilityUpdate(selectedData.disposalFacility ?? "");
    setCompletionDateUpdate(selectedData.completionDate ?? "");
  }, [
    selected,
    selectedData.approvalStatus,
    selectedData.approvedBy,
    selectedData.billingApprovalStatus,
    selectedData.companyCamUrl,
    selectedData.completionDate,
    selectedData.crewLead,
    selectedData.customerUpdateStatus,
    selectedData.disposalFacility,
    selectedData.invoiceStatus,
    selectedData.lucernexStatus,
    selectedData.lucernexUrl,
    selectedData.managerName,
    selectedData.managerTitle,
    selectedData.oilRemovalStatus,
    selectedData.permitApprovedDate,
    selectedData.permitStatus,
    selectedData.permitSubmittedDate,
    selectedData.poNumber,
    selectedData.poStatus,
    selectedData.signatureStatus,
    selectedData.tankStatus,
    selectedData.tankSupplier,
    selectedData.tankSerialNumbers,
    selectedData.vacTruckCompany
  ]);

  async function createWorkItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const input: ReynaldsBrothersWorkItemCreateInput = {
      name: createForm.name,
      status: "Needs Approval",
      health: "Watch",
      nextAction: createForm.nextAction,
      data: {
        serviceLine: createForm.serviceLine,
        customer: createForm.customer,
        jobType: createForm.jobType,
        approvalStatus: "Needs Approval",
        storeNumber: createForm.storeNumber,
        city: createForm.city,
        state: createForm.state,
        siteName: createForm.siteName,
        workType: createForm.workType,
        phase: "Needs Approval",
        phaseTrack: getPhaseTrackForJobType(createForm.jobType),
        checklistCompleted: [],
        poStatus: createForm.jobType === "Pressure Washing" ? "Not Required Yet" : "Missing",
        lucernexStatus: "Not Started",
        permitStatus: createForm.jobType === "Pressure Washing" ? "Not required" : "Not Started",
        invoiceStatus: "Not Ready",
        billingApprovalStatus: "Not Started",
        mediaStatus: "No media yet",
        customerUpdateStatus: "Needs human approval",
        sourceSystem: "manual_trial"
      }
    };

    if (source !== "database") {
      const created = createLocalTrialWorkItem(input);
      saveLocalWorkItem(created);
      setCreateForm(defaultCreateForm);
      setTrialImportMessage("Manual job created in local trial mode.");
      return;
    }

    try {
      const response = await fetch("/api/reynalds-brothers/work-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input)
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Work Item could not be created.");

      setCreateForm(defaultCreateForm);
      await loadWorkItems();
      if (payload.workItem?.id) setSelectedId(payload.workItem.id);
    } catch (err) {
      const created = createLocalTrialWorkItem(input);
      saveLocalWorkItem(created);
      setCreateForm(defaultCreateForm);
      setTrialImportMessage("Live database create was unavailable, so this job was added in local trial mode.");
    }
  }

  async function createTrialImportRecords() {
    setError("");
    setTrialImportMessage("");

    if (trialImportPreview.records.length === 0) {
      setError("Paste spreadsheet rows with headers before creating trial jobs.");
      return;
    }

    setTrialImportPending(true);

    if (source !== "database") {
      const created = trialImportPreview.records.map((record) =>
        createLocalTrialWorkItem(record.input, `trial_import_${record.rowNumber}`)
      );
      saveLocalWorkItems(created);
      setTrialImportText("");
      setTrialImportMessage(`${created.length} trial job${created.length === 1 ? "" : "s"} created locally in Needs Approval.`);
      setTrialImportPending(false);
      return;
    }

    try {
      let lastCreatedId = "";

      for (const record of trialImportPreview.records) {
        const response = await fetch("/api/reynalds-brothers/work-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record.input)
        });

        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error ?? `Row ${record.rowNumber} could not be created.`);
        if (payload.workItem?.id) lastCreatedId = payload.workItem.id;
      }

      await loadWorkItems();
      if (lastCreatedId) setSelectedId(lastCreatedId);
      setTrialImportText("");
      setTrialImportMessage(`${trialImportPreview.records.length} trial job${trialImportPreview.records.length === 1 ? "" : "s"} created in Needs Approval.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trial jobs could not be created.");
    } finally {
      setTrialImportPending(false);
    }
  }

  async function toggleChecklistItem(checklistItemId: string) {
    if (!selected) return;

    setError("");

    const currentCompleted = selectedData.checklistCompleted ?? [];
    const nextCompleted = currentCompleted.includes(checklistItemId)
      ? currentCompleted.filter((item) => item !== checklistItemId)
      : [...currentCompleted, checklistItemId];
    const nextData = applyChecklistAutomation(selectedData, nextCompleted);
    const nextItem = {
      ...selected,
      status: nextData.phase ?? selected.status,
      data: markTrialWorkItemData(nextData, selected.id)
    };

    if (source !== "database") {
      saveLocalWorkItem(nextItem);
      setTrialImportMessage("Checklist updated in local trial mode.");
      return;
    }

    try {
      const response = await fetch(`/api/reynalds-brothers/work-items/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextData.phase ?? selected.status,
          data: nextData
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Checklist could not be updated.");

      await loadWorkItems();
      setSelectedId(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checklist could not be updated.");
    }
  }

  async function updateSelectedWorkItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;

    setError("");
    const nextData = {
      ...selectedData,
      phase: statusUpdate,
      crewLead: crewLeadUpdate,
      invoiceStatus: invoiceStatusUpdate,
      billingApprovalStatus: billingApprovalStatusUpdate,
      approvalStatus: approvalStatusUpdate,
      approvedBy: approvedByUpdate,
      lucernexStatus: lucernexStatusUpdate,
      lucernexUrl: lucernexUrlUpdate,
      poNumber: poNumberUpdate,
      poStatus: poStatusUpdate,
      permitStatus: permitStatusUpdate,
      permitSubmittedDate: permitSubmittedDateUpdate,
      permitApprovedDate: permitApprovedDateUpdate,
      tankStatus: tankStatusUpdate,
      tankSupplier: tankSupplierUpdate,
      tankSerialNumbers: parseSerialNumbers(tankSerialNumbersUpdate),
      oilRemovalStatus: oilRemovalStatusUpdate,
      companyCamUrl: companyCamUrlUpdate,
      managerName: managerNameUpdate,
      managerTitle: managerTitleUpdate,
      signatureStatus: signatureStatusUpdate,
      vacTruckCompany: vacTruckCompanyUpdate,
      disposalFacility: disposalFacilityUpdate,
      completionDate: completionDateUpdate,
      customerUpdateStatus
    };

    if (source !== "database") {
      saveLocalWorkItem({
        ...selected,
        status: statusUpdate,
        health: healthUpdate,
        nextAction: nextActionUpdate,
        data: markTrialWorkItemData(nextData, selected.id)
      });
      setTrialImportMessage("Work item updated in local trial mode.");
      return;
    }

    try {
      const response = await fetch(`/api/reynalds-brothers/work-items/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusUpdate,
          health: healthUpdate,
          nextAction: nextActionUpdate,
          data: nextData
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Work Item could not be updated.");

      await loadWorkItems();
      if (payload.workItem?.id) setSelectedId(payload.workItem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Work Item could not be updated.");
    }
  }

  async function approveSelectedWorkItem() {
    if (!selected) return;

    setError("");
    setApprovalActionPending("approve");

    const activationPhase = getActivationPhaseForJobType(selectedData.jobType ?? selectedData.workType ?? selectedData.serviceLine);
    const nextData = {
      ...selectedData,
      approvalStatus: "Approved",
      approvedBy: "Jeremiah Reynalds",
      approvalDecisionAt: new Date().toISOString(),
      phase: activationPhase,
      customerUpdateStatus: "Approved; ready for office workflow."
    };
    const nextItem = {
      ...selected,
      status: activationPhase,
      health: selected.health === "Critical" ? "Attention" : selected.health,
      nextAction: getApprovalNextAction(selectedData.jobType ?? selectedData.serviceLine),
      data: markTrialWorkItemData(nextData, selected.id)
    };

    if (source !== "database") {
      saveLocalWorkItem(nextItem);
      setTrialImportMessage("Job approved in local trial mode.");
      setApprovalActionPending("");
      return;
    }

    try {
      const response = await fetch(`/api/reynalds-brothers/work-items/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: activationPhase,
          health: selected.health === "Critical" ? "Attention" : selected.health,
          nextAction: getApprovalNextAction(selectedData.jobType ?? selectedData.serviceLine),
          data: nextData
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Work Item could not be approved.");

      await loadWorkItems();
      if (payload.workItem?.id) setSelectedId(payload.workItem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Work Item could not be approved.");
    } finally {
      setApprovalActionPending("");
    }
  }

  async function holdSelectedWorkItem() {
    if (!selected) return;

    setError("");
    setApprovalActionPending("hold");
    const nextData = {
      ...selectedData,
      approvalStatus: "On Hold",
      approvedBy: "Jeremiah Reynalds",
      approvalDecisionAt: new Date().toISOString(),
      phase: "Needs Approval",
      customerUpdateStatus: "Approval held; intake needs office review."
    };
    const nextItem = {
      ...selected,
      status: "Needs Approval",
      health: "Attention",
      nextAction: "Review intake details before activating this job.",
      data: markTrialWorkItemData(nextData, selected.id)
    };

    if (source !== "database") {
      saveLocalWorkItem(nextItem);
      setTrialImportMessage("Job held for review in local trial mode.");
      setApprovalActionPending("");
      return;
    }

    try {
      const response = await fetch(`/api/reynalds-brothers/work-items/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Needs Approval",
          health: "Attention",
          nextAction: "Review intake details before activating this job.",
          data: nextData
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Work Item could not be placed on hold.");

      await loadWorkItems();
      if (payload.workItem?.id) setSelectedId(payload.workItem.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Work Item could not be placed on hold.");
    } finally {
      setApprovalActionPending("");
    }
  }

  async function analyzeManualEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setEmailActionMessage("");

    try {
      const response = await fetch("/api/reynalds-brothers/email-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_only",
          email: {
            from: manualEmailFrom,
            subject: manualEmailSubject,
            body: manualEmailBody
          }
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Email could not be analyzed.");

      setEmailCandidates((current) => [
        {
          id: `manual_${Date.now()}`,
          from: manualEmailFrom,
          subject: manualEmailSubject,
          body: manualEmailBody,
          classification: payload.classification
        },
        ...current
      ]);
      setManualEmailSubject("");
      setManualEmailFrom("");
      setManualEmailBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email could not be analyzed.");
    }
  }

  async function processEmailCandidate(
    email: ReynaldsBrothersEmailCandidate,
    action: "create_work_item" | "file_to_existing"
  ) {
    setError("");
    setEmailActionMessage("");
    setEmailActionPendingId(email.id);

    try {
      const response = await fetch("/api/reynalds-brothers/email-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          email: {
            providerMessageId: email.providerMessageId ?? email.id,
            from: email.from,
            to: email.to,
            subject: email.subject,
            receivedAt: email.receivedAt,
            snippet: email.snippet,
            body: email.body
          },
          workItemId: email.classification.matchedWorkItemId
        })
      });

      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error ?? "Email action could not be completed.");

      await loadWorkItems();
      await loadEmailCandidates();
      if (payload.workItemId) setSelectedId(payload.workItemId);
      setEmailActionMessage(action === "create_work_item"
        ? "Email-created job added to Needs Approval and the email was filed to its timeline."
        : "Email filed to the matched job timeline.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Email action could not be completed.");
    } finally {
      setEmailActionPendingId("");
    }
  }

  function saveLocalWorkItem(item: ReynaldsBrothersWorkItem) {
    saveLocalWorkItems([item]);
  }

  function saveLocalWorkItems(items: ReynaldsBrothersWorkItem[]) {
    const nextItems = mergeWorkItemLists(workItems, items);
    persistStoredTrialWorkItems(nextItems);
    setWorkItems(nextItems);
    setSource("trial");
    setSelectedId(items[items.length - 1]?.id ?? selectedId);
  }

  function clearLocalTrialWorkItems() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(trialWorkItemsStorageKey);
    }

    setTrialImportMessage("Local trial jobs cleared.");
    void loadWorkItems();
  }

  return (
    <main className={`${styles.brandScope} ros-app rb-os`}>
      <aside className="ros-sidebar rb-sidebar">
        <div className="ros-brand">
          <div className="ros-mark">RB</div>
          <div>
            <strong>Reynalds Brothers</strong>
            <span>Company Workspace</span>
          </div>
        </div>

        <nav>
          <a href="/">Reynalds OS</a>
          <a href="/reynalds-brothers" className="active">RB Operations</a>
          <a href="/operations">Shared Queue</a>
          <a href="/objects">Object Engine</a>
          <a href="/finance">Finance</a>
          <a href="/workflows">Workflows</a>
          <a href="/copilot">AI Copilot</a>
        </nav>
      </aside>

      <section className="ros-main rb-main">
        <header className="ros-topbar">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search work items, stores, services, blockers..."
          />
          <button onClick={() => void loadWorkItems()}>Refresh</button>
          <a className="ros-button-link" href="/objects">Object Engine</a>
        </header>

        <div className="ros-eyebrow">Company workspace</div>
        <h1>Reynalds Brothers Operations System</h1>
        <p className="ros-subtitle">
          A company-level command center for Walmart tank work and pressure washing: WMTanks email intake,
          human approval, Lucernex, PO red flags, permits, tank inventory, routes, field proof, and billing pass-off.
        </p>

        {error ? <p className="ros-error">{error}</p> : null}

        <section className="rb-section rb-create-panel">
          <div>
            <div className="ros-eyebrow">Approval-controlled intake</div>
            <h2>Create ACC/UCO/PW job</h2>
          </div>

          <form className="rb-inline-form" onSubmit={createWorkItem}>
            <input
              required
              value={createForm.name}
              onChange={(event) => setCreateForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Work item name"
            />
            <select
              value={createForm.jobType}
              onChange={(event) => setCreateForm((current) => ({
                ...current,
                jobType: event.target.value,
                serviceLine: getServiceLineFromJobType(event.target.value),
                workType: event.target.value
              }))}
            >
              {reynaldsBrothersJobTypes.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <input
              value={createForm.serviceLine}
              onChange={(event) => setCreateForm((current) => ({ ...current, serviceLine: event.target.value }))}
              placeholder="Service line"
            />
            <input
              value={createForm.customer}
              onChange={(event) => setCreateForm((current) => ({ ...current, customer: event.target.value }))}
              placeholder="Customer"
            />
            <input
              required
              value={createForm.storeNumber}
              onChange={(event) => setCreateForm((current) => ({ ...current, storeNumber: event.target.value }))}
              placeholder="Store number"
            />
            <input
              required
              value={createForm.city}
              onChange={(event) => setCreateForm((current) => ({ ...current, city: event.target.value }))}
              placeholder="City"
            />
            <input
              required
              value={createForm.state}
              onChange={(event) => setCreateForm((current) => ({ ...current, state: event.target.value }))}
              placeholder="State"
            />
            <input
              value={createForm.siteName}
              onChange={(event) => setCreateForm((current) => ({ ...current, siteName: event.target.value }))}
              placeholder="Site or store"
            />
            <input
              value={createForm.workType}
              onChange={(event) => setCreateForm((current) => ({ ...current, workType: event.target.value }))}
              placeholder="Work type"
            />
            <input
              required
              value={createForm.nextAction}
              onChange={(event) => setCreateForm((current) => ({ ...current, nextAction: event.target.value }))}
              placeholder="Next action"
            />
            <button type="submit">Create Work Item</button>
          </form>
        </section>

        <section className="rb-section rb-trial-import">
          <div className="rb-section-heading">
            <div>
              <div className="ros-eyebrow">First trial data</div>
              <h2>Paste spreadsheet rows</h2>
            </div>
            <div className="rb-trial-import-actions">
              <button
                className="rb-secondary-button"
                type="button"
                onClick={() => setTrialImportText(trialImportExample)}
              >
                Load Example
              </button>
              <button
                className="rb-secondary-button"
                type="button"
                onClick={clearLocalTrialWorkItems}
              >
                Clear Trial Jobs
              </button>
            </div>
          </div>

          <textarea
            value={trialImportText}
            onChange={(event) => {
              setTrialImportText(event.target.value);
              setTrialImportMessage("");
            }}
            placeholder="Paste columns from Excel or Sheets here. Include headers like Store Number, City, State, Job Type, PO, WO, Lucernex Link, Permit Status, Tank Status, CompanyCam, and Next Action."
          />

          <div className="rb-trial-import-summary">
            <span>{trialImportPreview.records.length} ready</span>
            <span>{trialImportPreview.errors.length} need fixes</span>
          </div>

          {trialImportPreview.errors.length > 0 ? (
            <ul className="rb-alert-list">
              {trialImportPreview.errors.map((importError) => (
                <li key={`${importError.rowNumber}-${importError.message}`}>
                  <strong>Row {importError.rowNumber}</strong>
                  <span>{importError.message}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {trialImportPreview.records.length > 0 ? (
            <div className="rb-import-preview-grid">
              {trialImportPreview.records.slice(0, 6).map((record) => (
                <article className="rb-import-preview-card" key={`${record.rowNumber}-${record.input.name}`}>
                  <span>Row {record.rowNumber}</span>
                  <strong>{record.input.name}</strong>
                  <small>{record.input.data.jobType} - {record.input.data.storeNumber}</small>
                  {record.warnings.length > 0 ? (
                    <ul>
                      {record.warnings.map((warning) => <li key={warning}>{warning}</li>)}
                    </ul>
                  ) : <p>Ready for approval queue.</p>}
                </article>
              ))}
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void createTrialImportRecords()}
            disabled={trialImportPending || trialImportPreview.records.length === 0}
          >
            {trialImportPending ? "Creating..." : "Create Trial Jobs"}
          </button>
          {trialImportMessage ? <p className="rb-success-note">{trialImportMessage}</p> : null}
        </section>

        <section className="rb-command-strip" aria-label="Reynalds Brothers operational metrics">
          <article className="rb-metric">
            <span>Open Work</span>
            <strong>{metrics.active}</strong>
            <p>{source === "database" ? "live company records" : source === "trial" ? "local trial records" : "preview records"}</p>
          </article>
          <article className="rb-metric">
            <span>Needs Approval</span>
            <strong>{metrics.needsApproval}</strong>
            <p>AI or manual intake awaiting human approval</p>
          </article>
          <article className="rb-metric">
            <span>Red Flags</span>
            <strong>{metrics.redFlags}</strong>
            <p>PO, permits, tanks, oil removal, photos, billing</p>
          </article>
          <article className="rb-metric">
            <span>Billing Ready</span>
            <strong>{metrics.invoiceReady}</strong>
            <p>waiting for approval pass-off</p>
          </article>
        </section>

        <section className="rb-section rb-route-planner">
          <div className="rb-section-heading">
            <div>
              <div className="ros-eyebrow">Route planning</div>
              <h2>Suggested regional batches</h2>
            </div>
          </div>
          <div className="rb-route-grid">
            {routeBatches.length === 0 ? <p className="rb-empty">No approved active jobs available for routing.</p> : null}
            {routeBatches.map((batch) => (
              <article className="rb-route-batch" key={batch.region}>
                <div className="rb-route-batch-heading">
                  <div>
                    <span>{batch.region}</span>
                    <strong>{batch.workItems.length} job{batch.workItems.length === 1 ? "" : "s"}</strong>
                  </div>
                  <small>{batch.redFlagCount} red flag{batch.redFlagCount === 1 ? "" : "s"}</small>
                </div>
                <div className="rb-route-stats">
                  <span>{batch.readyCount} ready</span>
                  <span>{batch.blockedCount} blocked</span>
                </div>
                <p>{batch.nextAction}</p>
                <ul>
                  {batch.workItems.slice(0, 3).map((item) => (
                    <li key={item.id}>{item.name}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="rb-layout">
          <div className="rb-board" aria-label="Work item lanes">
            {reynaldsBrothersBoardLanes.map((lane) => {
              const laneItems = filtered.filter((item) => getWorkItemLane(item) === lane);

              return (
                <section className="rb-lane" key={lane}>
                  <div className="rb-lane-heading">
                    <h2>{lane}</h2>
                    <span>{laneItems.length}</span>
                  </div>

                  <div className="rb-card-stack">
                    {laneItems.length === 0 ? <p className="rb-empty">No work in this lane.</p> : null}
                    {laneItems.map((item) => {
                      const data = getWorkItemData(item);
                      const progress = getPhaseProgress(item);
                      const checklistProgress = getChecklistProgress(item);
                      const alerts = getWorkItemAlerts(item);

                      return (
                        <button
                          className={item.id === selected?.id ? "rb-work-card active" : "rb-work-card"}
                          key={item.id}
                          onClick={() => setSelectedId(item.id)}
                          type="button"
                        >
                          <span className="rb-service">{data.serviceLine ?? "Service"}</span>
                          <strong>{item.name}</strong>
                          <small>{getWorkItemLocation(item)}</small>
                          <span className={`rb-health ${item.health.toLowerCase()}`}>{item.health}</span>
                          <div className="rb-progress" aria-label={`Phase progress ${progress.percent}%`}>
                            <span style={{ width: `${progress.percent}%` }} />
                          </div>
                          <small>{data.phase ?? item.status}</small>
                          <small>{checklistProgress.complete}/{checklistProgress.total} checklist items complete</small>
                          {alerts.length > 0 ? <small className="rb-red-flag">{alerts.length} red flag{alerts.length === 1 ? "" : "s"}</small> : null}
                          <p>{item.nextAction ?? "Set the next action."}</p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

          <aside className="rb-detail" aria-label="Selected work item details">
            {!selected ? (
              <p>Select a work item.</p>
            ) : (
              <>
                <div className="rb-detail-heading">
                  <div>
                    <span className="rb-service">{selectedData.serviceLine ?? "Work Item"}</span>
                    <h2>{selected.name}</h2>
                    <p>{getWorkItemLocation(selected)}</p>
                  </div>
                  <span className={`rb-health ${selected.health.toLowerCase()}`}>{selected.health}</span>
                </div>

                {selectedData.approvalStatus === "Needs Approval" || selectedData.approvalStatus === "On Hold" ? (
                  <section className="rb-approval-panel">
                    <div>
                      <span>Approval required</span>
                      <p>Jeremiah currently has approval authority. Approval activates the job into its first working phase.</p>
                    </div>
                    <div className="rb-approval-actions">
                      <button disabled={approvalActionPending !== ""} onClick={() => void approveSelectedWorkItem()} type="button">
                        {approvalActionPending === "approve" ? "Approving..." : "Approve Job"}
                      </button>
                      <button disabled={approvalActionPending !== ""} onClick={() => void holdSelectedWorkItem()} type="button">
                        {approvalActionPending === "hold" ? "Holding..." : "Hold for Review"}
                      </button>
                    </div>
                  </section>
                ) : null}

                <dl className="rb-detail-grid">
                  <div>
                    <dt>Approval</dt>
                    <dd>{selectedData.approvalStatus ?? "Approved"}</dd>
                  </div>
                  <div>
                    <dt>Approved By</dt>
                    <dd>{selectedData.approvedBy ?? "Not recorded"}</dd>
                  </div>
                  <div>
                    <dt>Customer</dt>
                    <dd>{selectedData.customer ?? "Customer TBD"}</dd>
                  </div>
                  <div>
                    <dt>Work Order</dt>
                    <dd>{selectedData.workOrderNumber ?? "WO TBD"}</dd>
                  </div>
                  <div>
                    <dt>Phase</dt>
                    <dd>{selectedData.phase ?? selected.status}</dd>
                  </div>
                  <div>
                    <dt>Lucernex</dt>
                    <dd>{selectedData.lucernexStatus ?? "Not Started"}</dd>
                  </div>
                  <div>
                    <dt>PO</dt>
                    <dd>{selectedData.poNumber ?? selectedData.poStatus ?? "Missing"}</dd>
                  </div>
                  <div>
                    <dt>Permit</dt>
                    <dd>{selectedData.permitStatus ?? "Not Started"}</dd>
                  </div>
                  <div>
                    <dt>Crew Lead</dt>
                    <dd>{selectedData.crewLead ?? "Unassigned"}</dd>
                  </div>
                  <div>
                    <dt>Invoice</dt>
                    <dd>{selectedData.invoiceStatus ?? "Not Ready"}</dd>
                  </div>
                  <div>
                    <dt>Customer Update</dt>
                    <dd>{selectedData.customerUpdateStatus ?? "Not set"}</dd>
                  </div>
                </dl>

                <section className="rb-checklist">
                  <h3>Red Flags</h3>
                  <ul>
                    {getWorkItemAlerts(selected).map((alert) => (
                      <li className="missing" key={alert}>{alert}</li>
                    ))}
                    {getWorkItemAlerts(selected).length === 0 ? <li className="ready">No current red flags.</li> : null}
                  </ul>
                </section>

                <section className="rb-checklist">
                  <h3>Readiness</h3>
                  <ul>
                    {(selectedData.readinessRequired ?? []).map((item) => (
                      <li className="missing" key={item}>{item}</li>
                    ))}
                    <li className={needsCrew(selected) ? "missing" : "ready"}>
                      Crew assignment {needsCrew(selected) ? "needed" : "ready"}
                    </li>
                    <li className={needsDocumentation(selected) ? "missing" : "ready"}>
                      Documentation {needsDocumentation(selected) ? "pending" : "complete"}
                    </li>
                    <li className={isInvoiceReadyStatus(selectedData.invoiceStatus) ? "ready" : "missing"}>
                      Billing {isInvoiceReadyStatus(selectedData.invoiceStatus) ? "ready" : "not ready"}
                    </li>
                  </ul>
                </section>

                <section className="rb-checklist rb-action-checklist">
                  <div className="rb-checklist-heading">
                    <h3>Job Checklist</h3>
                    <span>{getChecklistProgress(selected).complete}/{getChecklistProgress(selected).total}</span>
                  </div>
                  <div className="rb-checklist-progress" aria-label={`Checklist progress ${getChecklistProgress(selected).percent}%`}>
                    <span style={{ width: `${getChecklistProgress(selected).percent}%` }} />
                  </div>
                  <div className="rb-checklist-rows">
                    {getWorkItemChecklist(selected).map((item) => {
                      const checked = (selectedData.checklistCompleted ?? []).includes(item.id);

                      return (
                        <label className={checked ? "complete" : ""} key={item.id}>
                          <input
                            checked={checked}
                            onChange={() => void toggleChecklistItem(item.id)}
                            type="checkbox"
                          />
                          <span>
                            <strong>{item.label}</strong>
                            <small>{item.phase} - {item.owner} - before {item.requiredBefore}</small>
                          </span>
                        </label>
                      );
                    })}
                    {getWorkItemChecklist(selected).length === 0 ? <p>No checklist template selected for this job type.</p> : null}
                  </div>
                </section>

                <section className="rb-mini-columns">
                  <div>
                    <h3>Equipment</h3>
                    <ul>
                      {(selectedData.equipmentRequired ?? ["Equipment list needed"]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Documents</h3>
                    <ul>
                      {(selectedData.documentationRequired ?? ["Document list needed"]).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </section>

                {selectedTankSummary ? (
                  <section className="rb-tank-panel">
                    <div className="rb-section-heading">
                      <div>
                        <div className="ros-eyebrow">Tank inventory</div>
                        <h3>{selectedTankSummary.status}</h3>
                      </div>
                      <span className={selectedTankSummary.readyForScheduling ? "rb-ready-pill" : "rb-blocked-pill"}>
                        {selectedTankSummary.readyForScheduling ? "Ready" : "Blocked"}
                      </span>
                    </div>
                    <p>{selectedTankSummary.nextAction}</p>
                    {selectedTankSummary.requiredTanks.length > 0 ? (
                      <div className="rb-tank-grid">
                        <div>
                          <h4>Required tanks</h4>
                          <ul>
                            {selectedTankSummary.requiredTanks.map((tank) => (
                              <li key={tank}>{tank}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4>Assigned serials</h4>
                          <ul>
                            {selectedTankSummary.assignedSerials.length > 0 ? selectedTankSummary.assignedSerials.map((serial) => (
                              <li key={serial}>{serial}</li>
                            )) : <li>No serial numbers assigned.</li>}
                          </ul>
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}

                {selectedFieldProofSummary ? (
                  <section className="rb-tank-panel">
                    <div className="rb-section-heading">
                      <div>
                        <div className="ros-eyebrow">Field proof</div>
                        <h3>{selectedFieldProofSummary.readyForBilling ? "Ready for Billing" : "Proof Needed"}</h3>
                      </div>
                      <span className={selectedFieldProofSummary.readyForBilling ? "rb-ready-pill" : "rb-blocked-pill"}>
                        {selectedFieldProofSummary.readyForBilling ? "Ready" : "Blocked"}
                      </span>
                    </div>
                    <p>{selectedFieldProofSummary.nextAction}</p>
                    <div className="rb-tank-grid">
                      <div>
                        <h4>Proof status</h4>
                        <ul>
                          <li>{selectedFieldProofSummary.companyCamLinked ? "CompanyCam linked" : "CompanyCam link missing"}</li>
                          <li>{selectedFieldProofSummary.managerCaptured ? "Manager details captured" : "Manager details missing"}</li>
                          <li>{selectedFieldProofSummary.completionDateRecorded ? "Completion date recorded" : "Completion date missing"}</li>
                        </ul>
                      </div>
                      <div>
                        <h4>Missing proof</h4>
                        <ul>
                          {selectedFieldProofSummary.missingProofItems.length > 0 ? selectedFieldProofSummary.missingProofItems.map((item) => (
                            <li key={item}>{item}</li>
                          )) : <li>All required proof checklist items are complete.</li>}
                        </ul>
                      </div>
                    </div>
                  </section>
                ) : null}

                <section className="rb-mini-columns">
                  <div>
                    <h3>Phase Track</h3>
                    <ol className="rb-phase-list">
                      {(selectedData.phaseTrack ?? [selected.status]).map((phase) => (
                        <li className={phase === selectedData.phase ? "current" : ""} key={phase}>{phase}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <h3>Billing Pass-Off</h3>
                    <ol className="rb-phase-list">
                      {reynaldsBrothersBillingApprovalFlow.map((step) => (
                        <li
                          className={selectedBillingSummary?.completedSteps.includes(step) ? "complete" : ""}
                          key={step}
                        >
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </section>

                {selectedBillingSummary ? (
                  <section className="rb-tank-panel">
                    <div className="rb-section-heading">
                      <div>
                        <div className="ros-eyebrow">Billing handoff</div>
                        <h3>{selectedBillingSummary.approved ? "Approved" : selectedBillingSummary.currentOwner}</h3>
                      </div>
                      <span className={selectedBillingSummary.approved ? "rb-ready-pill" : "rb-blocked-pill"}>
                        {selectedBillingSummary.approved ? "Approved" : "In Review"}
                      </span>
                    </div>
                    <p>{selectedBillingSummary.nextAction}</p>
                    <div className="rb-tank-grid">
                      <div>
                        <h4>Completed</h4>
                        <ul>
                          {selectedBillingSummary.completedSteps.length > 0 ? selectedBillingSummary.completedSteps.map((step) => (
                            <li key={step}>{step}</li>
                          )) : <li>No billing approvals completed.</li>}
                        </ul>
                      </div>
                      <div>
                        <h4>Pending</h4>
                        <ul>
                          {selectedBillingSummary.pendingSteps.length > 0 ? selectedBillingSummary.pendingSteps.map((step) => (
                            <li key={step}>{step}</li>
                          )) : <li>No pending billing steps.</li>}
                        </ul>
                      </div>
                    </div>
                  </section>
                ) : null}

                <dl className="rb-detail-grid">
                  <div>
                    <dt>CompanyCam</dt>
                    <dd>{selectedData.companyCamUrl ? <a href={selectedData.companyCamUrl}>Open project</a> : "Link needed"}</dd>
                  </div>
                  <div>
                    <dt>Oil Removal</dt>
                    <dd>{selectedData.oilRemovalStatus ?? "Not applicable"}</dd>
                  </div>
                  <div>
                    <dt>Tank Status</dt>
                    <dd>{selectedData.tankStatus ?? "Not applicable"}</dd>
                  </div>
                  <div>
                    <dt>Route Region</dt>
                    <dd>{selectedData.region ?? selectedData.state ?? "Region TBD"}</dd>
                  </div>
                </dl>

                <section>
                  <h3>Next Action</h3>
                  <p>{selected.nextAction ?? "No next action set."}</p>
                </section>

                <form className="rb-update-form" onSubmit={updateSelectedWorkItem}>
                  <h3>Update Work Item</h3>
                  <div className="rb-form-section-heading">
                    <span>Core status</span>
                  </div>
                  <label>
                    Status
                    <select value={statusUpdate} onChange={(event) => setStatusUpdate(event.target.value)}>
                      {["Needs Approval", "Level 1 Triage", "Level 2 Triage", "Permitting", "Tanks Ordered", "Tanks Received and Tested", "Scheduling", "Field Work", "Completion Review", "Billing Review", "Paid", "Complete"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Approval Status
                    <select value={approvalStatusUpdate} onChange={(event) => setApprovalStatusUpdate(event.target.value)}>
                      {["Needs Approval", "Approved", "Rejected", "On Hold"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Approved By
                    <input value={approvedByUpdate} onChange={(event) => setApprovedByUpdate(event.target.value)} />
                  </label>
                  <label>
                    Health
                    <select value={healthUpdate} onChange={(event) => setHealthUpdate(event.target.value)}>
                      {["Healthy", "Watch", "Attention", "Critical"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Crew Lead
                    <input value={crewLeadUpdate} onChange={(event) => setCrewLeadUpdate(event.target.value)} />
                  </label>
                  <div className="rb-form-section-heading">
                    <span>Lucernex, PO, permits</span>
                  </div>
                  <label>
                    Lucernex Status
                    <select value={lucernexStatusUpdate} onChange={(event) => setLucernexStatusUpdate(event.target.value)}>
                      {reynaldsBrothersLucernexStatuses.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Lucernex Link
                    <input value={lucernexUrlUpdate} onChange={(event) => setLucernexUrlUpdate(event.target.value)} />
                  </label>
                  <label>
                    PO Number
                    <input value={poNumberUpdate} onChange={(event) => setPoNumberUpdate(event.target.value)} />
                  </label>
                  <label>
                    PO Status
                    <select value={poStatusUpdate} onChange={(event) => setPoStatusUpdate(event.target.value)}>
                      {["Missing", "Requested", "Received", "Not Required Yet"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Permit Status
                    <select value={permitStatusUpdate} onChange={(event) => setPermitStatusUpdate(event.target.value)}>
                      {["Not Started", "In Progress", "Submitted", "Approved", "Rejected", "Not required"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Permit Submitted Date
                    <input value={permitSubmittedDateUpdate} onChange={(event) => setPermitSubmittedDateUpdate(event.target.value)} />
                  </label>
                  <label>
                    Permit Approved Date
                    <input value={permitApprovedDateUpdate} onChange={(event) => setPermitApprovedDateUpdate(event.target.value)} />
                  </label>
                  <div className="rb-form-section-heading">
                    <span>Field readiness</span>
                  </div>
                  <label>
                    Tank Status
                    <input value={tankStatusUpdate} onChange={(event) => setTankStatusUpdate(event.target.value)} />
                  </label>
                  <label>
                    Tank Supplier
                    <input value={tankSupplierUpdate} onChange={(event) => setTankSupplierUpdate(event.target.value)} />
                  </label>
                  <label className="rb-wide-field">
                    Tank Serial Numbers
                    <textarea
                      value={tankSerialNumbersUpdate}
                      onChange={(event) => setTankSerialNumbersUpdate(event.target.value)}
                      placeholder="One serial number per line"
                    />
                  </label>
                  <label>
                    Oil Removal Status
                    <select value={oilRemovalStatusUpdate} onChange={(event) => setOilRemovalStatusUpdate(event.target.value)}>
                      {["Not Coordinated", "Requested", "Coordinated", "Confirmed", "Not applicable"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    CompanyCam Link
                    <input value={companyCamUrlUpdate} onChange={(event) => setCompanyCamUrlUpdate(event.target.value)} />
                  </label>
                  <label>
                    Manager Name
                    <input value={managerNameUpdate} onChange={(event) => setManagerNameUpdate(event.target.value)} />
                  </label>
                  <label>
                    Manager Title
                    <input value={managerTitleUpdate} onChange={(event) => setManagerTitleUpdate(event.target.value)} />
                  </label>
                  <label>
                    Signature Status
                    <select value={signatureStatusUpdate} onChange={(event) => setSignatureStatusUpdate(event.target.value)}>
                      {["", "Missing", "Requested", "Captured", "Complete"].map((option) => (
                        <option key={option || "blank"} value={option}>{option || "Not set"}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Vac Truck Company
                    <input value={vacTruckCompanyUpdate} onChange={(event) => setVacTruckCompanyUpdate(event.target.value)} />
                  </label>
                  <label>
                    Disposal Facility
                    <input value={disposalFacilityUpdate} onChange={(event) => setDisposalFacilityUpdate(event.target.value)} />
                  </label>
                  <label>
                    Completion Date
                    <input value={completionDateUpdate} onChange={(event) => setCompletionDateUpdate(event.target.value)} />
                  </label>
                  <div className="rb-form-section-heading">
                    <span>Billing and next action</span>
                  </div>
                  <label>
                    Invoice Status
                    <select value={invoiceStatusUpdate} onChange={(event) => setInvoiceStatusUpdate(event.target.value)}>
                      {["Not Ready", "Blocked", "Ready to Invoice", "Invoice Sent", "Paid"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Billing Approval
                    <select value={billingApprovalStatusUpdate} onChange={(event) => setBillingApprovalStatusUpdate(event.target.value)}>
                      {["Not Started", "Needs Shay Review", "Needs Jeremiah Approval", "Needs Darren Final Approval", "Josh Visibility", "Approved"].map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Customer Update
                    <input value={customerUpdateStatus} onChange={(event) => setCustomerUpdateStatus(event.target.value)} />
                  </label>
                  <label>
                    Next Action
                    <input value={nextActionUpdate} onChange={(event) => setNextActionUpdate(event.target.value)} />
                  </label>
                  <button type="submit">Save Update</button>
                </form>
              </>
            )}
          </aside>
        </section>

        <section className="rb-section">
          <div className="rb-section-heading">
            <div>
              <div className="ros-eyebrow">Email intake</div>
              <h2>File communication under the right job</h2>
            </div>
            <button className="rb-secondary-button" onClick={() => void loadEmailCandidates()} type="button">
              Refresh Email Queue
            </button>
          </div>

          <p className="ros-subtitle">
            WMTanks email should create Needs Approval jobs, file under existing jobs, or land in unmatched review.
            Every email becomes a timeline note; attachments and photos belong under the job.
          </p>

          <form className="rb-email-form" onSubmit={analyzeManualEmail}>
            <input
              required
              value={manualEmailFrom}
              onChange={(event) => setManualEmailFrom(event.target.value)}
              placeholder="From"
            />
            <input
              required
              value={manualEmailSubject}
              onChange={(event) => setManualEmailSubject(event.target.value)}
              placeholder="Email subject"
            />
            <textarea
              value={manualEmailBody}
              onChange={(event) => setManualEmailBody(event.target.value)}
              placeholder="Paste email body or notes"
            />
            <button type="submit">Analyze Email</button>
          </form>

          {emailActionMessage ? <p className="rb-action-message">{emailActionMessage}</p> : null}

          <div className="rb-email-grid">
            {(emailCandidates.length > 0 ? emailCandidates : getPreviewEmailCandidates()).map((email) => (
              <article className="rb-email-card" key={email.id}>
                <div className="rb-email-card-heading">
                  <span className={`rb-email-action ${email.classification.action}`}>
                    {email.classification.action.replaceAll("_", " ")}
                  </span>
                  <span>{email.classification.confidence}</span>
                </div>
                <h3>{email.subject}</h3>
                <p>{email.from}</p>
                <p>{email.snippet ?? email.body ?? "No preview text."}</p>
                {email.classification.matchedWorkItemName ? (
                  <p><strong>Files under:</strong> {email.classification.matchedWorkItemName}</p>
                ) : null}
                {email.classification.suggestedWorkItemName ? (
                  <p><strong>Suggested job:</strong> {email.classification.suggestedWorkItemName}</p>
                ) : null}
                {email.classification.multiStoreFlag ? (
                  <p><strong>Review:</strong> Multiple stores detected: {email.classification.extractedStoreNumbers?.join(", ")}</p>
                ) : null}
                <p><strong>Next:</strong> {email.classification.suggestedNextAction}</p>
                {email.classification.reasons.length > 0 ? (
                  <ul className="rb-email-reasons">
                    {email.classification.reasons.map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="rb-email-actions">
                  {email.classification.action === "create_work_item" ? (
                    <button
                      className="rb-secondary-button"
                      disabled={emailActionPendingId === email.id}
                      onClick={() => void processEmailCandidate(email, "create_work_item")}
                      type="button"
                    >
                      {emailActionPendingId === email.id ? "Creating..." : "Create Approval Job"}
                    </button>
                  ) : null}
                  {email.classification.action === "link_to_work_item" ? (
                    <button
                      className="rb-secondary-button"
                      disabled={emailActionPendingId === email.id}
                      onClick={() => void processEmailCandidate(email, "file_to_existing")}
                      type="button"
                    >
                      {emailActionPendingId === email.id ? "Filing..." : "File Email"}
                    </button>
                  ) : null}
                  {email.classification.action === "needs_review" ? (
                    <span className="rb-review-note">Unmatched queue</span>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rb-section">
          <div className="rb-section-heading">
            <div>
              <div className="ros-eyebrow">Build-out map</div>
              <h2>What Reynalds Brothers needs inside Reynalds OS</h2>
            </div>
          </div>

          <div className="rb-module-grid">
            {systemModules.map((module) => (
              <article className="rb-module" key={module.title}>
                <h3>{module.title}</h3>
                <p>{module.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rb-two-column">
          <article className="rb-section">
            <div className="ros-eyebrow">Office users</div>
            <h2>Access can be delegated</h2>
            <ul className="rb-alert-list">
              {reynaldsBrothersOfficeUsers.map((user, index) => (
                <li key={user}>
                  <strong>{user}</strong>
                  <span>{index === 0 ? "Current approval authority" : "Can be granted approval access later"}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="rb-section">
            <div className="ros-eyebrow">Operating rhythm</div>
            <h2>How the company should run each week</h2>
            <ol className="rb-rhythm">
              {operatingRhythm.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>
        </section>
      </section>
    </main>
  );
}

function getPreviewEmailCandidates(): ReynaldsBrothersEmailCandidate[] {
  return reynaldsBrothersFallbackEmails.map((email, index) => ({
    ...email,
    id: email.providerMessageId ?? `email_preview_${index}`,
    classification: {
      action: "needs_review",
      confidence: "low",
      suggestedNextAction: "Connect email intake to review filing recommendation.",
      reasons: ["Preview queue shown until authenticated email intake is available."]
    } satisfies ReynaldsBrothersEmailClassification
  }));
}

function getServiceLineFromJobType(jobType: string): string {
  if (jobType.includes("ACC") || jobType.includes("DIY")) return "ACC";
  if (jobType.includes("UCO")) return "UCO";
  if (jobType.includes("Pressure")) return "Pressure Washing";
  return "";
}

function getApprovalNextAction(jobType?: string | null): string {
  const normalizedJobType = String(jobType ?? "");

  if (normalizedJobType.includes("Pressure Washing")) return "Secure vac truck company and disposal facility for scheduling.";
  if (normalizedJobType.includes("UCO")) return "Start permitting and confirm Frontline LLC tank order.";
  if (normalizedJobType.includes("ACC Level 2")) return "Dispatch technician for tank photos, vacuum tests, and field findings.";
  if (normalizedJobType.includes("ACC Tank Replacement") || normalizedJobType.includes("DIY")) return "Start permitting, PO tracking, tank assignment, and Lucernex follow-up.";
  if (normalizedJobType.includes("ACC")) return "Call store manager and complete Level 1 triage.";

  return "Begin office planning workflow.";
}

function parseSerialNumbers(input: string): string[] {
  return input
    .split(/\r?\n|,/)
    .map((serial) => serial.trim())
    .filter(Boolean);
}

function createLocalTrialWorkItem(input: ReynaldsBrothersWorkItemCreateInput, idPrefix = "trial_manual"): ReynaldsBrothersWorkItem {
  const id = `${idPrefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  return {
    id,
    objectType: REYNALDS_BROTHERS_WORK_ITEM_TYPE,
    name: input.name,
    status: input.status,
    health: input.health,
    nextAction: input.nextAction,
    data: markTrialWorkItemData(input.data, id)
  };
}

function markTrialWorkItemData(data: ReynaldsBrothersWorkItemData, id: string): ReynaldsBrothersWorkItemData {
  return {
    ...data,
    sourceSystem: data.sourceSystem?.includes("trial") ? data.sourceSystem : "local_trial",
    sourceReferenceId: data.sourceReferenceId ?? id,
    intakeReasons: data.intakeReasons?.length ? data.intakeReasons : ["Stored in browser for first trial."]
  };
}

function loadStoredTrialWorkItems(): ReynaldsBrothersWorkItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = window.localStorage.getItem(trialWorkItemsStorageKey);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(isWorkItemLike);
  } catch {
    return [];
  }
}

function persistStoredTrialWorkItems(items: ReynaldsBrothersWorkItem[]) {
  if (typeof window === "undefined") return;

  const localItems = items.filter(isLocalTrialWorkItem);
  window.localStorage.setItem(trialWorkItemsStorageKey, JSON.stringify(localItems));
}

function mergeWorkItemLists(baseItems: ReynaldsBrothersWorkItem[], overlayItems: ReynaldsBrothersWorkItem[]): ReynaldsBrothersWorkItem[] {
  const byId = new Map<string, ReynaldsBrothersWorkItem>();

  baseItems.forEach((item) => byId.set(item.id, item));
  overlayItems.forEach((item) => byId.set(item.id, item));

  return Array.from(byId.values());
}

function isLocalTrialWorkItem(item: ReynaldsBrothersWorkItem): boolean {
  return item.id.startsWith("trial_") || String(item.data?.sourceSystem ?? "").includes("trial");
}

function isWorkItemLike(input: unknown): input is ReynaldsBrothersWorkItem {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  const value = input as Record<string, unknown>;

  return typeof value.id === "string"
    && typeof value.objectType === "string"
    && typeof value.name === "string"
    && typeof value.status === "string"
    && typeof value.health === "string";
}
