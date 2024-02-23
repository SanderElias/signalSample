import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Signal, WritableSignal, effect, input } from '@angular/core';

@Component({
  selector: 'tbody[highLight]',
  standalone: true,
  imports: [CommonModule],
  template: `<ng-content></ng-content>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighLightBodyComponent {
  highLight = input<string>();
}
