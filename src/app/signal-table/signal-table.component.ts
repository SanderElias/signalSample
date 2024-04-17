import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { PersonProps, SampleDataService } from '../sample-data.service';
import { HighLightBodyComponent } from '../table-highlight/high-light-body/high-light-body.component';
import { TableRowComponent } from './table-row/table-row.component';
import { TableSettingsComponent } from './table-settings/table-settings.component';
import { TableFooterComponent } from './tablefooter/table-footer.component';
import { TableHeadComponent } from './tablehead/tablehead.component';

@Component({
  selector: 'signal-table',
  standalone: true,
  imports: [TableRowComponent, HighLightBodyComponent, TableSettingsComponent, TableHeadComponent, TableFooterComponent],
  templateUrl: './signal-table.component.html',
  styleUrls: ['./signal-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalTableComponent {
  /** injections */
  data = inject(SampleDataService);

  pageSize = signal(45); // the number of rows to show per page.
  sortProp = signal<PersonProps | undefined>(undefined); // hold the property to sort on. undefined means natural order.
  order = signal<1 | -1>(1); // when sorting, this defines the sorting order (1 = ascending, -1 = descending)
  filter = signal(''); // the filter to use, empty means none.
  currentPage = signal(0); // the current page to show.
  trackToUse = signal<'index' | 'id'>('index');

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
   */
  computedPage = computed(() => {
    const pageSize = this.pageSize();
    const list = this.list(); // get the list of id's to show
    const currentPage = this.currentPage() * pageSize > list.length ? Math.floor(list.length / pageSize) : this.currentPage();
    const first = currentPage * pageSize; // calculate the first item to show.
    const result = [] as string[];

    for (let i = 0; i < pageSize; i += 1) {
      result.push(list[first + i]); // will push undefined in non-existing rows.
    }
    return result;
  });

  /**
   * automated test run, so I can monitor performance impact
   */
  testPerf = async () => {
    const testPages = 500;
    const wait = (to = 10) => new Promise((r: Function) => setTimeout(r, to));
    const run = async (type: 'id' | 'index') => {
      const start = performance.now();
      this.trackToUse.set(type);
      this.currentPage.set(0);
      await wait(100); //wait till "stable"
      for (let i = 0; i < testPages; i += 1) {
        this.currentPage.set(i);
        await wait(1); // wait until the page is rendered.
      }
      const end = performance.now();
      console.log(`Test ${type} took ${end - start} ms`);
    };
    await run('index');
    await wait(1500); // give some room to be able to see the diff in performance monitor
    await run('id');
  };
}
