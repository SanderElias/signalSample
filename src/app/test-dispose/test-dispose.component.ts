import { Component, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { DisposeChildComponent } from './dispose-child/dispose-child.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-test-dispose',
  standalone: true,
  imports: [NgIf, DisposeChildComponent, RouterLink],
  templateUrl: './test-dispose.component.html',
  styleUrls: ['./test-dispose.component.css'],
})
export class TestDisposeComponent {
  show = signal(true);
}
