### Overview

There are multiple iterations of the External Data Representation (XDR) codec specifications, primarily documented in three RFCs: RFC 1014 (June 1987), RFC 1832 (August 1995), and RFC 4506 (May 2006). XDR is a standard for describing and encoding data in a machine-independent format, enabling portable data transfer across different computer architectures (e.g., big-endian vs. little-endian systems like SUN WORKSTATION, VAX, IBM-PC, and Cray). It operates at the ISO presentation layer, using implicit typing and a C-like language for data descriptions. All versions maintain core principles: big-endian byte order, 4-byte alignment with zero-padding, and support for common data types from high-level languages. RFC 1832 obsoleted RFC 1014 to reflect deployment experiences and add features like quadruple-precision floating-point. RFC 4506 obsoleted RFC 1832 with no technical changes to the protocol but added IANA considerations, security guidance, and minor corrections. While other RFCs (e.g., RFC 7531 for NFSv4.0 XDR descriptions) reference or embed XDR for specific protocols, they do not redefine the core XDR standard.

### Key Differences Between RFC 1014 and RFC 1832

RFC 1832 updated the XDR standard based on real-world deployment, formalizing elements, adding new data types, and clarifying encodings without breaking compatibility. It obsoleted RFC 1014 by providing a more precise and comprehensive specification. Notable changes include:

- **Addition of Quadruple-Precision Floating-Point**: Introduced a new 128-bit type (quadruple) with a 1-bit sign, 15-bit biased exponent (bias 16383), and 112-bit fraction, analogous to IEEE double-extended format. This was absent in RFC 1014, which only supported 32-bit float and 64-bit double.
- **Enhanced Floating-Point Details**: Expanded on IEEE 754-1985 compliance, including explicit definitions for NaN (signaling/quiet, system-dependent), signed zero, infinity, and denormals/subnormals in appendices. RFC 1014 provided basic float/double descriptions but with less detail on edge cases.
- **Formalization of Optional-Data Type**: Newly defined special syntax (`type-name *identifier;`) for handling optional or recursive data (e.g., linked lists), equivalent to a bool-discriminated union or variable-length array<1>. This improved clarity over RFC 1014's implicit equivalents.
- **Language and Syntax Updates**: More precise extended Backus-Naur Form (BNF) grammar, lexical rules (e.g., comments, whitespace, case-sensitive identifiers), and constraints (e.g., unsigned constants for sizes, unique names in structs/unions, integer-only discriminants). Added preferred typedef syntax for struct/enum/union declarations. RFC 1014 had a similar but less detailed language spec.
- **Areas for Future Enhancement**: Explicit section noting lacks (e.g., bit fields, bitmaps, packed decimals) and potential extensions (variable block sizes/byte orders), not present in RFC 1014.
- **Discussion and Examples**: Expanded rationale for design choices (e.g., 4-byte units, no explicit typing); added a full "file" structure example with hex/ASCII encoding. Updated references (e.g., added RFC 1831 for ONC RPC) and trademarks.
- **Status Changes**: Advanced to Standards Track; added security considerations (none substantive); clarified assumptions like portable bytes.
- Core elements like data types (int, hyper, opaque, string, arrays, structures, unions, void), big-endian order, and 4-byte padding remained consistent, but RFC 1832 emphasized deployment status and resolved ambiguities.

### Key Differences Between RFC 1832 and RFC 4506

RFC 4506 made no technical alterations to the XDR wire format, data types, or encoding rules, ensuring full backward compatibility. It obsoleted RFC 1832 primarily for administrative updates, reflecting IETF practices, and added non-normative guidance. Key updates include:

- **IANA Considerations**: New section requiring standards-track RFCs for adding data types, with documentation in the RFC Editor's database. No immediate IANA registries were established, unlike RFC 1832's lack of such provisions.
- **Security Considerations**: Expanded to highlight risks such as buffer overflows (recommend explicit bounds with "<value>"), memory leaks from nul octets in strings, illegal characters (e.g., '/' in filenames), and denial-of-service via recursive structures (suggest non-recursive decoders or limits). Emphasized that protocols like NFSv4 handle higher-level security. RFC 1832 had minimal security notes.
- **References**: Distinguished normative (only IEEE 754-1985) from informative (added [KERN], [COHE], etc.); reproduced full IEEE definitions for convenience, including quadruple-precision analogs.
- **Minor Corrections**: Fixed errors identified by reviewers (e.g., Peter Astrand, Bryan Olson) from RFC 1832, such as clarifications in descriptions.
- **Additional Sections**: Updated trademarks/owners list; expanded acknowledgements to credit original contributors like Bob Lyon and Raj Srinivasan.
- All core features—data types (including quadruple), encoding rules (big-endian, 4-byte alignment, zero-padding), language syntax, and examples—remained identical to RFC 1832.
