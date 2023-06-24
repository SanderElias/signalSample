import { DestroyRef, ElementRef, inject } from '@angular/core';
import { Subject, fromEvent, repeat, switchMap, takeUntil, tap, timer } from 'rxjs';


/**
 * Helper that returns an observable that emits repeatedly while the user holds down the mouse button on the element.
 */
export function injectDomRepeatOnHold(elmSelector: string, { delay } = { delay: 50 }) {
  const parent = inject(ElementRef).nativeElement as HTMLElement | undefined;
  const destroy$ = new Subject<void>();
  inject(DestroyRef).onDestroy(() => { destroy$.next(); destroy$.complete(); });

  return timer(1).pipe(
    switchMap(() => {
      if (!parent) { console.warn('injectDomRepeatOnHold: could not find parent element'); }
      const elm = parent?.querySelector(elmSelector) as HTMLElement;
      if (!elm) { throw new Error(`injectDomRepeatOnHold: could not find element with selector ${elmSelector}`); }
      return fromEvent<MouseEvent>(elm, 'mousedown').pipe(
        tap(() => elm.style.cursor = 'progress'),
        switchMap(() => timer(0, delay)),
        takeUntil(fromEvent<MouseEvent>(elm, 'mouseup')),
        takeUntil(fromEvent<MouseEvent>(elm, 'mouseleave')),
        tap(() => elm.style.cursor = ''),
        repeat()
      );
    }),
    takeUntil(destroy$)
  );
}
