export const enum CRDT_MAJOR {
  CON = 0b000,
  VAL = 0b001,
  VEC = 0b010,
  OBJ = 0b011,
  STR = 0b100,
  BIN = 0b101,
  ARR = 0b110,
}

export const enum CRDT_MAJOR_OVERLAY {
  CON = CRDT_MAJOR.CON << 5,
  VAL = CRDT_MAJOR.VAL << 5,
  VEC = CRDT_MAJOR.VEC << 5,
  OBJ = CRDT_MAJOR.OBJ << 5,
  STR = CRDT_MAJOR.STR << 5,
  BIN = CRDT_MAJOR.BIN << 5,
  ARR = CRDT_MAJOR.ARR << 5,
}
