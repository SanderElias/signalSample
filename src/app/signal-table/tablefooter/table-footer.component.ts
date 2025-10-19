import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, input, model } from '@angular/core';
import { injectDomRepeatOnHold } from 'src/app/injectDomRepeatOnHold';
import { SampleDataService } from 'src/app/sample-data.service';

@Component({
    selector: 'tfoot',
    imports: [DecimalPipe],
    templateUrl: './table-footer.component.html',
    styleUrl: './table-footer.component.css'
})
export class TableFooterComponent {
  data = inject(SampleDataService);

  currentPage = model.required<number>();
  pageSize = input.required<number>();
  list = input.required<string[]>();
  filter = input.required<string>();

  /** calculate the number of pages */
  pageCount = computed(() => Math.ceil(this.list().length / this.pageSize())); // calculate the number of pages.

  /** helpers so you can have buttons that repeat when you hold your mouse button down on them */
  prev = injectDomRepeatOnHold('#prev').sideEffect(() => this.navigate(-1));
  next = injectDomRepeatOnHold('#next').sideEffect(() => this.navigate(1));

  // helper to skip relative to current page, currently only used by the prev/next buttons.
  navigate = (relative: number) => {
    const newPage = this.currentPage() + relative;
    this.goPage(newPage);
  };

  // Helper to go to a specific page.
  goPage = (page: number) => {
    if (page >= 0 && page < this.pageCount()) {
      this.currentPage.set(page);
    }
  };
}
