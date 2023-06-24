import { Injectable, computed, signal } from '@angular/core';
import { Person } from './utils';

const db = new Map<string, Person>();

export type PersonProps = keyof Person;

@Injectable({
  providedIn: 'root'
})
export class SampleDataService {
  db = signal(new Map<string, Person>());

  constructor() {
    this.addFakes(500);
  }

  getById = (id?: string) => computed(() => id ? this.db().get(id) : undefined);

  lastSortProp = ''
  getIdList = (sortProp?: PersonProps) => computed(() => {
    if (!sortProp) {
      return [...this.db().keys()];
    }
    let factor = 1;
    if (this.lastSortProp === sortProp) {
      // need to reverse the list.
      factor = -1;
      this.lastSortProp = ''; // reset for the next time
    } else {
      this.lastSortProp = sortProp;
    }
    let list = [...this.db().values()].sort((a, b) => {
      if (a[sortProp] < b[sortProp]) return -1 * factor;
      if (a[sortProp] > b[sortProp]) return 1 * factor;
      return 0;
    }).map(p => p.id);
    return list;
  });

  async addFakes(count: number) {
    const { genFake } = await import('./utils');
    for (let i = 0; i < count; i++) {
      const person = await genFake();
      this.db.mutate(() => this.db().set(person.id, person));
      // give the browser some time to work on the UI;
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
