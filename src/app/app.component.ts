import { CommonModule } from '@angular/common';
import { Component, ElementRef, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataRowComponent } from './data-row/data-row.component';
import { HighLightBodyComponent } from './high-light-body/high-light-body.component';
import { injectDomRepeatOnHold } from './injectDomRepeatOnHold';
import { PersonProps, SampleDataService } from './sample-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DataRowComponent, HighLightBodyComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  /** injections */
  data = inject(SampleDataService);
  elm = inject(ElementRef).nativeElement as HTMLDivElement;
  addNumber = signal(50); // the number of additions used by the add button.
  pageSize = signal(20); // the number of rows to show per page.
  sortProp = signal<PersonProps | undefined>(undefined); // hold the property to sort on. undefined means natural order.
  order = signal<1 | -1>(1); // when sorting, this defines the sorting order
  filter = signal(''); // the filter to use, empty means none.
  currentPage = signal(0); // the current page to show.
  trackToUse = signal<'index' | 'id'>('index');
  list = computed(() => {
    const prop = this.sortProp();
    const order = this.order();
    const filter = this.filter();
    this.data.totalCount(); // make sure the list updates when new data arrives.
    const newList = this.data.getIdList(prop, order, filter)();
    return newList;
  }); // the complete list of ID's to use, sorted by the current sortProp and order.
  pageCount = computed(() => Math.ceil(this.list().length / this.pageSize())); // calculate the number of pages.

  addRows = (n: number) => this.data.addFakes(n);

  computedPage = computed(() => {
    const pageSize = this.pageSize();
    const list = this.list(); // get the list of id's to show
    const currentPage = this.currentPage() * pageSize > list.length ? Math.floor(list.length / pageSize) : this.currentPage();
    const first = currentPage * pageSize; // calculate the first item to show.
    const result = [] as string[];

    for (let i = 0; i < pageSize; i += 1) {
      result.push(list[first + i]); // will push undefined in non-existing rows.
    }
    // console.log({ pageSize, currentPage, first, length: Math.floor(list.length / pageSize), result });
    return result;
  });

  // Below this line is the code for user "actions" like clicking buttons and such.
  // --------------------------------------------------------------------------------------------

  /** helpers so you can have buttons that repeat when you hold your mouse button down on them */
  prev = injectDomRepeatOnHold('#prev').subscribe(() => this.navigate(-1));
  next = injectDomRepeatOnHold('#next').subscribe(() => this.navigate(1));

  /**
   * helper to skip relative to current page, currently only used by the prev/next buttons.
   */
  navigate = (relative: number) => {
    const newPage = this.currentPage() + relative;
    if (newPage >= 0 && newPage < this.pageCount()) {
      this.currentPage.set(newPage);
    }
  };

  /**
   * helper to sort the list by a property.
   */
  orderBy = (prop: PersonProps) => {
    const curProp = this.sortProp();
    if (curProp === prop) {
      // same column, flip the order
      this.order.update((n) => (n === 1 ? -1 : 1));
    } else {
      // set order back to ascending.
      this.order.set(1);
    }
    this.sortProp.set(prop);
  };

  /**
   * Helper to go to a specific page.
   */
  goPage = (page: number) => {
    if (page >= 0 && page < this.pageCount()) {
      this.currentPage.set(page);
    }
  };

  /**
   * automated test run, so I can monitor performance impact
   */
  testPerf = async () => {
    const testPages = 500;
    const wait = (to = 10) => new Promise((r: Function) => setTimeout(r, to));
    const run = async (type: 'id' | 'index') => {
      this.trackToUse.set(type);
      this.goPage(0);
      await wait(100); //wait till "stable"
      for (let i = 0; i < testPages; i += 1) {
        this.currentPage.set(i)
        await wait(10);
      }
    };
    await run('index');
    await wait(1000); // give some room to be able to see the diff in performance monitor
    await run('id');
  };
}
