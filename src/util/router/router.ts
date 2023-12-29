import {JsExpression} from '../codegen/util/JsExpression';
import {printTree} from '../print/printTree';
import {Printable} from '../print/types';
import {RouteMatcher, RouterCodegenCtx, RouterCodegenOpts} from './codegen';
import {ExactStep, RegexStep, UntilStep} from './steps';
import {RoutingTreeNode} from './tree';
import {Step} from './types';

export interface RouterOptions {
  defaultUntil?: string;
}

export class Router<Data = unknown> implements Printable {
  public readonly destinations: Destination[] = [];

  constructor(public readonly options: RouterOptions = {}) {}

  public add(route: string | string[], data: Data) {
    const destination = Destination.from(route, data, this.options.defaultUntil);
    this.destinations.push(destination);
  }

  public addDestination(destination: Destination) {
    this.destinations.push(destination);
  }

  public tree(): RoutingTreeNode {
    const tree = new RoutingTreeNode();
    for (const destination of this.destinations) {
      for (const route of destination.routes) {
        tree.add(route, 0, destination);
      }
    }
    return tree;
  }

  public compile(): RouteMatcher<Data> {
    const ctx = new RouterCodegenCtx();
    const node = new RouterCodegenOpts(new JsExpression(() => 'str'), '0');
    const tree = this.tree();
    tree.codegen(ctx, node);
    return ctx.codegen.compile() as RouteMatcher<Data>;
  }

  public toString(tab: string = '') {
    return (
      `${this.constructor.name}` +
      printTree(tab, [
        (tab) =>
          'Destinations' +
          printTree(
            tab,
            this.destinations.map((d, i) => (tab) => `[${i}]: ` + d.toString(tab + ' ')),
          ),
        () => '',
        (tab) => 'RoutingTree' + printTree(tab, [(tab) => this.tree().toString(tab)]),
      ])
    );
  }
}

export class Destination implements Printable {
  public static from(def: string | string[], data: unknown, defaultUntil?: string): Destination {
    const routes = typeof def === 'string' ? [Route.from(def, defaultUntil)] : def.map((r) => Route.from(r));
    return new Destination(routes, data);
  }

  public readonly match: Match;

  constructor(public readonly routes: Route[], public readonly data: unknown) {
    this.match = new Match(data, []);
  }

  public toString(tab: string = '') {
    return (
      `${this.constructor.name} ` +
      (this.routes.length === 1
        ? this.routes[0].toString(tab)
        : printTree(
            tab,
            this.routes.map((r) => (tab) => r.toString(tab)),
          ))
    );
  }
}

export class Route implements Printable {
  public static from(str: string, defaultUntil = '/'): Route {
    const tokens: string[] = [];
    const matches = str.match(/\{[^\}]*\}/g);
    let i = 0;
    for (const match of matches ?? []) {
      const index = str.indexOf(match);
      if (index > i) tokens.push(str.substring(i, index));
      tokens.push(match);
      i = index + match.length;
    }
    if (i < str.length) tokens.push(str.substring(i));
    const steps: Step[] = [];
    const length = tokens.length;
    for (let i = 0; i < length; i++) {
      const token = tokens[i];
      const isParameter = token.startsWith('{') && token.endsWith('}');
      if (isParameter) {
        const content = token.substring(1, token.length - 1);
        const [name = '', regex = '', until = ''] = content.split(':');
        if (!regex || regex === '*') {
          const next = tokens[i + 1];
          steps.push(new UntilStep(name, until || (next ? next[0] : defaultUntil)));
        } else {
          steps.push(new RegexStep(name, regex, until));
        }
      } else {
        steps.push(new ExactStep(token));
      }
    }
    return new Route(steps);
  }

  constructor(public readonly steps: Step[]) {}

  public toText() {
    let str = '';
    for (const step in this.steps) str += this.steps[step].toText();
    return str;
  }

  public toString(tab: string = '') {
    return this.toText();
  }
}

export class Match<Data = unknown> {
  constructor(public readonly data: Data, public params: string[] | null) {}
}
