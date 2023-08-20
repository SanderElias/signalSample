import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { HighLightTDComponent } from '../high-light-td/high-light-td.component';
import { SampleDataService } from '../sample-data.service';

@Component({
  selector: 'tr [personId]',
  standalone: true,
  imports: [CommonModule, HighLightTDComponent],
  template: `
    <td>{{ person()?.id ?? '--' }}</td>
    <td>{{ person()?.screenName ?? '--' }}</td>
    <td>{{ person()?.firstName ?? '--' }}</td>
    <td>{{ person()?.lastName ?? '--' }}</td>
    <td>{{ person()?.phone ?? '--' }}</td>
    <td>{{ person()?.email ?? '--' }}</td>
    <td>{{ person()?.remark ?? '--' }}</td>
  `,
  styleUrls: ['./data-row.component.css'],
})
export class DataRowComponent {
  data = inject(SampleDataService);

  /** mimic a input signal using a setter and a writableSignal */
  personId = signal<string | undefined>(undefined);
  @Input('personId') set _personId(id: string | undefined) {
    this.personId.set(id);
  }

  /**
   * use the personId signal to get the person.
   * this wil update the UI when the personId changes.
   * When the service returns an observable instead of a signal,
   * this will be a bit more complicated.
   */
  person = computed(() => this.data.getById(this.personId())());

  // something like this needs to be done when the service returns an observable:
  // personFromObs = toSignal(toObservable(this.person).pipe(
  //   switchMap(id => this.data.getById(id))
  // ));
}
