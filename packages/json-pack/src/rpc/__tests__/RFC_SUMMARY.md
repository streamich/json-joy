### Overview

The Remote Procedure Call (RPC) protocol specifications in RFC 1057, RFC 1831, and RFC 5531 all describe Version 2 of the ONC RPC protocol, originally developed by Sun Microsystems. RFC 1057 (published in 1988) introduced Version 2, obsoleting the earlier Version 1 (RFC 1050). RFC 1831 (1995) updated and obsoleted RFC 1057 with enhancements for better interoperability and scalability. RFC 5531 (2009) further obsoleted RFC 1831, advancing it to Internet Standard status with clarifications, security updates, and administrative changes, but without altering the underlying wire protocol. All versions maintain core elements like transport independence, XDR-based data representation, and support for programs, versions, and procedures. The differences primarily involve refinements in data handling, authentication, error management, and administration.

### Key Differences Between RFC 1057 and RFC 1831

RFC 1831 built on RFC 1057 by addressing deployment experiences, improving efficiency, and standardizing elements for broader use. Notable changes include:

- **Data Representation and Size Limits**: RFC 1831 references updated XDR (RFC 1832) to support larger opaque authentication bodies (up to 400 bytes) and fragment sizes in record marking (up to 2^31-1 bytes for stream transports like TCP), overcoming limitations in RFC 1057 for handling bigger messages.
- **Batching Support**: Explicitly defined in RFC 1831 as a feature for pipelining sequences of calls without immediate replies over reliable transports (terminated by a standard call), which was less detailed and formalized in RFC 1057.
- **Broadcast and Multicast RPC**: RFC 1831 added explicit support for multicast RPC over packet-based protocols like UDP, extending the broadcast capabilities mentioned in RFC 1057 (where servers respond only on success).
- **Authentication Mechanisms**:
  - RFC 1831 introduced AUTH_SHORT (flavor 2) for shorthand credentials to reduce bandwidth via caching, which was present but less emphasized in RFC 1057.
  - Standardized naming: AUTH_NULL became AUTH_NONE (0), AUTH_UNIX became AUTH_SYS (1), and AUTH_DES (3) was refined but moved to optional status.
  - Clearer structures for opaque_auth and extensible flavors, with central assignment via rpc@sun.com.
- **Program Number Assignment**: Updated ranges in RFC 1831 (e.g., 0-1fffffff for defined, 20000000-3fffffff for user-defined, 40000000-5fffffff for transient), with more organized administration compared to RFC 1057's simpler scheme.
- **Error Handling and Message Structure**: More precise enums for accept_stat and auth_stat, expanded rejection reasons, and a formal record marking standard for TCP to improve error recovery—enhancements over RFC 1057's basic handling.
- **RPC Language Syntax**: RFC 1831 added notes on name spaces, constants, and syntax rules (e.g., unsigned constants only), formalizing what was less explicit in RFC 1057.
- **Other Enhancements**: References to updated standards (e.g., RFC 1700 for assigned numbers) and better interoperability for multiple program versions, while remaining backward-compatible.

### Key Differences Between RFC 1831 and RFC 5531

RFC 5531 focused on clarifications, security improvements, and transitioning administration to IANA, without changing the protocol's on-the-wire behavior. It reflects over a decade of deployment experience and aligns with modern IETF practices. Key updates include:

- **Administrative Changes**:
  - Authority for assigning program numbers, authentication flavors, and status numbers shifted from Sun Microsystems to IANA, with new policies (e.g., First Come First Served for small blocks, Specification Required for larger ones).
  - Added Appendix B for requesting assignments and Appendix C listing existing Sun-assigned numbers (e.g., portmapper=100000, NFS=100003), plus detailed ranges like 0x20000000-0x3fffffff for site-specific use.
- **Authentication Mechanisms**:
  - Expanded flavors: Added AUTH_DH (3, marked obsolete and insecure per RFC 2695), AUTH_KERB (4), AUTH_RSA (5), RPCSEC_GSS (6 for GSS-based security with integrity/privacy per RFC 2203 and RFC 5403), and pseudo-flavors like AUTH_SPNEGO (390000 series for Kerberos V5 per RFC 2623)—beyond RFC 1831's AUTH_NONE, AUTH_SYS, and AUTH_SHORT.
  - New authentication errors in auth_stat enum (e.g., RPCSEC_GSS_CREDPROBLEM=13, RPCSEC_GSS_CTXPROBLEM=14) for RPCSEC_GSS support.
  - AUTH_SYS lacks a verifier and SHOULD NOT be used for modifiable data; future Standards Track RPC programs MUST support RPCSEC_GSS.
- **Security Considerations**: Enhanced section emphasizing risks of weak flavors (e.g., AUTH_NONE, AUTH_SYS) and mandating stronger security for new services. Recommends external measures like privileged ports and aligns with RFC 2623 for NFS security—more comprehensive than RFC 1831's basic notes.
- **RPC Language and Protocol Clarifications**:
  - Aligned syntax with current usage (e.g., single type-specifier per argument, use structs for multiples; explicit identifier and constant rules).
  - Refined error handling (e.g., added SYSTEM_ERR=5 to accept_stat for issues like memory allocation; clearer xid usage for deduplication only).
  - Updated XDR reference to RFC 4506 (STD 67) and requirements language per RFC 2119 (MUST/SHOULD keywords).
- **Other Updates**: Incorporated IETF intellectual property statements, normative references (e.g., TCP per RFC 793, UDP per RFC 768), and formalizations for batching/broadcast without protocol changes. No new features, but improved precision for transports and semantics.
