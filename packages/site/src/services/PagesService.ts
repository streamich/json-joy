import {BehaviorSubject, distinctUntilChanged, map} from 'rxjs';
import {HomePage} from '../pages/home/HomePage';
import {DocsPage} from '../pages/docs/DocsPage';
import type {FC} from 'react';
import type {NiceUiNavService} from '@jsonjoy.com/ui/lib/context/services/NiceUiNavService';

type RouteMatcher = (steps: string[]) => boolean;
type RouteComponent = FC;

export class PagesService {
  public readonly page$: BehaviorSubject<RouteComponent>;

  protected readonly routes: [matcher: RouteMatcher, component: RouteComponent][] = [
    [([s]) => s === 'docs', DocsPage],
    [() => true, HomePage],
  ];

  constructor(public readonly nav: NiceUiNavService) {
    this.page$ = new BehaviorSubject<RouteComponent>(this.match(nav.steps$.getValue()));

    nav.steps$
      .pipe(
        map((steps) => this.match(steps)),
        distinctUntilChanged(),
      )
      .subscribe(this.page$);
  }

  protected match(steps: string[]): RouteComponent {
    for (const [matcher, component] of this.routes) {
      if (matcher(steps)) return component;
    }
    return HomePage;
  }
}
