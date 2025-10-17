# Record Marking (RM) Protocol

Implements rm/tcp/ip protocol Record Marking (RM) Standard as specified in RFC 1057.
The RM standard splits a byte stream into discrete messages by prefixing each
message with a 4-byte header.

Excerpt from RFC 1057, Section 10:

```
10. RECORD MARKING STANDARD

   When RPC messages are passed on top of a byte stream transport
   protocol (like TCP), it is necessary to delimit one message from
   another in order to detect and possibly recover from protocol errors.
   This is called record marking (RM).  Sun uses this RM/TCP/IP
   transport for passing RPC messages on TCP streams.  One RPC message
   fits into one RM record.

   A record is composed of one or more record fragments.  A record



Sun Microsystems                                               [Page 18]

RFC 1057            Remote Procedure Call, Version 2           June 1988


   fragment is a four-byte header followed by 0 to (2**31) - 1 bytes of
   fragment data.  The bytes encode an unsigned binary number; as with
   XDR integers, the byte order is from highest to lowest.  The number
   encodes two values -- a boolean which indicates whether the fragment
   is the last fragment of the record (bit value 1 implies the fragment
   is the last fragment) and a 31-bit unsigned binary value which is the
   length in bytes of the fragment's data.  The boolean value is the
   highest-order bit of the header; the length is the 31 low-order bits.
   (Note that this record specification is NOT in XDR standard form!)
```
