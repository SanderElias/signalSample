import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Signal } from '@angular/core';

@Component({
  selector: 'tbody[highLight]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  styleUrls: ['./high-light-body.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HighLightBodyComponent {
  @Input({ required: true }) highLight!: Signal<string>;
}
