import { computed, inject, Injectable, signal } from '@angular/core';
import { SampleDataService, type PersonProps } from '../sample-data.service';

@Injectable()
export class SignalTable {
  /** injections */
  data = inject(SampleDataService);
  // rate = injectRateLimit(); // limit the amount of updates (not needed anymore, as between NG15 and NG20 the signal system has been optimized a lot)

  /**
   * signals to hold the state of the table
   */
  pageSize = signal(19); // the number of rows to show per page.
  sortProp = signal<PersonProps | undefined>(undefined); // hold the property to sort on. undefined means natural order.
  order = signal<1 | -1>(1); // when sorting, this defines the sorting order (1 = ascending, -1 = descending)
  filter = signal(''); // the filter to use, empty means none.
  currentPage = signal(0); // the current page to show.
  totalCount = this.data.totalCount; // expose totalCount for convenience.

  /**
   * list is a Signal<string[]>
   * it holds the total list of ID's to show.
   * The service is responsible for updating the list, and the filtering and sorting that needs to be done.
   * NOTE: it only holds the ID's, not the actual data.
   * It is a computed signal, so it will update when the data or any of the relevant properties change.
   */
  list = computed(() => {
    const prop = this.sortProp();
    const order = this.order();
    const filter = this.filter();
    this.data.totalCount(); // make sure the list updates when new data arrives.
    const newList = this.data.getIdList(prop, order, filter)();
    return newList;
  });

  /**
   * computedPage is a Signal<string[]>
   * it uses computed to calculate the list of ID's put in the current page of the pagination.
   * in a real app, this would probably be loading a page of data from the server. (and be in the sample-data-service)
   */
  computedPage = computed(() => {
    const pageSize = this.pageSize();
    const list = this.list(); // get the list of id's to show
    const currentPage = this.currentPage() * pageSize > list.length ? Math.floor(list.length / pageSize) : this.currentPage();
    const first = currentPage * pageSize; // calculate the first item to show.
    const result: string[] = [];

    for (let i = 0; i < pageSize; i += 1) {
      result.push(list[first + i]); // will push undefined in non-existing rows.
    }
    return result;
  });
}
