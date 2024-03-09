# Hybrid Logic Clock

Hybrid logical clock is a 3-tuple of: (1) wall clock; (2) logical sequence
number; and (3) a node session ID. The wall clock is the current time in
milliseconds since the Unix epoch. The logical sequence number is a monotonically
increasing counter that is incremented whenever wall clocks are equal. The node
session ID is a unique identifier for the node generating the HLC.
