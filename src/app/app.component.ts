import { ApplicationRef, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectRateLimit } from './signal-table/rateLimit';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [],
})
export class AppComponent {
  app = inject(ApplicationRef);
  cancelLimit = injectRateLimit(20); // limit the amount of updates
}
