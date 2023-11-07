import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dispose-child',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dispose-child.component.html',
  styleUrls: ['./dispose-child.component.css'],
})
export class DisposeChildComponent implements Disposable {
  ngOnDestroy() {
    console.log('destroyed');
  }

  [Symbol.dispose]() {
    console.log('dispose');
  }
}
