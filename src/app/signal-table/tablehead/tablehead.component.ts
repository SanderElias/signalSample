import { Component, model } from '@angular/core';
import type { PersonProps } from 'src/app/sample-data.service';
import { PropNameComponent } from './prop-name.component';

@Component({
  selector: 'thead',
  standalone: true,
  imports: [PropNameComponent],
  template: `
    <tr>
      <th propName="id">id</th>
      <th propName="screenName">Screen name</th>
      <th propName="firstName">First name</th>
      <th propName="lastName">Last name</th>
      <th propName="phone">Phone</th>
      <th propName="email">Email</th>
      <th propName="remark">Remark</th>
    </tr>
  `,
  styleUrl: './tablehead.component.css',
})
export class TableHeadComponent {
  sortProp = model.required<string | undefined>();
  order = model.required<number>();

  // orderBy sets the property to sort by and flips the order if it's the same property.
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
}
