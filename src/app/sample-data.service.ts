import { Injectable, computed, resource, signal, type Signal } from '@angular/core';
import { Person } from './utils';

export type PersonProps = keyof Person;

@Injectable({
  providedIn: 'root',
})
export class SampleDataService {
  // private in-memory "database" use equal: () => false to force updates on every change.
  #db = signal(new Map<string, Person>(), { equal: () => false });

  constructor() {
    this.addFakes(150);
  }

  // in a real app, this data would come from a server.
  totalCount = computed(() => this.#db().size);

  // this would extract the data from the the pages of data from the server. (or fetch it row by row, depends...)
  getById = (id: Signal<string | undefined>) =>
    resource({
      params: id,
      loader: async ({ params }) => {
        // in a real app, this would fetch the data from the server.
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 25)); // simulate some delay
        if (this.#db().has(params ?? '')) {
          return this.#db().get(params!)!;
        }
        return {} as Person;
      },
      defaultValue: {} as Person,
    });

  delById = (id: string) => {
    if (id) {
      const db = this.#db();
      db.delete(id);
      this.#db.set(db); //update the signal
    }
  };

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
      this.#db.set(db); // update the signal
      // give the browser some time to work on the UI;
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 25 + 25));
    }
  }
}
