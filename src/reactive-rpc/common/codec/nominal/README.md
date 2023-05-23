# `nominal` codec for Reactive-RPC messages

`nominal` codec specifies, in principle, what messages and what fields exist in
Reactive-RPC protocol.

| No.       | Message                | Message ID   | Method name | Payload    |
|-----------|------------------------|--------------|-------------|------------|
| 1         | Notification           | No           | Yes         | Maybe      |
| 2         | Request Data           | Yes          | Yes         | Yes        |
| 3         | Request Complete       | Yes          | Maybe       | Maybe      |
| 4         | Request Error          | Yes          | Maybe       | Yes        |
| 5         | Request Un-subscribe   | Yes          | No          | No         |
| 6         | Response Data          | Yes          | No          | Yes        |
| 7         | Response Complete      | Yes          | No          | Maybe      |
| 8         | Response Error         | Yes          | No          | Yes        |
| 9         | Response Un-subscribe  | Yes          | No          | No         |
