import {emitStringMatch} from '@jsonjoy.com/json-pack/lib/util/codegen/util/helpers';
import {printTree} from '../print/printTree';
import {Printable} from '../print/types';
import {RadixTree} from '../trees/radix/RadixTree';
import {TrieNode} from '../trees/trie/TrieNode';
import {RouterCodegenCtx, RouterCodegenOpts} from './codegen';
import {Destination, Route} from './router';
import {ExactStep, RegexStep, UntilStep} from './steps';

const genExactMatchCondition = (text: string, opts: RouterCodegenOpts) => {
  return emitStringMatch('str', opts.offset, text);
};

export class RoutingTreeNode implements Printable {
  public readonly exact: Map<number, [step: ExactStep, destination: Destination][]> = new Map();
  public readonly start: RadixTree<RoutingTreeNode> = new RadixTree();
  public readonly until: [step: UntilStep, destination: RoutingTreeNode][] = [];
  public readonly regex: [step: RegexStep, destination: RoutingTreeNode | Destination][] = [];
  public end?: Destination;

  public add(route: Route, step: number, destination: Destination): void {
    const isLast = step === route.steps.length - 1;
    const match = route.steps[step];
    if (match instanceof ExactStep) {
      if (isLast) {
        const exact = this.exact.get(match.text.length) ?? [];
        exact.push([match, destination]);
        this.exact.set(match.text.length, exact);
      } else {
        const child = this.start.get(match.text);
        if (child) child.add(route, step + 1, destination);
        else {
          const node = new RoutingTreeNode();
          this.start.set(match.text, node);
          node.add(route, step + 1, destination);
        }
      }
    } else if (match instanceof UntilStep) {
      let until: [step: UntilStep, destination: RoutingTreeNode] | undefined = this.until.find(
        ([step, dest]) => step.until === match.until && step.name === match.name && dest instanceof RoutingTreeNode,
      );
      if (!until || !(until[1] instanceof RoutingTreeNode)) {
        until = [match, new RoutingTreeNode()];
        this.until.push(until);
      }
      if (isLast) {
        until[1].end = destination;
      } else {
        until[1].add(route, step + 1, destination);
      }
    } else if (match instanceof RegexStep) {
      if (isLast) {
        this.regex.push([match, destination]);
      } else {
        const regex = this.regex.find(
          ([step, dest]) =>
            step.regex === match.regex &&
            step.until === match.until &&
            step.name === match.name &&
            dest instanceof RoutingTreeNode,
        );
        if (regex && regex[1] instanceof RoutingTreeNode) {
          regex[1].add(route, step + 1, destination);
        } else {
          const node = new RoutingTreeNode();
          this.regex.push([match, node]);
          node.add(route, step + 1, destination);
        }
      }
    }
  }

