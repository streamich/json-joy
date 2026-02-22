# JSON CRDT collaborative presence

This package provides real-time presence/awareness tracking for `json-joy` JSON
CRDT documents. Presence means UI indications showing _which users_ are actively
collaborating and _what they are doing_ — their cursor positions, text
selections, and generic node selections.

The design is **transport-agnostic**: the package owns the data model,
serialisation, selection construction helpers, and the reactive in-memory
presence manager. It does **not** own networking; the application layer is
responsible for broadcasting/receiving `PeerPresence` messages.
