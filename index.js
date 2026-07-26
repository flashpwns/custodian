"use strict";
const session = require("./runtime/session-api.js");
const { adaptWorldPack } = require("./runtime/world-pack-adapter.js");
const { validateWorldPackConformance } = require("./runtime/world-pack-conformance.js");
const { stable } = require("./runtime/canonical-kernel.js");
module.exports = Object.freeze({ ...session, adaptWorldPack, validateWorldPackConformance, stableSerialize: stable, PUBLIC_API_VERSION: "custodian-public-api@v1", PUBLIC_ERROR_CODES: Object.freeze(["INVALID_WORLD_PACK", "INCOMPATIBLE_KERNEL_VERSION", "INVALID_SCENARIO", "INVALID_SESSION", "CORRUPTED_HISTORY", "PROJECTION_IDENTITY_MISMATCH", "SESSION_COMPLETE", "INVALID_TICK_REQUEST", "INVALID_CONFORMANCE_REQUEST"]) });
