# RPC

## Client scenarios

- [ ] Request observable errors, before emitting any data.
      The error must be sent to the server.
- [ ] Request observable completes successfully, then response observable
      completes successfully.
- [ ] Response observable completes with a single data payload message.
- [ ] User unsubscribes from response observable.
- [ ] Response observable errors.
- [ ] Response observable completes, before request observable completes. Then
      request observable should still continue streaming until it complets.
- [ ] Once request and response, both observables, complete RPC call entry
      should be garbage collected.
