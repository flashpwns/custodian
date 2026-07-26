# Reference convergence world pack

This intentionally generic pack is the Milestone 10.5 proof world. It supplies
only declarative initial objective state and registered deterministic rule names.
The kernel owns commitment, ordering, reduction, projection, and replay. A pack
cannot mutate a projection, create knowledge, or emit narration; its rules may
only request declared committed event types through the kernel.
