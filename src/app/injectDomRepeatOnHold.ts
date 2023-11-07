import { DestroyRef, ElementRef, inject } from '@angular/core';
import { Observable, Subject, filter, fromEvent, map, merge, repeat, switchMap, takeUntil, timer } from 'rxjs';

/**
 * Helper that returns an observable that emits repeatedly while the user holds down the mouse button on the element.
 * will complete when the component using it is destroyed.
 */
export function injectDomRepeatOnHold(elmSelector: string, { delay } = { delay: 5 }): Observable<number> {
  const parent = inject(ElementRef).nativeElement as HTMLElement | undefined;
  const destroy$ = new Subject<void>();
  inject(DestroyRef).onDestroy(() => {
    destroy$.next();
    destroy$.complete();
  });

  return timer(10).pipe(
    // wait a bit, so that the component is fully initialized.
    switchMap(() => {
      // switch to the actual functionality
      if (!parent) {
        console.warn('injectDomRepeatOnHold: could not find parent element');
      }
      const elm = parent?.querySelector(elmSelector) as HTMLElement;
      if (!elm) {
        throw new Error(`injectDomRepeatOnHold: could not find element with selector ${elmSelector}`);
      }
      const firstDelay = 400;
      const mouseStart = fromEvent<MouseEvent>(elm, 'mousedown').pipe(map(() => Date.now()));
      const mouseEnd = merge(fromEvent<MouseEvent>(elm, 'mouseup'), fromEvent<MouseEvent>(elm, 'mouseleave'));
      const hold = mouseStart.pipe(
        switchMap((startTime) => timer(0, delay).pipe(map(() => Date.now() - startTime))),
        filter((delayTime) => delayTime >= firstDelay),
        takeUntil(mouseEnd),
        repeat() // restart so it works on next click too.
      );
      const click = mouseStart.pipe(
        takeUntil(mouseEnd),
        filter((startTime) => Date.now() - startTime < firstDelay),
        repeat()
      );
      return merge(click, hold);
    }),
    takeUntil(destroy$) // make sure we stop when the component is destroyed.
  );
}
