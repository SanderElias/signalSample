import { Injectable, computed, effect, signal } from '@angular/core';
import { Person } from './utils';

export type PersonProps = keyof Person;

@Injectable({
  providedIn: 'root',
})
export class SampleDataService {
  #dbMap = new Map<string, Person>();
  #internalCount = signal(0);
  #db = () => {
    /**
     * I'm misusing a signal as a side-effect here to make sure that whatever uses the db
     * gets triggered (inside an effect or computed) to update.
     * this is needed to work around the lack off mutable support in the current signals implementation
     */
    this.#internalCount();
    return this.#dbMap;
  };

  constructor() {
    this.addFakes(50);
  }

  totalCount = this.#internalCount.asReadonly();

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
      const db = this.#dbMap;
      persons.forEach((person) => db.set(person.id, person));
      this.#internalCount.set(db.size)
      // give the browser some time to work on the UI;
      // await new Promise((resolve) => setTimeout(resolve, Math.random() * 25 + 25));
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}
