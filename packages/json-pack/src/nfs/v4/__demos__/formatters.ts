// tslint:disable:no-console
import * as v4 from '..';

console.log('=== Testing NFSv4 Formatters ===\n');

console.log('--- Constants Formatters ---');
console.log('Nfsv4Stat.NFS4_OK:', v4.formatNfsv4Stat(v4.Nfsv4Stat.NFS4_OK));
console.log('Nfsv4Stat.NFS4ERR_NOENT:', v4.formatNfsv4Stat(v4.Nfsv4Stat.NFS4ERR_NOENT));
console.log('Nfsv4Op.GETATTR:', v4.formatNfsv4Op(v4.Nfsv4Op.GETATTR));
console.log('Nfsv4Op.SETATTR:', v4.formatNfsv4Op(v4.Nfsv4Op.SETATTR));
console.log('Nfsv4FType.NF4REG:', v4.formatNfsv4FType(v4.Nfsv4FType.NF4REG));
console.log('Nfsv4FType.NF4DIR:', v4.formatNfsv4FType(v4.Nfsv4FType.NF4DIR));
console.log();

console.log('--- Attribute Formatters ---');
console.log('FATTR4_TYPE:', v4.formatNfsv4Attr(v4.Nfsv4Attr.FATTR4_TYPE));
console.log('FATTR4_SIZE:', v4.formatNfsv4Attr(v4.Nfsv4Attr.FATTR4_SIZE));
console.log('FATTR4_MODE:', v4.formatNfsv4Attr(v4.Nfsv4Attr.FATTR4_MODE));
console.log();

console.log('--- Bitmap Formatter ---');
const bitmap = new v4.Nfsv4Bitmap([0x0000001e]);
console.log('Bitmap [0x0000001E]:', v4.formatNfsv4Bitmap(bitmap));
const bitmap2 = new v4.Nfsv4Bitmap([0x00000012]);
console.log('Bitmap [0x00000012]:', v4.formatNfsv4Bitmap(bitmap2));
console.log();

console.log('--- Access Flags Formatter ---');
console.log('READ|LOOKUP:', v4.formatNfsv4Access(v4.Nfsv4Access.ACCESS4_READ | v4.Nfsv4Access.ACCESS4_LOOKUP));
console.log('MODIFY|EXTEND:', v4.formatNfsv4Access(v4.Nfsv4Access.ACCESS4_MODIFY | v4.Nfsv4Access.ACCESS4_EXTEND));
console.log();

console.log('--- Mode Formatter ---');
console.log('0755:', v4.formatNfsv4Mode(0o755));
console.log('0644:', v4.formatNfsv4Mode(0o644));
console.log();

console.log('--- Request Formatters ---');
const getattrReq = new v4.Nfsv4GetattrRequest(new v4.Nfsv4Bitmap([0x0000001e]));
console.log('GETATTR request:', v4.formatNfsv4Request(getattrReq));

const setattrReq = new v4.Nfsv4SetattrRequest(
  new v4.Nfsv4Stateid(0, new Uint8Array(12)),
  new v4.Nfsv4Fattr(new v4.Nfsv4Bitmap([0x00000010]), new Uint8Array(8)),
);
console.log('SETATTR request:', v4.formatNfsv4Request(setattrReq));

const lookupReq = new v4.Nfsv4LookupRequest('file.txt');
console.log('LOOKUP request:', v4.formatNfsv4Request(lookupReq));

const accessReq = new v4.Nfsv4AccessRequest(v4.Nfsv4Access.ACCESS4_READ | v4.Nfsv4Access.ACCESS4_EXECUTE);
console.log('ACCESS request:', v4.formatNfsv4Request(accessReq));
console.log();

console.log('--- Response Formatters ---');
const getattrRes = new v4.Nfsv4GetattrResponse(
  v4.Nfsv4Stat.NFS4_OK,
  new v4.Nfsv4GetattrResOk(new v4.Nfsv4Fattr(new v4.Nfsv4Bitmap([0x0000001e]), new Uint8Array(32))),
);
console.log('GETATTR response:', v4.formatNfsv4Response(getattrRes));

const setattrRes = new v4.Nfsv4SetattrResponse(
  v4.Nfsv4Stat.NFS4_OK,
  new v4.Nfsv4SetattrResOk(new v4.Nfsv4Bitmap([0x00000010])),
);
console.log('SETATTR response:', v4.formatNfsv4Response(setattrRes));

const lookupRes = new v4.Nfsv4LookupResponse(v4.Nfsv4Stat.NFS4_OK);
console.log('LOOKUP response:', v4.formatNfsv4Response(lookupRes));

const accessRes = new v4.Nfsv4AccessResponse(
  v4.Nfsv4Stat.NFS4_OK,
  new v4.Nfsv4AccessResOk(0x3f, v4.Nfsv4Access.ACCESS4_READ | v4.Nfsv4Access.ACCESS4_EXECUTE),
);
console.log('ACCESS response:', v4.formatNfsv4Response(accessRes));
console.log();

console.log('--- Compound Request/Response Formatters ---');
const compoundReq = new v4.Nfsv4CompoundRequest('test', 0, [new v4.Nfsv4PutrootfhRequest(), lookupReq, getattrReq]);
console.log('COMPOUND request:', v4.formatNfsv4CompoundRequest(compoundReq));

const compoundRes = new v4.Nfsv4CompoundResponse(v4.Nfsv4Stat.NFS4_OK, 'test', [
  new v4.Nfsv4PutrootfhResponse(v4.Nfsv4Stat.NFS4_OK),
  lookupRes,
  getattrRes,
]);
console.log('COMPOUND response:', v4.formatNfsv4CompoundResponse(compoundRes));

console.log('\n=== All formatters tested successfully! ===');
