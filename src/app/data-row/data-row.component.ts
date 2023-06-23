import { Component, Input, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SampleDataService } from '../sample-data.service';

@Component({
  selector: 'tr [personId]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <td>{{person()?.id ?? '--'}}</td>
    <td>{{person()?.screenName ?? '--'}}</td>
    <td>{{person()?.firstName ?? '--'}}</td>
    <td>{{person()?.lastName ?? '--'}}</td>
    <td>{{person()?.email ?? '--'}}</td>
  `,
  styleUrls: ['./data-row.component.css']
})
export class DataRowComponent {
  sample = inject(SampleDataService);
  personId = signal<string | undefined>(undefined);
  @Input('personId') set _personId(id: string | undefined) {
    this.personId.set(id);
  }

  person = computed(() => this.sample.getById(this.personId())());

}
