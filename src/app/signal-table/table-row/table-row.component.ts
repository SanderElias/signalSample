import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { SampleDataService } from 'src/app/sample-data.service';
import { HighLightTDComponent } from 'src/app/table-highlight/high-light-td/high-light-td.component';
import type { Person } from '../../utils';

@Component({
  selector: 'tr [personId]',
  imports: [HighLightTDComponent],
  template: `
    <td><button (click)="del(personId())">🗑️</button></td>
    <td>{{ readProp('id') }}</td>
    <td>{{ readProp('screenName') }}</td>
    <td>{{ readProp('firstName') }}</td>
    <td>{{ readProp('lastName') }}</td>
    <td>{{ readProp('phone') }}</td>
    <td>{{ readProp('email') }}</td>
    <td>{{ readProp('remark') }}</td>
  `,
  styleUrls: ['./table-row.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableRowComponent {
  data = inject(SampleDataService); // inject once
  personId = input.required<string>();

  personRef = this.data.getById(this.personId);

  readProp = (prop: keyof Person) => {
    if (this.personRef.isLoading()) return '';
    return this.personRef.value()[prop] ?? '--';
  };

  /** delete the person by id */
  del = (id: string) => {
    console.log('delete', id);
    this.data.delById(id);
  };
}