  public codegen(ctx: RouterCodegenCtx, opts: RouterCodegenOpts): void {
    const code = ctx.codegen;
    if (this.exact.size) {
      if (!opts.depth) {
        code.switch(
          'len',
          [...this.exact].map(([length, destinations]) => [
            length,
            () => {
              code.switch(
                'str',
                destinations.map(([step, destination]) => {
                  const m = code.linkDependency(destination.match);
                  return [JSON.stringify(step.text), () => code.return(`${m}.params = null, ${m}`), true];
                }),
              );
            },
          ]),
        );
      } else {
        for (const destinations of this.exact.values()) {
          for (const [step, destination] of destinations) {
            const m = code.linkDependency(destination.match);
            code.if(
              `(${step.text.length} + ${opts.offset} === len) && ${genExactMatchCondition(step.text, opts)}`,
              () => code.return(`${m}.params = params, ${m}`),
            );
          }
        }
      }
    }
    if (!opts.depth) {
      code.js('var params = [];');
    }
    const emitRadixTreeNode = (node: TrieNode, opts: RouterCodegenOpts) => {
      const text = node.k;
      const length = text.length;
      const block = () => {
        const offset = length ? code.var(`${opts.offset} + ${length}`) : opts.offset;
        node.forChildren((child) => {
          emitRadixTreeNode(child, opts.create(offset));
        });
        const routingNode = node.v as RoutingTreeNode | undefined;
        if (routingNode) {
          routingNode.codegen(ctx, opts.create(offset));
        }
      };
      if (text) {
        code.if(genExactMatchCondition(text, opts), block);
      } else block();
    };
    emitRadixTreeNode(this.start, opts);
    if (this.until.length) {
      for (const [step, destination] of this.until) {
        if (destination.end && step.until === '\n') {
          const m = code.linkDependency(destination.end.match);
          if (step.name) code.js(`params.push(str.slice(${opts.offset}, len));`);
          code.return(`${m}.params = params, ${m}`);
        } else {
          // const ri = code.var(opts.offset);
          // code.js(`for(; ${ri} < len && str[${ri}] !== ${JSON.stringify(step.until)}; ${ri}++);`);
          // code.js(`for(; ${ri} < len && str.charCodeAt(${ri}) !== ${step.until.charCodeAt(0)}; ${ri}++);`);
          const ri = code.var(`str.indexOf(${JSON.stringify(step.until)}, ${opts.offset})`);
          if (destination.end) {
            const m = code.linkDependency(destination.end.match);
            code.if(`${ri} === -1`, () => {
              if (step.name) code.js(`params.push(str.slice(${opts.offset}, len));`);
              code.return(`${m}.params = params, ${m}`);
            });
          }
          if (
            destination.exact.size ||
            destination.start.size ||
            destination.until.length ||
            destination.regex.length
          ) {
            code.if(`${ri} > ${opts.offset}`, () => {
              if (step.name) code.js(`params.push(str.slice(${opts.offset}, ${ri}));`);
              destination.codegen(ctx, opts.create(ri));
              if (step.name) code.js(`params.pop();`);
            });
          }
        }
      }
    }
    if (this.regex.length) {
      for (const [step, destination] of this.regex) {
        const isDestination = destination instanceof Destination;
        const r = code.var(`str.slice(${opts.offset})`);
        const regex = new RegExp('^' + step.regex + step.until + (isDestination ? '$' : ''));
        const reg = code.linkDependency(regex);
        const match = code.var(`${r}.match(${reg})`);
        if (isDestination) {
          code.if(match, () => {
            const val = code.var(`${match}[1] || ${match}[0]`);
            const m = code.linkDependency(destination.match);
            if (step.name) code.js(`params.push(${val});`);
            code.return(`${m}.params = params, ${m}`);
          });
        } else {
          code.if(match, () => {
            const val = code.var(`${match}[1] || ${match}[0]`);
            const offset = code.var(`${opts.offset} + ${val}.length`);
            if (step.name) code.js(`params.push(${val});`);
            destination.codegen(ctx, opts.create(offset));
            if (step.name) code.js(`params.pop();`);
          });
        }
      }
    }
  }

  public toString(tab: string): string {
    return (
      `${this.constructor.name} ` +
      printTree(tab, [
        !this.exact.size
          ? null
          : (tab) =>
              'exact ' +
              printTree(
                tab,
                [...this.exact].map(
                  ([length, destinations]) =>
                    (tab) =>
                      `${length} ` +
                      printTree(
                        tab,
                        destinations.map(
                          ([step, destination]) =>
                            (tab) =>
                              `${JSON.stringify(step.toText())}${
                                destination instanceof Destination ? ' →' : ''
                              } ${destination.toString(tab + ' ')}`,
                        ),
                      ),
                ),
              ),
        !this.end ? null : (tab) => 'end → ' + this.end!.toString(tab),
        !this.start.size ? null : (tab) => 'start ' + this.start.toString(tab),
        !this.until.length
          ? null
          : (tab) =>
              'until ' +
              printTree(
                tab,
                this.until.map(
                  ([step, destination]) =>
                    (tab) =>
                      `${step.toText()}${destination instanceof Destination ? ' →' : ''} ${destination.toString(tab)}`,
                ),
              ),
        !this.regex.length
          ? null
          : (tab) =>
              'regex ' +
              printTree(
                tab,
                this.regex.map(
                  ([step, destination]) =>
                    (tab) =>
                      `${step.toText()}${destination instanceof Destination ? ' →' : ''} ${destination.toString(tab)}`,
                ),
              ),
      ])
    );
  }
}
