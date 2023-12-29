import {WsFrameDecoder} from '../WsFrameDecoder';
import {WsFrameOpcode} from '../constants';
import {WsCloseFrame, WsFrameHeader, WsPingFrame, WsPongFrame} from '../frames';

const {frame: WebSocketFrame} = require('websocket');

describe('data frames', () => {
  test('can read final text packet with mask', () => {
    const buf = Buffer.from(
      new Uint8Array([
        129,
        136, // Header
        136,
        35,
        93,
        205, // Mask
        231,
        85,
        56,
        191,
        177,
        19,
        109,
        253, // Payload
      ]),
    );
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(8);
    expect(frame.mask).toEqual([136, 35, 93, 205]);
    expect(dst.toString()).toBe('over9000');
  });

  test('can decode multiple chunks', () => {
    const decoder = new WsFrameDecoder();
    const chunks: string[] = [
      'gpbMadbAlzLn7P1F9LW4ALruvAC4p+5Frb2RNA==',
      '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y1VBGNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGEdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGENZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGE9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGEtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGFdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGFNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGF9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGFtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGGdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VGGNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHEdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHENZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHE9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHEtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHFdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHFNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHF9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHFtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHGdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VHGNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEEdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEENZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEE9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEEtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEFdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEFNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEF9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEFtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEGdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VEGNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFEdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFENZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFE9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFEtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFFdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFFNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFF9ZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFFtZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFGdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VFGNZFB1WTC1xRkwkVA9YcD3zWPEMNy1VKEdZFB1WTC1xRkwkVA9YcD3zWPEMNy1VKENZFB1WTC1xRkwkVA9YcD3yn',
    ];
    for (const chunk of chunks) {
      const buf = Buffer.from(chunk, 'base64');
      decoder.push(buf);
    }
    const frames: WsFrameHeader[] = [];
    const payloads: Uint8Array[] = [];
    let currentFrame: WsFrameHeader | undefined;
    while (true) {
      if (currentFrame) {
        const length = currentFrame.length;
        if (length <= decoder.reader.size()) {
          const buf = new Uint8Array(length);
          decoder.copyFrameData(currentFrame, buf, 0);
          payloads.push(buf);
          currentFrame = undefined;
        } else break;
      }
      const frame = decoder.readFrameHeader();
      if (!frame) break;
      else if (frame instanceof WsFrameHeader) {
        frames.push(frame);
        if (frame.length) currentFrame = frame;
      }
    }
    expect(frames.length).toBe(5);
    expect(frames[0].fin).toBe(1);
    expect(frames[1].fin).toBe(1);
    expect(frames[2].fin).toBe(1);
    expect(frames[3].fin).toBe(1);
    expect(frames[4].fin).toBe(1);
    expect(frames[0].opcode).toBe(2);
    expect(frames[1].opcode).toBe(2);
    expect(frames[2].opcode).toBe(2);
    expect(frames[3].opcode).toBe(2);
    expect(frames[4].opcode).toBe(2);
    expect(frames[0].length).toBe(22);
    expect(frames[1].length).toBe(2195);
    expect(frames[2].length).toBe(2301);
    expect(frames[3].length).toBe(2301);
    expect(frames[4].length).toBe(1921);
    expect(Buffer.from(payloads[0]).toString()).toBe('[[1,1,"util.ping",{}]]');
    expect(Buffer.from(payloads[1]).toString()).toBe(
      '[[1,2,"util.ping",{}],[1,3,"util.ping",{}],[1,4,"util.ping",{}],[1,5,"util.ping",{}],[1,6,"util.ping",{}],[1,7,"util.ping",{}],[1,8,"util.ping",{}],[1,9,"util.ping",{}],[1,10,"util.ping",{}],[1,11,"util.ping",{}],[1,12,"util.ping",{}],[1,13,"util.ping",{}],[1,14,"util.ping",{}],[1,15,"util.ping",{}],[1,16,"util.ping",{}],[1,17,"util.ping",{}],[1,18,"util.ping",{}],[1,19,"util.ping",{}],[1,20,"util.ping",{}],[1,21,"util.ping",{}],[1,22,"util.ping",{}],[1,23,"util.ping",{}],[1,24,"util.ping",{}],[1,25,"util.ping",{}],[1,26,"util.ping",{}],[1,27,"util.ping",{}],[1,28,"util.ping",{}],[1,29,"util.ping",{}],[1,30,"util.ping",{}],[1,31,"util.ping",{}],[1,32,"util.ping",{}],[1,33,"util.ping",{}],[1,34,"util.ping",{}],[1,35,"util.ping",{}],[1,36,"util.ping",{}],[1,37,"util.ping",{}],[1,38,"util.ping",{}],[1,39,"util.ping",{}],[1,40,"util.ping",{}],[1,41,"util.ping",{}],[1,42,"util.ping",{}],[1,43,"util.ping",{}],[1,44,"util.ping",{}],[1,45,"util.ping",{}],[1,46,"util.ping",{}],[1,47,"util.ping",{}],[1,48,"util.ping",{}],[1,49,"util.ping",{}],[1,50,"util.ping",{}],[1,51,"util.ping",{}],[1,52,"util.ping",{}],[1,53,"util.ping",{}],[1,54,"util.ping",{}],[1,55,"util.ping",{}],[1,56,"util.ping",{}],[1,57,"util.ping",{}],[1,58,"util.ping",{}],[1,59,"util.ping",{}],[1,60,"util.ping",{}],[1,61,"util.ping",{}],[1,62,"util.ping",{}],[1,63,"util.ping",{}],[1,64,"util.ping",{}],[1,65,"util.ping",{}],[1,66,"util.ping",{}],[1,67,"util.ping",{}],[1,68,"util.ping",{}],[1,69,"util.ping",{}],[1,70,"util.ping",{}],[1,71,"util.ping",{}],[1,72,"util.ping",{}],[1,73,"util.ping",{}],[1,74,"util.ping",{}],[1,75,"util.ping",{}],[1,76,"util.ping",{}],[1,77,"util.ping",{}],[1,78,"util.ping",{}],[1,79,"util.ping",{}],[1,80,"util.ping",{}],[1,81,"util.ping",{}],[1,82,"util.ping",{}],[1,83,"util.ping",{}],[1,84,"util.ping",{}],[1,85,"util.ping",{}],[1,86,"util.ping",{}],[1,87,"util.ping",{}],[1,88,"util.ping",{}],[1,89,"util.ping",{}],[1,90,"util.ping",{}],[1,91,"util.ping",{}],[1,92,"util.ping",{}],[1,93,"util.ping",{}],[1,94,"util.ping",{}],[1,95,"util.ping",{}],[1,96,"util.ping",{}],[1,97,"util.ping",{}],[1,98,"util.ping",{}],[1,99,"util.ping",{}],[1,100,"util.ping",{}],[1,101,"util.ping",{}]]',
    );
    expect(Buffer.from(payloads[2]).toString()).toBe(
      '[[1,102,"util.ping",{}],[1,103,"util.ping",{}],[1,104,"util.ping",{}],[1,105,"util.ping",{}],[1,106,"util.ping",{}],[1,107,"util.ping",{}],[1,108,"util.ping",{}],[1,109,"util.ping",{}],[1,110,"util.ping",{}],[1,111,"util.ping",{}],[1,112,"util.ping",{}],[1,113,"util.ping",{}],[1,114,"util.ping",{}],[1,115,"util.ping",{}],[1,116,"util.ping",{}],[1,117,"util.ping",{}],[1,118,"util.ping",{}],[1,119,"util.ping",{}],[1,120,"util.ping",{}],[1,121,"util.ping",{}],[1,122,"util.ping",{}],[1,123,"util.ping",{}],[1,124,"util.ping",{}],[1,125,"util.ping",{}],[1,126,"util.ping",{}],[1,127,"util.ping",{}],[1,128,"util.ping",{}],[1,129,"util.ping",{}],[1,130,"util.ping",{}],[1,131,"util.ping",{}],[1,132,"util.ping",{}],[1,133,"util.ping",{}],[1,134,"util.ping",{}],[1,135,"util.ping",{}],[1,136,"util.ping",{}],[1,137,"util.ping",{}],[1,138,"util.ping",{}],[1,139,"util.ping",{}],[1,140,"util.ping",{}],[1,141,"util.ping",{}],[1,142,"util.ping",{}],[1,143,"util.ping",{}],[1,144,"util.ping",{}],[1,145,"util.ping",{}],[1,146,"util.ping",{}],[1,147,"util.ping",{}],[1,148,"util.ping",{}],[1,149,"util.ping",{}],[1,150,"util.ping",{}],[1,151,"util.ping",{}],[1,152,"util.ping",{}],[1,153,"util.ping",{}],[1,154,"util.ping",{}],[1,155,"util.ping",{}],[1,156,"util.ping",{}],[1,157,"util.ping",{}],[1,158,"util.ping",{}],[1,159,"util.ping",{}],[1,160,"util.ping",{}],[1,161,"util.ping",{}],[1,162,"util.ping",{}],[1,163,"util.ping",{}],[1,164,"util.ping",{}],[1,165,"util.ping",{}],[1,166,"util.ping",{}],[1,167,"util.ping",{}],[1,168,"util.ping",{}],[1,169,"util.ping",{}],[1,170,"util.ping",{}],[1,171,"util.ping",{}],[1,172,"util.ping",{}],[1,173,"util.ping",{}],[1,174,"util.ping",{}],[1,175,"util.ping",{}],[1,176,"util.ping",{}],[1,177,"util.ping",{}],[1,178,"util.ping",{}],[1,179,"util.ping",{}],[1,180,"util.ping",{}],[1,181,"util.ping",{}],[1,182,"util.ping",{}],[1,183,"util.ping",{}],[1,184,"util.ping",{}],[1,185,"util.ping",{}],[1,186,"util.ping",{}],[1,187,"util.ping",{}],[1,188,"util.ping",{}],[1,189,"util.ping",{}],[1,190,"util.ping",{}],[1,191,"util.ping",{}],[1,192,"util.ping",{}],[1,193,"util.ping",{}],[1,194,"util.ping",{}],[1,195,"util.ping",{}],[1,196,"util.ping",{}],[1,197,"util.ping",{}],[1,198,"util.ping",{}],[1,199,"util.ping",{}],[1,200,"util.ping",{}],[1,201,"util.ping",{}]]',
    );
    expect(Buffer.from(payloads[3]).toString()).toBe(
      '[[1,202,"util.ping",{}],[1,203,"util.ping",{}],[1,204,"util.ping",{}],[1,205,"util.ping",{}],[1,206,"util.ping",{}],[1,207,"util.ping",{}],[1,208,"util.ping",{}],[1,209,"util.ping",{}],[1,210,"util.ping",{}],[1,211,"util.ping",{}],[1,212,"util.ping",{}],[1,213,"util.ping",{}],[1,214,"util.ping",{}],[1,215,"util.ping",{}],[1,216,"util.ping",{}],[1,217,"util.ping",{}],[1,218,"util.ping",{}],[1,219,"util.ping",{}],[1,220,"util.ping",{}],[1,221,"util.ping",{}],[1,222,"util.ping",{}],[1,223,"util.ping",{}],[1,224,"util.ping",{}],[1,225,"util.ping",{}],[1,226,"util.ping",{}],[1,227,"util.ping",{}],[1,228,"util.ping",{}],[1,229,"util.ping",{}],[1,230,"util.ping",{}],[1,231,"util.ping",{}],[1,232,"util.ping",{}],[1,233,"util.ping",{}],[1,234,"util.ping",{}],[1,235,"util.ping",{}],[1,236,"util.ping",{}],[1,237,"util.ping",{}],[1,238,"util.ping",{}],[1,239,"util.ping",{}],[1,240,"util.ping",{}],[1,241,"util.ping",{}],[1,242,"util.ping",{}],[1,243,"util.ping",{}],[1,244,"util.ping",{}],[1,245,"util.ping",{}],[1,246,"util.ping",{}],[1,247,"util.ping",{}],[1,248,"util.ping",{}],[1,249,"util.ping",{}],[1,250,"util.ping",{}],[1,251,"util.ping",{}],[1,252,"util.ping",{}],[1,253,"util.ping",{}],[1,254,"util.ping",{}],[1,255,"util.ping",{}],[1,256,"util.ping",{}],[1,257,"util.ping",{}],[1,258,"util.ping",{}],[1,259,"util.ping",{}],[1,260,"util.ping",{}],[1,261,"util.ping",{}],[1,262,"util.ping",{}],[1,263,"util.ping",{}],[1,264,"util.ping",{}],[1,265,"util.ping",{}],[1,266,"util.ping",{}],[1,267,"util.ping",{}],[1,268,"util.ping",{}],[1,269,"util.ping",{}],[1,270,"util.ping",{}],[1,271,"util.ping",{}],[1,272,"util.ping",{}],[1,273,"util.ping",{}],[1,274,"util.ping",{}],[1,275,"util.ping",{}],[1,276,"util.ping",{}],[1,277,"util.ping",{}],[1,278,"util.ping",{}],[1,279,"util.ping",{}],[1,280,"util.ping",{}],[1,281,"util.ping",{}],[1,282,"util.ping",{}],[1,283,"util.ping",{}],[1,284,"util.ping",{}],[1,285,"util.ping",{}],[1,286,"util.ping",{}],[1,287,"util.ping",{}],[1,288,"util.ping",{}],[1,289,"util.ping",{}],[1,290,"util.ping",{}],[1,291,"util.ping",{}],[1,292,"util.ping",{}],[1,293,"util.ping",{}],[1,294,"util.ping",{}],[1,295,"util.ping",{}],[1,296,"util.ping",{}],[1,297,"util.ping",{}],[1,298,"util.ping",{}],[1,299,"util.ping",{}],[1,300,"util.ping",{}],[1,301,"util.ping",{}]]',
    );
  });

  test('can read final text packet without mask', () => {
    const buf = Buffer.from(new Uint8Array([129, 8, 111, 118, 101, 114, 57, 48, 48, 48]));
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(8);
    expect(frame.mask).toEqual(undefined);
    expect(dst.toString()).toBe('over9000');
  });

  test('can read final masked text frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 1;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBeInstanceOf(Array);
    expect(dst.toString()).toBe('hello world');
  });

  test('can read non-final masked text frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 1;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    const slice1 = buf.slice(0, 2);
    const slice2 = buf.slice(2, 6);
    const slice3 = buf.slice(6, 10);
    const slice4 = buf.slice(10);
    decoder.push(slice1);
    decoder.push(slice2);
    decoder.push(slice3);
    decoder.push(slice4);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(0);
    expect(frame.opcode).toBe(1);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBeInstanceOf(Array);
    expect(dst.toString()).toBe('hello world');
  });

  test('can read non-final masked binary frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 2;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(0);
    expect(frame.opcode).toBe(2);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBeInstanceOf(Array);
    expect(dst.toString()).toBe('hello world');
  });

  test('can read non-final non-masked binary frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from('hello world');
    frame0.opcode = 2;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    const dst = Buffer.alloc(frame.length);
    let remaining = frame.length;
    remaining = decoder.readFrameData(frame, remaining, dst, 0);
    expect(frame.fin).toBe(0);
    expect(frame.opcode).toBe(2);
    expect(frame.length).toBe(11);
    expect(frame.mask).toBe(undefined);
    expect(dst.toString()).toBe('hello world');
  });

  test('can decode a frame with a continuation frame', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = false;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('hello ');
    frame0.opcode = 2;
    const frame1 = new WebSocketFrame(Buffer.alloc(4), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame1.fin = true;
    frame1.mask = true;
    frame1.binaryPayload = Buffer.from('world');
    frame1.opcode = 0;
    const buf0 = frame0.toBuffer();
    const buf1 = frame1.toBuffer();
    const dst = Buffer.alloc(11);
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const header0 = decoder.readFrameHeader()!;
    let remaining0 = header0.length;
    remaining0 = decoder.readFrameData(header0, remaining0, dst, 0);
    expect(header0.fin).toBe(0);
    decoder.push(buf1);
    const header1 = decoder.readFrameHeader()!;
    let remaining1 = header1.length;
    remaining1 = decoder.readFrameData(header1, remaining1, dst, 6);
    expect(header1.fin).toBe(1);
    expect(dst.toString()).toBe('hello world');
  });
});

