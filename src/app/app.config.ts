// import 'zone.js';
import { ApplicationConfig, NgZone, ɵNoopNgZone } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    /** adding zones, or not. */
    { provide: NgZone, useClass: ɵNoopNgZone },
  ],
};
