Object encoding size results.

```
================================================================================
Payload: Small object, 44 bytes
================================================================================
json-joy > structural > binary -> 62 bytes
json-joy > structural > binary (server clock) -> 47 bytes
json-joy > structural > compact (CBOR) -> 85 bytes
json-joy > structural > compact (CBOR) (server clock) -> 59 bytes
json-joy > structural > verbose (CBOR) -> 298 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 207 bytes
json-joy > indexed (CBOR) -> 88 bytes
json-joy > indexed (CBOR) (server clock) -> 88 bytes
json-joy > sidecar (CBOR) -> 70 bytes
json-joy > sidecar (CBOR) (server clock) -> 70 bytes
yjs -> 86 bytes
yrs -> 207 bytes
automerge -> 185 bytes
Native JavaScript -> 44 bytes


================================================================================
Payload: Typical object, 993 bytes
================================================================================
json-joy > structural > binary -> 1,155 bytes
json-joy > structural > binary (server clock) -> 1,029 bytes
json-joy > structural > compact (CBOR) -> 1,434 bytes
json-joy > structural > compact (CBOR) (server clock) -> 1,264 bytes
json-joy > structural > verbose (CBOR) -> 3,194 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 2,383 bytes
json-joy > indexed (CBOR) -> 1,423 bytes
json-joy > indexed (CBOR) (server clock) -> 1,423 bytes
json-joy > sidecar (CBOR) -> 1,201 bytes
json-joy > sidecar (CBOR) (server clock) -> 1,201 bytes
yjs -> 1,286 bytes
yrs -> 667 bytes
automerge -> 854 bytes
Native JavaScript -> 999 bytes


================================================================================
Payload: Large object, 3741 bytes
================================================================================
json-joy > structural > binary -> 4,192 bytes
json-joy > structural > binary (server clock) -> 3,916 bytes
json-joy > structural > compact (CBOR) -> 5,022 bytes
json-joy > structural > compact (CBOR) (server clock) -> 4,530 bytes
json-joy > structural > verbose (CBOR) -> 10,432 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 8,011 bytes
json-joy > indexed (CBOR) -> 5,185 bytes
json-joy > indexed (CBOR) (server clock) -> 5,185 bytes
json-joy > sidecar (CBOR) -> 4,329 bytes
json-joy > sidecar (CBOR) (server clock) -> 4,329 bytes
yjs -> 4,628 bytes
yrs -> 667 bytes
automerge -> 2,478 bytes
Native JavaScript -> 3,747 bytes


================================================================================
Payload: Very large object, 45750 bytes
================================================================================
json-joy > structural > binary -> 53,046 bytes
json-joy > structural > binary (server clock) -> 48,648 bytes
json-joy > structural > compact (CBOR) -> 68,879 bytes
json-joy > structural > compact (CBOR) (server clock) -> 60,121 bytes
json-joy > structural > verbose (CBOR) -> 168,990 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 125,229 bytes
json-joy > indexed (CBOR) -> 74,861 bytes
json-joy > indexed (CBOR) (server clock) -> 74,861 bytes
json-joy > sidecar (CBOR) -> 55,823 bytes
json-joy > sidecar (CBOR) (server clock) -> 55,823 bytes
yjs -> 64,412 bytes
yrs -> 114 bytes
automerge -> 9,672 bytes
Native JavaScript -> 45,750 bytes


================================================================================
Payload: Object with many keys, 969 bytes
================================================================================
json-joy > structural > binary -> 1,109 bytes
json-joy > structural > binary (server clock) -> 1,001 bytes
json-joy > structural > compact (CBOR) -> 1,394 bytes
json-joy > structural > compact (CBOR) (server clock) -> 1,197 bytes
json-joy > structural > verbose (CBOR) -> 3,549 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 2,598 bytes
json-joy > indexed (CBOR) -> 1,433 bytes
json-joy > indexed (CBOR) (server clock) -> 1,433 bytes
json-joy > sidecar (CBOR) -> 1,150 bytes
json-joy > sidecar (CBOR) (server clock) -> 1,150 bytes
yjs -> 1,358 bytes
yrs -> 114 bytes
automerge -> 666 bytes
Native JavaScript -> 969 bytes


================================================================================
Payload: String ladder, 4037 bytes
================================================================================
json-joy > structural > binary -> 5,086 bytes
json-joy > structural > binary (server clock) -> 4,897 bytes
json-joy > structural > compact (CBOR) -> 5,598 bytes
json-joy > structural > compact (CBOR) (server clock) -> 5,294 bytes
json-joy > structural > verbose (CBOR) -> 8,818 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 7,337 bytes
json-joy > indexed (CBOR) -> 5,570 bytes
json-joy > indexed (CBOR) (server clock) -> 5,570 bytes
json-joy > sidecar (CBOR) -> 5,176 bytes
json-joy > sidecar (CBOR) (server clock) -> 5,176 bytes
yjs -> 4,581 bytes
yrs -> 4,669 bytes
automerge -> 446 bytes
Native JavaScript -> 4,616 bytes


================================================================================
Payload: Long strings, 7011 bytes
================================================================================
json-joy > structural > binary -> 8,135 bytes
json-joy > structural > binary (server clock) -> 8,094 bytes
json-joy > structural > compact (CBOR) -> 8,225 bytes
json-joy > structural > compact (CBOR) (server clock) -> 8,163 bytes
json-joy > structural > verbose (CBOR) -> 8,820 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 8,549 bytes
json-joy > indexed (CBOR) -> 8,228 bytes
json-joy > indexed (CBOR) (server clock) -> 8,228 bytes
json-joy > sidecar (CBOR) -> 8,159 bytes
json-joy > sidecar (CBOR) (server clock) -> 8,159 bytes
yjs -> 8,054 bytes
yrs -> 8,142 bytes
automerge -> 2,048 bytes
Native JavaScript -> 8,069 bytes


================================================================================
Payload: Short strings, 170 bytes
================================================================================
json-joy > structural > binary -> 277 bytes
json-joy > structural > binary (server clock) -> 212 bytes
json-joy > structural > compact (CBOR) -> 440 bytes
json-joy > structural > compact (CBOR) (server clock) -> 334 bytes
json-joy > structural > verbose (CBOR) -> 1,531 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 1,040 bytes
json-joy > indexed (CBOR) -> 412 bytes
json-joy > indexed (CBOR) (server clock) -> 412 bytes
json-joy > sidecar (CBOR) -> 307 bytes
json-joy > sidecar (CBOR) (server clock) -> 307 bytes
yjs -> 182 bytes
yrs -> 270 bytes
automerge -> 292 bytes
Native JavaScript -> 180 bytes


================================================================================
Payload: Numbers, 331 bytes
================================================================================
json-joy > structural > binary -> 686 bytes
json-joy > structural > binary (server clock) -> 500 bytes
json-joy > structural > compact (CBOR) -> 998 bytes
json-joy > structural > compact (CBOR) (server clock) -> 724 bytes
json-joy > structural > verbose (CBOR) -> 4,304 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 2,973 bytes
json-joy > indexed (CBOR) -> 1,398 bytes
json-joy > indexed (CBOR) (server clock) -> 1,398 bytes
json-joy > sidecar (CBOR) -> 693 bytes
json-joy > sidecar (CBOR) (server clock) -> 693 bytes
yjs -> 244 bytes
yrs -> 334 bytes
automerge -> 347 bytes
Native JavaScript -> 331 bytes


================================================================================
Payload: Tokens, 308 bytes
================================================================================
json-joy > structural > binary -> 497 bytes
json-joy > structural > binary (server clock) -> 330 bytes
json-joy > structural > compact (CBOR) -> 781 bytes
json-joy > structural > compact (CBOR) (server clock) -> 535 bytes
json-joy > structural > verbose (CBOR) -> 3,742 bytes
json-joy > structural > verbose (CBOR) (server clock) -> 2,551 bytes
json-joy > indexed (CBOR) -> 1,130 bytes
json-joy > indexed (CBOR) (server clock) -> 1,130 bytes
json-joy > sidecar (CBOR) -> 504 bytes
json-joy > sidecar (CBOR) (server clock) -> 504 bytes
yjs -> 85 bytes
yrs -> 172 bytes
automerge -> 199 bytes
Native JavaScript -> 308 bytes
```
