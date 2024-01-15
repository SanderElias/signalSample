import { ApplicationRef, ChangeDetectorRef, Component, NgZone, inject, ɵNoopNgZone } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [],
})
export class AppComponent {
  app = inject(ApplicationRef)
  zone = inject(NgZone);
  noZone = this.zone instanceof ɵNoopNgZone;

  constructor() {
    if (this.noZone) {
      /**
       * This is a very crude way to get the app going.
       * As long as zoneLess isn't fully driven by signals,
       * we need something to tell Angular to update the view.
       */
      console.warn(`[appComponent] NoopZone detected, run CDR.detectChanges every 15Ms`);
      setInterval(() => this.app.tick(), 15); // cater for 60 fps.
    }
  }
}
