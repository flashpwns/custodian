"use strict";
const { stable, digest } = require("./canonical-kernel.js");
const { adaptWorldPack } = require("./world-pack-adapter.js");
const { createSession, advanceSession, exportSession, restoreSession } = require("./session-api.js");
function validateWorldPackConformance({ world_pack, scenarios = [] }) {
  if (!Array.isArray(scenarios)) {
    const error = { code: "INVALID_CONFORMANCE_REQUEST", details: { field: "scenarios" } };
    return { ok: false, pack: null, checks: ["request"], errors: [error], serialization: stable({ ok: false, error }) };
  }
  const adapted = adaptWorldPack(world_pack); if (!adapted.ok) return { ok: false, pack: null, checks: ["manifest", "kernel_compatibility"], errors: [adapted.error], serialization: stable({ ok: false, error: adapted.error }) };
  const reports = [];
  for (const item of [...scenarios].sort((a, b) => String(a?.scenario?.id ?? "").localeCompare(String(b?.scenario?.id ?? "")))) {
    const scenario = item?.scenario ?? {};
    const scenarioId = typeof scenario.id === "string" ? scenario.id : "";
    const created = createSession({ world_pack: adapted.value, scenario, seed_material: item?.seed_material ?? {} });
    if (!created.ok) { reports.push({ id: scenarioId, ok: false, error: created.error }); continue; }
    let session = created.session; const ticks = Array.isArray(item?.ticks) ? item.ticks : [];
    let advanced = null;
    for (const tick of ticks) { advanced = advanceSession({ session, tick }); if (!advanced.ok) break; session = advanced.session; }
    const exported = exportSession(session), restored = exported.ok ? restoreSession(exported.envelope) : exported;
    const continuation = {
      id: `conformance-continuation-${scenarioId}`,
      at: (ticks.reduce((latest, tick) => Math.max(latest, tick.at ?? 0), 0) + 1),
      observers: [...scenario.observers].map((observer) => ({ ...observer, goals: [], plans: [] }))
    };
    const originalContinuation = restored.ok && !session.complete ? advanceSession({ session, tick: continuation }) : null;
    const restoredContinuation = restored.ok && !restored.session.complete ? advanceSession({ session: restored.session, tick: continuation }) : null;
    const continuationEquivalent = originalContinuation && restoredContinuation
      ? originalContinuation.ok && restoredContinuation.ok && stable(originalContinuation.session) === stable(restoredContinuation.session)
      : restored.ok;
    const itemReport = {
      id: scenarioId,
      ok: Boolean((advanced?.ok ?? true) && exported.ok && restored.ok && continuationEquivalent),
      session_id: session.id,
      projection_identity: session.projection.identity,
      restored_equivalent: restored.ok ? stable(restored.session) === stable(session) : false,
      continuation_equivalent: continuationEquivalent
    };
    const itemError = advanced?.ok === false ? advanced.error : restored.ok ? null : restored.error;
    if (itemError) itemReport.error = itemError;
    reports.push(itemReport);
  }
  const report = { ok: reports.every((item) => item.ok && item.restored_equivalent), pack: { id: adapted.value.id, version: adapted.value.version, kernel_compatibility: adapted.value.kernel_compatibility, identity: `pack-${digest(adapted.value)}` }, contract_versions: ["world-pack/v1", "scenario/v1", "session-export/v1"], capabilities: adapted.capabilities, checks: ["manifest", "identity", "kernel_compatibility", "capabilities", "canonicalization", "session_creation", "advancement", "export", "restore", "continuation"], scenarios: reports, errors: reports.filter((item) => !item.ok).map((item) => item.error) };
  return { ...report, serialization: stable(report) };
}
module.exports = { validateWorldPackConformance };
