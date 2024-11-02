import {JsonCrdtDataType} from '../../../../json-crdt-patch/constants';

export enum CRDT_MAJOR {
  CON = JsonCrdtDataType.con,
  VAL = JsonCrdtDataType.val,
  OBJ = JsonCrdtDataType.obj,
  VEC = JsonCrdtDataType.vec,
  STR = JsonCrdtDataType.str,
  BIN = JsonCrdtDataType.bin,
  ARR = JsonCrdtDataType.arr,
}

export enum CRDT_MAJOR_OVERLAY {
  CON = JsonCrdtDataType.con << 5,
  VAL = CRDT_MAJOR.VAL << 5,
  VEC = CRDT_MAJOR.VEC << 5,
  OBJ = CRDT_MAJOR.OBJ << 5,
  STR = CRDT_MAJOR.STR << 5,
  BIN = CRDT_MAJOR.BIN << 5,
  ARR = CRDT_MAJOR.ARR << 5,
}
