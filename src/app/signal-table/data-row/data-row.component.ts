import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, computed, inject, input, signal } from '@angular/core';
import { SampleDataService } from 'src/app/sample-data.service';
import { HighLightTDComponent } from 'src/app/table-highlight/high-light-td/high-light-td.component';


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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataRowComponent {
  getById = inject(SampleDataService).getById; // get the getById method from the service. 

  personId = input<string>();

  /**
   * use the personId signal to get the person.
   * this wil update the UI when the personId changes.
   * When the service returns an observable instead of a signal,
   * this will be a bit more complicated.
   */
  person = computed(() => this.getById(this.personId())());

}