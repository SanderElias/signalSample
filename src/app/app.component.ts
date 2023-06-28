import { CommonModule } from '@angular/common';
import { Component, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataRowComponent } from './data-row/data-row.component';
import { injectDomRepeatOnHold } from './injectDomRepeatOnHold';
import { PersonProps, SampleDataService } from './sample-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DataRowComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  /** injections */
  data = inject(SampleDataService)

  pageSize = signal(20); // the number of rows to show per page.
  sortProp = signal<PersonProps | undefined>(undefined, { equal: () => false }); // force update, even if the value is the same. we need this to handle reverse sorting.
  currentPage = signal(0); // the current page to show.
  list = computed(() => this.data.getIdList(this.sortProp())()); // the complete list of ID's to use, sorted by the current sortProp.
  pageCount = computed(() => Math.ceil(this.list().length / this.pageSize())); // calculate the number of pages.
  /**
   * this creates a "page" which is a list of signals.
   * As I'm using this in a ngFor, it will not create new rows when the list changes.
   * the only time the rows are recreated is when the page-size changes.
   * This prevents DOM trashing when paginating over a large set.
   */
  page = computed(() => {
    const page = [] as (WritableSignal<string | undefined>)[];
    for (let i = 0; i < this.pageSize(); i++) {
      page.push(signal(undefined));
    }
    return page;
  });

  /**
   * This makes the thing work. On changes it updates the the signal rows in the page array.
   * I would love a way do do this without an effect, but I can't find it.
   */
  fillPage = effect(() => {
    const first = this.currentPage() * this.pageSize(); // calculate the first item to show.
    const list = this.data.getIdList(this.sortProp()); // get the list of id's to show.
    this.page().forEach((_, i) => { // for every row in the page
      // replace the id's to show.
      this.page()[i].set(list()[first + i] ?? undefined);
    });
  }, { allowSignalWrites: true });

  // Below this line is the code for user "actions" like clicking buttons and such.
  // --------------------------------------------------------------------------------------------

  /** helpers so you can have buttons that repeat when you hold your mouse button down on them */
  prev = injectDomRepeatOnHold('#prev').subscribe(() => this.navigate(-1));
  next = injectDomRepeatOnHold('#next').subscribe(() => this.navigate(1));

  /**
   * helper to skip relative to current page, currently only used by the prev/next buttons.
   */
  navigate = (relative: number) => {
    const newPage = this.currentPage() + relative;
    if (newPage >= 0 && newPage < this.pageCount()) {
      this.currentPage.set(newPage);
    }
  }

  /**
   * helper to sort the list by a property.
   */
  sortBy = (prop: PersonProps) => {
    this.sortProp.set(prop);
  }

  /**
   * Helper to go to a specific page.
   */
  goPage = (page: number) => {
    if (page >= 0 && page < this.pageCount()) {
      this.currentPage.set(page);
    }
  }

}



