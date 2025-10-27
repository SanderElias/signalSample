import { Component, computed, inject, input } from '@angular/core';
import type { PersonProps } from 'src/app/sample-data.service';
import { TableHeadComponent } from './tablehead.component';

@Component({
  selector: 'th[propName]',
  template: `<ng-content></ng-content>
    @if (active()) {
      <span> {{ arrow() }}</span>
    }`,
  host: {
    '(click)': 'onClick()',
    '[class.active]': 'active()',
  },
})
export class PropNameComponent {
  propName = input.required<PersonProps>();

  th = inject(TableHeadComponent); // injecting the parent so I can call its methods.
  arrow = computed(() => (this.th.order() === 1 ? '↓' : '↑')); // arrow function to show the current sort order. uses the parents order signal.

  onClick() {
    this.th.orderBy(this.propName()); // call the parent method to sort by this property.
  }
  active = computed(() => this.th.sortProp() === this.propName()); // is this the active sorted column?
}
