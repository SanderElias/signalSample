import { Injectable, computed, effect, signal } from '@angular/core';
import { Person } from './utils';

export type PersonProps = keyof Person;

@Injectable({
  providedIn: 'root',
})
export class SampleDataService {
  #db = signal(new Map<string, Person>());

  constructor() {
    this.addFakes(25);
  }

  totalCount = computed(() => this.#db().size);

  getById = (id?: string) => computed(() => (id ? this.#db().get(id) : undefined));

  getIdList = (sortProp?: PersonProps, factor = 1, filter = '') =>
    computed(() => {
      if (!sortProp && filter === '') {
        return Array.from(this.#db().keys());
      }
      /**
       * note: this is expensive, but will work for lists up to ~100.000
       * In a real app, this should be taken care of server-side.
       */
      let list = [...this.#db().values()];
      if (filter !== '') {
        const fl = new RegExp(filter, 'gi');
        list = list.filter((row) => [...Object.values(row)].some((field) => fl.test(String(field))));
      }
      return (
        sortProp === undefined
          ? list
          : list.sort((a, b) => (a[sortProp] === b[sortProp] ? 0 : (a[sortProp] < b[sortProp] ? -1 : 1) * factor))
      ).map((p) => p.id);
    });

  /**
   * This is an async function.
   * In a real app, data is also coming from a server.
   * this one simulates that by waiting a bit between each add.
   * so the UI will update between each add.
   */
  async addFakes(count: number) {
    const { genFakes } = await import('./utils');
    for (let i = 0; i < count; i++) {
      const persons = await genFakes(1000);
      const db = this.#db();
      persons.forEach((person) => db.set(person.id, person));
      this.#db.set(new Map()); // make signal dirty, so everything will update. (fix for missing `signal.mutate`)
      this.#db.set(db); // store original map back in ;-P
      // give the browser some time to work on the UI;
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 25 + 25));
    }
  }
}
