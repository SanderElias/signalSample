import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { interval } from 'rxjs';
import { DataRowComponent } from '../data-row/data-row.component';
import { HighLightBodyComponent } from '../high-light-body/high-light-body.component';
import { injectDomRepeatOnHold } from '../injectDomRepeatOnHold';
import { PersonProps, SampleDataService } from '../sample-data.service';

@Component({
  selector: 'signal-table',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DataRowComponent, HighLightBodyComponent],
  templateUrl: './signal-table.component.html',
  styleUrls: ['./signal-table.component.css'],
})
export class SignalTableComponent {
  /** injections */
  data = inject(SampleDataService);
  elm = inject(ElementRef).nativeElement as HTMLDivElement;

  addNumber = signal(50); // the number of additions used by the add button.
  pageSize = signal(15); // the number of rows to show per page.
  sortProp = signal<PersonProps | undefined>(undefined); // hold the property to sort on. undefined means natural order.
  order = signal<1 | -1>(1); // when sorting, this defines the sorting order
  filter = signal(''); // the filter to use, empty means none.
  currentPage = signal(0); // the current page to show.
  useSmartPage = signal<'smart' | 'regular'>('smart');
  list = computed(() => {
    const prop = this.sortProp();
    const order = this.order();
    const filter = this.filter();
    this.data.totalCount(); // make sure the list updates when new data arrives.
    const newList = this.data.getIdList(prop, order, filter)();
    return newList;
  }); // the complete list of ID's to use, sorted by the current sortProp and order.
  pageCount = computed(() => Math.ceil(this.list().length / this.pageSize())); // calculate the number of pages.
  /**
   * this creates a "page" which is a list of signals.
   * As I'm using this in a ngFor, it will not create new rows when the list changes.
   * the only time the rows are recreated is when the page-size changes.
   * This prevents DOM trashing when paginating over a large set.
   */
  page = computed(() => {
    const page = [] as WritableSignal<string | undefined>[];
    for (let i = 0; i < this.pageSize(); i++) {
      page.push(signal(undefined));
    }
    return page;
  });

  /**
   * debug aid.
   * Will cause the DOM trashing by replacing all existing rows.
   */
  refresh() {
    this.pageSize.mutate(() => undefined); //force page to be recreated
  }

  addRows = (n: number) => this.data.addFakes(n);

  /**
   * This makes the thing work. On changes it updates the the signal rows in the page array.
   * I would love a way do do this without an effect, but I can't find it.
   */
  fillPage = effect(
    () => {
      const first = this.currentPage() * this.pageSize(); // calculate the first item to show.
      const list = this.list; // get the list of id's to show.
      // const pageSize = this.pageSize();
      // if (first > list.length) {
      //   this.currentPage.set(Math.floor(list.length / pageSize));
      // }
      this.page().forEach((_, i) => {
        // for every row in the page
        // replace the id's to show.
        this.page()[i].set(list()[first + i] ?? undefined);
      });
    },
    { allowSignalWrites: true }
  );

  regularPage = computed(() => {
    const first = this.currentPage() * this.pageSize(); // calculate the first item to show.
    const page = this.list().slice(first, first + this.pageSize());
    while (page.length < this.pageSize()) {
      page.push(undefined as any);
    }
    return page;
  });

  toggleSmart = () => this.useSmartPage.update((cur) => (cur === 'smart' ? 'regular' : 'smart'));

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

  testRun = async () => {
    const next = (t = 10) => new Promise((r) => setTimeout(() => r(undefined), t)); // next microtask;
    const pages = 250;
    this.goPage(0);
    this.useSmartPage.set('smart');
    await next();
    for (let i = 0; i < pages; i += 1) {
      this.navigate(1);
      await next();
    }
    this.goPage(0);
    await next(2000);
    this.useSmartPage.set('regular');
    await next();
    for (let i = 0; i < pages; i += 1) {
      this.navigate(1);
      await next();
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
}