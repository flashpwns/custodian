"use strict";
const { initialState } = require("./canonical-kernel.js");
function error(code, details = {}) { return { ok: false, error: { code, details } }; }
function adaptWorldPack(pack) {
  if (pack?.kernel_compatibility !== "canonical-kernel@v1") return error("INCOMPATIBLE_KERNEL_VERSION", { actual: pack?.kernel_compatibility });
  try { initialState(pack); } catch (cause) { return error(cause.code === "invalid_world_pack" ? "INVALID_WORLD_PACK" : "INCOMPATIBLE_KERNEL_VERSION", { code: cause.code ?? "invalid" }); }
  return { ok: true, value: structuredClone(pack), capabilities: structuredClone({ observation: pack.observation_capabilities ?? [], execution: pack.execution_rules ?? [] }) };
}
module.exports = { adaptWorldPack, error };
