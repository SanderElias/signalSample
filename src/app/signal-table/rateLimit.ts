import {
  ChangeDetectorRef, Injector,
  afterNextRender, inject
} from '@angular/core';

export const injectRateLimit = (n = 16) => {
  const injector = inject(Injector);
  const cdr = inject(ChangeDetectorRef);
  cdr.detach();
  const interval = setInterval(() => {
    cdr.reattach();
    afterNextRender(() => cdr.detach(), { injector });
  }, n);
  return () => {
    clearInterval(interval);
    cdr.reattach();
  };
};
