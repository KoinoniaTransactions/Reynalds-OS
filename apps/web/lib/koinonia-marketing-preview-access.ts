/** Pure authorization rule for the isolated marketing Preview report. */
export function checkMarketingPreviewAccess(role: string, workspaceId: string):
  { allowed: true } | { allowed: false; error: string } {
  if (role !== "Owner" && role !== "Admin") {
    return { allowed: false, error: "Marketing administrator access required." };
  }
  if (workspaceId !== "wks_koinonia") {
    return { allowed: false, error: "Wrong workspace." };
  }
  return { allowed: true };
}
