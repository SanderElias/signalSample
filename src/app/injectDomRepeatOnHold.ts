import { DestroyRef, ElementRef, inject } from '@angular/core';
import { Subject, fromEvent, repeat, switchMap, takeUntil, tap, timer } from 'rxjs';

type SideEffect = (n: number) => void;

/**
 * Helper that runs a function repeatedly while the user holds down the mouse button on the element.
 * @param elmSelector the element selector to attach the event to.
 * @param delay the delay between each call to the side-effect function.
 * @param sideEffect the function to call repeatedly.
 * @returns a helper to change the side-effect function.
 */
export function injectDomRepeatOnHold(
  elmSelector: string,
  delay = 25,
  sideEffect: SideEffect = (n: number) => undefined
): { sideEffect: (fn: SideEffect) => SideEffect } {
  const parent = inject(ElementRef).nativeElement as HTMLElement | undefined;
  const destroy$ = new Subject<void>();
  inject(DestroyRef).onDestroy(() => {
    destroy$.next();
    destroy$.complete();
  });

  /**
   * The actual functionality. it will wait for the mouse down event, then start a timer that will call the side-effect function
   * repeatedly until the mouse button is released.
   *
   * This is using observables internally, and takes care of unsubscribing when the component is destroyed.
   * The consumer of this doesn't need to know anything about that.
   */
  timer(10)
    .pipe(
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
        return fromEvent<MouseEvent>(elm, 'mousedown').pipe(
          tap(() => (elm.style.cursor = 'progress')),
          switchMap(() => timer(100, delay)),
          takeUntil(fromEvent<MouseEvent>(elm, 'mouseup')),
          takeUntil(fromEvent<MouseEvent>(elm, 'mouseleave')),
          tap(() => (elm.style.cursor = '')),
          repeat() // restart so it works on next click too.
        );
      }),
      tap((n) => sideEffect(n)), // trigger the side-effect
      takeUntil(destroy$) // make sure we stop when the component is destroyed.
    )
    .subscribe();

  return {
    sideEffect: (fn: SideEffect) => (sideEffect = fn),
  };
}
