import { CommonModule, DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, NgZone, afterRender, inject, viewChild } from '@angular/core';
import { HighLightBodyComponent } from '../high-light-body/high-light-body.component';

@Component({
  selector: 'td',
  standalone: true,
  imports: [CommonModule],
  template: `<span #org><ng-content></ng-content></span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HighLightTDComponent {
  /** injections  */
  zone = inject(NgZone); // use the zone to run the highlight function outside of Angular
  tbody = inject(HighLightBodyComponent, { optional: true, skipSelf: true }); // get the tbody, so we can get the highlight signal.
  elm = inject(ElementRef).nativeElement as HTMLElement; // get the native element of this component
  fakeElm = inject(DOCUMENT).createElement('span'); // create a new span to use for the highlighted version of the content.

  angularContent = viewChild.required<string, ElementRef<HTMLSpanElement>>('org', { read: ElementRef }); // get the original content of the cell.

  highLight = () => {
    const angular = this.angularContent().nativeElement;
    const fake = this.fakeElm;
    if (!this.highlightIsDone(angular, fake)) {
      // no highlight done, so show the original content.
      angular.hidden = false;
      fake.innerHTML = ''; // and clear the fake content.
    }
  };

  highlightIsDone = (angularContent: HTMLSpanElement, fakeContent: HTMLSpanElement) => {
    const angularText = angularContent.innerHTML;
    if (!angularText || angularText.trim() === '' || angularText.trim() === '--') return false; // nothing in the source that can be highlighted
    const highLight = this.tbody?.highLight();
    if (!highLight) return false; // if there is nothing to highlight, we are done too
    const hl = new RegExp(highLight, 'gi');
    if (!hl.test(angularText)) return false; // the filter is not in this cell, done!
    const newHtml = angularText.replace(hl, (match) => `<mark>${match}</mark>`); // create the new content using the HTML <mark> to do the highlighting
    if (newHtml !== fakeContent.innerHTML) {
      // only rewrite the dom when there is a change. DOM writes are way more expensive as a test
      fakeContent.innerHTML = newHtml; // inject the version with the markers in there.
      angularContent.hidden = true; // hide the Angular version
    }
    return true; // done!
  };

  constructor() {
    if (!this.tbody) {
      throw new Error(`[HighLightTDComponent] could not find the required parent \`<tbody [highLight]="someSignal<string>"\``);
    }
    this.zone.runOutsideAngular(() => {
      this.elm.appendChild(this.fakeElm); // add the empty span, so its ready to go.
      afterRender(this.highLight); // run the highlight function after the render cycle.
    });
  }
}
