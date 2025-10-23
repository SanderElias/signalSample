import { ChangeDetectorRef, Injector, afterEveryRender, inject } from '@angular/core';

/**
 * Temporarily detaches Angular's change detector
 * and reattaches it at a fixed interval (default 16ms),
 * limiting how often change detection runs.
 * this makes sure that no matter how many updates there are in the
 * subtree, change detection will only run at most every n milliseconds.
 * this was needed in earlier Angular versions to limit excessive change detection,
 * but with recent optimizations in the signal system between NG15 and NG20,
 * it may no longer be necessary.
 * Returns a cleanup function to clear the interval and reattach.
 */
export const injectRateLimit = (n = 16) => {
  const injector = inject(Injector);
  const cdr = inject(ChangeDetectorRef);
  cdr.detach();
  const interval = setInterval(() => {
    cdr.reattach();
  }, n);
  const r = afterEveryRender(() => cdr.detach(), { injector });
  return () => {
    clearInterval(interval);
    cdr.reattach();
    r.destroy();
  };
};
