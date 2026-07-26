# World-pack boundary

The Custodian Constitutional Kernel owns event commitment, ordering, reduction,
projection, provenance, and constitutional information boundaries. The World Pack
API lets a world pack declare identity, version,
kernel compatibility, initial objective state, vocabulary, templates, topology,
resources, hazards, affordances, scenarios, and registered deterministic rule
names.

A world pack may declare deterministic execution rules: preconditions, exclusive
conflict keys, outcome reasons, and typed effect requests. The kernel validates
and materializes those requests as canonical events. A world pack may not mutate
projections directly, bypass reducer
ownership, create observer knowledge automatically, create narration as truth,
depend on ambient I/O, or use uncontrolled randomness during reduction.

The `reference-convergence` pack is deliberately generic. It is not the Kane
Pixels Backrooms pack and demonstrates the stable interface without asserting new
canon.

The Public Session API uses the World-Pack Runtime Adapter before handing a pack
to the Constitutional Director. Consumers never execute world-pack code or call
reducers directly; only validated declarative content crosses the boundary.
