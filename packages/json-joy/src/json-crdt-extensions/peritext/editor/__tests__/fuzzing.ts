import {Fuzzer} from '@jsonjoy.com/util/lib/Fuzzer';
import {RandomJson} from '@jsonjoy.com/json-random';
import type {ViewRange, ViewSlice} from '../types';
import {SliceHeaderShift, SliceStacking} from '../../slice/constants';
import {Anchor} from '../../rga/constants';
import type {SliceType, SliceTypeCompositeStep, SliceTypeStep, TypeTag} from '../../slice';

export interface ViewRangeGeneratorOpts {
  text: string;
  formattingCount: number;
  markerCount: number;
}

export class ViewRangeGenerator {
  public static readonly generate = (opts: Partial<ViewRangeGeneratorOpts> = {}): ViewRange => {
    const generator = new ViewRangeGenerator(opts);
    return generator.generate();
  };

  public readonly opts: ViewRangeGeneratorOpts;
  public text: string;

  constructor(opts: Partial<ViewRangeGeneratorOpts>) {
    this.opts = {
      text: opts.text ?? RandomJson.genString(Fuzzer.randomInt(20, 100)),
      formattingCount: opts.formattingCount ?? Fuzzer.randomInt(0, 10),
      markerCount: opts.markerCount ?? Fuzzer.randomInt(0, 10),
    };
    this.text = this.opts.text;
  }

  public generateFormatting(): ViewSlice {
    const length = this.text.length;
    let start = Fuzzer.randomInt(0, length - 1);
    let end = Fuzzer.randomInt(start + 1, length);
    const stacking = Fuzzer.pick([SliceStacking.One, SliceStacking.Many]);
    let anchorStart = Anchor.Before;
    if (start > 0 && Fuzzer.randomInt(0, 1)) {
      anchorStart = Anchor.After;
      start--;
    }
    let anchorEnd = Anchor.After;
    if (end < length && Fuzzer.randomInt(0, 1)) {
      anchorEnd = Anchor.Before;
      end++;
    }
    const header: number =
      (stacking << SliceHeaderShift.Stacking) +
      (anchorStart << SliceHeaderShift.X1Anchor) +
      (anchorEnd << SliceHeaderShift.X2Anchor);
    const tag: TypeTag = this.generateTag();
    const slice: ViewSlice = [header, start, end - 1, tag];
    if (Fuzzer.randomInt(0, 1)) slice.push(this.generateData());
    return slice;
  }

  public generateMarker(pos: number): ViewSlice {
    this.text = this.text.slice(0, pos) + '\n' + this.text.slice(pos);
    const header: number =
      (SliceStacking.Marker << SliceHeaderShift.Stacking) +
      (Anchor.Before << SliceHeaderShift.X1Anchor) +
      (Anchor.Before << SliceHeaderShift.X2Anchor);
    const type: SliceType = Fuzzer.pick([
      () => this.generateTag(),
      () => {
        const length = Fuzzer.randomInt(1, 4);
        const steps: SliceTypeStep[] = [];
        for (let i = 0; i < length; i++) {
          const step: SliceTypeStep = Fuzzer.pick([
            () => this.generateTag(),
            () => {
              const tag = this.generateTag();
              const step: SliceTypeCompositeStep = [tag] as any;
              if (Fuzzer.randomInt(0, 1)) {
                step.push(Fuzzer.randomInt(0, 3));
                if (Fuzzer.randomInt(0, 1)) step.push(this.generateData() as any);
              }
              return step;
            },
          ])();
          steps.push(step);
        }
        return steps;
      },
    ])();
    const slice: ViewSlice = [header, pos, pos, type];
    if (Fuzzer.randomInt(0, 1)) slice.push(this.generateData());
    return slice;
  }

  protected generateTag(): TypeTag {
    const tag: TypeTag = Fuzzer.pick([
      () => Fuzzer.randomInt(-64, 64),
      () => RandomJson.genString(Fuzzer.randomInt(1, 8)),
    ])();
    return tag;
  }

  protected generateData(): unknown {
    return RandomJson.generate({nodeCount: Fuzzer.randomInt(1, 4)});
  }

  public generate(): ViewRange {
    const slices: ViewRange[2] = [];
    const maxMarkerCount = this.opts.markerCount;
    let positions: number[] = [];
    for (let i = 0; i < maxMarkerCount; i++) positions.push(Fuzzer.randomInt(0, this.text.length));
    positions = [...new Set(positions)].sort((a, b) => a - b);
    for (let i = 0; i < positions.length; i++) slices.push(this.generateMarker(positions[i] + i));
    for (let i = 0; i < this.opts.formattingCount; i++) slices.push(this.generateFormatting());
    return [this.text, 0, slices];
  }
}
