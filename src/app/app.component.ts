import { Component, WritableSignal, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PersonProps, SampleDataService } from './sample-data.service';
import { Person } from './utils';
import { DataRowComponent } from './data-row/data-row.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, DataRowComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  data = inject(SampleDataService)
  pageSize = signal(20);
  sortProp = signal<PersonProps>('firstName', { equal: () => false });
  currentPage = signal(0);
  list = computed(() => this.data.getIdList(this.sortProp())());
  pageCount = computed(() => Math.ceil(this.list().length / this.pageSize()));
  page = computed(() => {
    const page = [] as (WritableSignal<string | undefined>)[];
    for (let i = 0; i < this.pageSize(); i++) {
      page.push(signal(undefined));
    }
    return page;
  });

  dummy = effect(() => {
    const first = this.currentPage() * this.pageSize();
    const list = this.data.getIdList(this.sortProp());
    this.page().forEach((_, i) => {
      // replace the id's to show.
      this.page()[i].set(list()[first + i] ?? undefined);
    });
  }, { allowSignalWrites: true });

  navigate = (relative: number) => {
    const newPage = this.currentPage() + relative;
    if (newPage >= 0 && newPage < this.pageCount()) {
      this.currentPage.set(newPage);
    }
  }

  sortBy = (prop: PersonProps) => {
    this.sortProp.set(prop);
  }

  goPage = (page: number) => {
    if (page >= 0 && page < this.pageCount()) {
      this.currentPage.set(page);
    }
  }

}
