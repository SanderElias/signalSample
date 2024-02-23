import { Component, EventEmitter, Output, computed, inject, model, signal } from '@angular/core';
import { SampleDataService } from 'src/app/sample-data.service';

@Component({
  selector: 'table-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent {
  data = inject(SampleDataService);
  @Output() testPerf = new EventEmitter<void>();

  pageSize = model.required<number>(); // the number of rows to show per page.
  trackToUse = model.required<'index' | 'id'>(); // are we tracking by index or id?
  filter = model.required<string>(); // the filter to use, empty means none.

  addNumber = signal(25); // the number of additions used by the add button.
  slowAdd = signal(false); // if true, the add button will add a 500ms call between every page of 1000.
  delay = computed(() => (this.slowAdd() ? 500 : 0)); // the delay between adding a page of 1000.

  busy = signal(false);  // if true, the add button is disabled.
  addRows = async (n: number) => {
    if (this.busy()) return;
    this.busy.set(true);
    for (let i = 0; i < n; i++) {
      await this.data.addFakes(1);
      await new Promise((resolve) => setTimeout(resolve, this.delay()));
    }
    this.busy.set(false);
  };
}
