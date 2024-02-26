import { Component, HostBinding, HostListener, computed, inject, input } from '@angular/core';
import type { PersonProps } from 'src/app/sample-data.service';
import { TableHeadComponent } from './tablehead.component';

@Component({
  selector: 'th[propName]',
  template: `<ng-content></ng-content>
    @if (active) {
      <span> {{ arrow() }}</span>
    }`,
  standalone: true,
})
export class PropNameComponent {
  propName = input.required<PersonProps>();

  th = inject(TableHeadComponent); // injecting the parent so I can call its methods.
  arrow = computed(() => (this.th.order() === 1 ? '↓' : '↑')); // arrow function to show the current sort order. uses the parents order signal.

  @HostListener('click') onClick() {
    this.th.orderBy(this.propName()); // call the parent method to sort by this property.
  }
  @HostBinding('class.active') get active() {
    return this.th.sortProp() === this.propName(); // add the active class if this is the current sort property.
  }
}