describe('control frames', () => {
  test('can read CLOSE frame with masked UTF-8 payload', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = Buffer.from('something 🤷‍♂️ happened');
    frame0.closeStatus = 1000;
    frame0.opcode = WsFrameOpcode.CLOSE;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsCloseFrame).code).toBe(0);
    expect((frame as WsCloseFrame).reason).toBe('');
    decoder.readCloseFrameData(frame as WsCloseFrame);
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsCloseFrame).code).toBe(1000);
    expect((frame as WsCloseFrame).reason).toBe('something 🤷‍♂️ happened');
  });

  test('can read CLOSE frame with un-masked UTF-8 payload', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from('something 🤷‍♂️ happened');
    frame0.closeStatus = 1000;
    frame0.opcode = WsFrameOpcode.CLOSE;
    const buf = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsCloseFrame).code).toBe(0);
    expect((frame as WsCloseFrame).reason).toBe('');
    decoder.readCloseFrameData(frame as WsCloseFrame);
    expect(frame).toBeInstanceOf(WsCloseFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.CLOSE);
    expect(frame.length).toBe(frame0.binaryPayload.length + 2);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsCloseFrame).code).toBe(1000);
    expect((frame as WsCloseFrame).reason).toBe('something 🤷‍♂️ happened');
  });

  test('can read PING frame with masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = new Uint8Array([1, 2, 3]);
    frame0.opcode = WsFrameOpcode.PING;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPingFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PING);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('can read PING frame with un-masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from(new Uint8Array([1, 2, 3]));
    frame0.opcode = WsFrameOpcode.PING;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPingFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PING);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsPingFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('can read PONG frame with masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = true;
    frame0.binaryPayload = new Uint8Array([1, 2, 3]);
    frame0.opcode = WsFrameOpcode.PONG;
    const buf0 = frame0.toBuffer();
    const decoder = new WsFrameDecoder();
    decoder.push(buf0);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPongFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PONG);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBeInstanceOf(Array);
    expect((frame as WsPongFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });

  test('can read PONG frame with un-masked bytes', () => {
    const frame0 = new WebSocketFrame(Buffer.alloc(256), Buffer.alloc(128), {maxReceivedFrameSize: 1000000});
    frame0.fin = true;
    frame0.mask = false;
    frame0.binaryPayload = Buffer.from(new Uint8Array([1, 2, 3]));
    frame0.opcode = WsFrameOpcode.PONG;
    const buf0 = frame0.toBuffer();
    const slice0 = buf0.slice(0, 2);
    const slice1 = buf0.slice(2);
    const decoder = new WsFrameDecoder();
    decoder.push(slice0);
    decoder.push(slice1);
    const frame = decoder.readFrameHeader()!;
    expect(frame).toBeInstanceOf(WsPongFrame);
    expect(frame.fin).toBe(1);
    expect(frame.opcode).toBe(WsFrameOpcode.PONG);
    expect(frame.length).toBe(3);
    expect(frame.mask).toBe(undefined);
    expect((frame as WsPongFrame).data).toEqual(new Uint8Array([1, 2, 3]));
  });
});
