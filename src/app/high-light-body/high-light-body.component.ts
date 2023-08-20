import { CommonModule } from '@angular/common';
import { Component, Input, Signal } from '@angular/core';

@Component({
  selector: 'tbody[highLight]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content #view></ng-content>`,
  styleUrls: ['./high-light-body.component.css'],
})
export class HighLightBodyComponent {
  @Input({ required: true }) highLight!: Signal<string>;
}
