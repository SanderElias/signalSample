import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HighLightBodyComponent } from '../table-highlight/high-light-body/high-light-body.component';
import { SignalTable } from './signal-table.service';
import { TableRowComponent } from './table-row/table-row.component';
import { TableSettingsComponent } from './table-settings/table-settings.component';
import { TableFooterComponent } from './tablefooter/table-footer.component';
import { TableHeadComponent } from './tablehead/tablehead.component';

@Component({
  selector: 'signal-table',
  imports: [TableRowComponent, HighLightBodyComponent, TableSettingsComponent, TableHeadComponent, TableFooterComponent],
  template: `
    <table-settings
      (testPerf)="testPerf()"
      [(trackToUse)]="trackToUse" />

    <table>
      <thead sortProp></thead>

      <tbody [highLight]="filter()">
        @if (trackToUse() === 'index') {
          @for (id of computedPage(); track $index) {
            <tr [personId]="id"></tr>
          }
        }
        @if (trackToUse() === 'id') {
          @for (id of computedPage(); track id) {
            <tr [personId]="id"></tr>
          }
        }
      </tbody>

      <tfoot pagination></tfoot>
    </table>
  `,
  styleUrls: ['./signal-table.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [SignalTable],
})
export class SignalTableComponent {
  /** Use SignalTable service for all table state and computed signals */
  signalTable = inject(SignalTable);
  // rate = injectRateLimit(); // limit the amount of updates (not needed anymore, as between NG15 and NG20 the signal system has been optimized a lot)

  // Expose service signals for template binding
  filter = this.signalTable.filter; // I only need this here for the highLight stuff

  // a list of ID's to show in the current page
  computedPage = this.signalTable.computedPage;

  /**
   * automated test run, so I can monitor performance impact
   * this is pure test/demo code, in a production app you would not have this.
   */
  trackToUse = signal<'index' | 'id'>('index');
  testPerf = async () => {
    const testPages = 500;
    const wait = (to = 10) => new Promise((r: Function) => setTimeout(r, to));
    const run = async (type: 'id' | 'index') => {
      const start = performance.now();
      this.trackToUse.set(type);
      this.signalTable.currentPage.set(0);
      await wait(100); //wait till "stable"
      for (let i = 0; i < testPages; i += 1) {
        this.signalTable.currentPage.set(i);
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
