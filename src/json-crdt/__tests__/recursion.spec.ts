import {Model} from '../model';

describe('recursive node references are not allowed', () => {
  describe('arr', () => {
    describe('ins_arr', () => {
      test('reference to parent object in same patch', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const objId = builder.obj();
        const arrId = builder.arr();
        builder.insObj(objId, [['arr', arrId]]);
        builder.insArr(arrId, arrId, [builder.con(1), objId]);
        builder.root(objId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        expect(model.view()).toStrictEqual({arr: [1]});
      });

      test('reference to parent object in second patch', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const objId = builder.obj();
        const arrId = builder.arr();
        builder.insObj(objId, [['arr', arrId]]);
        builder.insArr(arrId, arrId, [builder.con(1)]);
        builder.root(objId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        builder.insArr(arrId, arrId, [objId]);
        const patch2 = builder.flush();
        model.applyPatch(patch2);
        expect(model.view()).toStrictEqual({arr: [1]});
      });
    });
  });

  describe('obj', () => {
    describe('ins_obj', () => {
      test('reference to object self in own key', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const objId = builder.obj();
        builder.insObj(objId, [
          ['con', builder.con(2)],
          ['obj', objId],
        ]);
        builder.root(objId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        expect(model.view()).toStrictEqual({con: 2});
      });

      test('reference to object self in own key in separate patch', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const objId = builder.obj();
        builder.insObj(objId, [['con', builder.con(2)]]);
        builder.root(objId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        builder.insObj(objId, [['obj', objId]]);
        const patch2 = builder.flush();
        model.applyPatch(patch2);
        expect(model.view()).toStrictEqual({con: 2});
      });
    });
  });

  describe('vec', () => {
    describe('ins_vec', () => {
      test('reference to parent object in same patch', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const vecId = builder.vec();
        builder.insVec(vecId, [
          [0, builder.con(1)],
          [1, vecId],
        ]);
        builder.root(vecId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        expect(model.view()).toStrictEqual([1]);
      });

      test('reference to parent object in second patch', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const vecId = builder.vec();
        builder.insVec(vecId, [
          [0, builder.con(1)],
          [1, vecId],
        ]);
        builder.root(vecId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        builder.insVec(vecId, [[1, vecId]]);
        const patch2 = builder.flush();
        model.applyPatch(patch2);
        expect(model.view()).toStrictEqual([1]);
      });
    });
  });

  describe('val', () => {
    describe('ins_val', () => {
      test('reference to parent object in second patch', () => {
        const model = Model.create();
        const builder = model.api.builder;
        const objId = builder.obj();
        const valId = builder.val();
        builder.insObj(objId, [['val', valId]]);
        builder.root(objId);
        const patch1 = builder.flush();
        model.applyPatch(patch1);
        expect((model.view() as any).val).toStrictEqual(undefined);
        builder.setVal(valId, objId);
        const patch2 = builder.flush();
        model.applyPatch(patch2);
        expect((model.view() as any).val).toStrictEqual(undefined);
      });
    });
  });
});
