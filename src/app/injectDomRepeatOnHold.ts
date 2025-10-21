import { DestroyRef, ElementRef, inject } from '@angular/core';
import { fromEvent, race, repeat, switchMap, takeUntil, tap, timer } from 'rxjs';

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
): { sideEffect: (fn: SideEffect) => void } {
  const parent = inject(ElementRef).nativeElement as HTMLElement | undefined;
  inject(DestroyRef).onDestroy(() => {
    subscription.unsubscribe(); // clean up the subscription when the component is destroyed.
  });

  /**
   * The actual functionality. it will wait for the mouse down event, then start a timer that will call the side-effect function
   * repeatedly until the mouse button is released.
   *
   * This is using observables internally, and takes care of unsubscribing when the component is destroyed.
   * The consumer of this doesn't need to know anything about that.
   */
  const subscription = timer(10)
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
          // start on mouse down
          tap(() => (elm.style.cursor = 'progress')), // show the user that something is happening.
          switchMap(() =>
            timer(100, delay).pipe(
              // start a timer that will call the side-effect function repeatedly.
              takeUntil(race(fromEvent<MouseEvent>(elm, 'mouseup'), fromEvent<MouseEvent>(elm, 'mouseleave'))), // stop when the mouse button is released.
              tap({
                next: (n) => sideEffect(n), // call the side-effect function.
                complete: () => {
                  /**
                   * make sure the side-effect is called at least once when the user releases the mouse button.
                   */
                  sideEffect(1);
                  elm.style.cursor = ''; // turn the cursor back to normal.
                },
              })
            )
          ),
          repeat() // restart so it works on next click too.
        );
      })
    )
    .subscribe(); // start listening for mouse down events.

  // return a sideEffect registration function.
  return {
    sideEffect: (fn: SideEffect) => (sideEffect = fn),
  };
}
