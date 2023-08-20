import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, ElementRef, NgZone, ViewChild, afterRender, inject } from '@angular/core';
import { HighLightBodyComponent } from '../high-light-body/high-light-body.component';

@Component({
  selector: 'td',
  standalone: true,
  imports: [CommonModule],
  template: `<span #org><ng-content></ng-content></span>`,
  styleUrls: ['./high-light-td.component.css'],
})
export class HighLightTDComponent {
  /** injections  */
  zone = inject(NgZone);
  tbody = inject(HighLightBodyComponent, { optional: true, skipSelf: true });
  elm = inject(ElementRef).nativeElement as HTMLElement;
  targetElm = inject(DOCUMENT).createElement('span');

  @ViewChild('org', { read: ElementRef }) org!: ElementRef<HTMLSpanElement>;

  highLight = () => {
    const source = this.org.nativeElement;
    const target = this.targetElm;
    if (!this.needsHighlight(source, target)) {
      source.hidden = false; // show the angular version.
      target.innerHTML = ''; // remove all content from the target, leaving an empty span for reuse.
    }
  };

  needsHighlight = (source: HTMLSpanElement, target: HTMLSpanElement) => {
    const sourceText = source.innerHTML;
    if (!sourceText || sourceText.trim() === '' || sourceText.trim() === '--') return false; // nothing in the source that can be highlighted
    const highLight = this.tbody?.highLight();
    if (!highLight) return false; // if there is nothing to highlight, we are done too
    const hl = new RegExp(highLight, 'gi');
    if (!hl.test(sourceText)) return false; // the filter is not in this cell, done!
    const newHtml = sourceText.replace(hl, (match) => `<mark>${match}</mark>`); // create the new content using the HTML <mark> to do the highlighting
    if (newHtml !== target.innerHTML) {
      // only rewrite the dom when there is a change. DOM writes are way more expensive as a test
      target.innerHTML = newHtml; // inject the version with the markers in there.
      source.hidden = true; // hide the Angular version
    }
    return true; // done!
  };

  constructor() {
    if (!this.tbody) {
      throw new Error(`[HighLightTDComponent] could not find the required parent \`<tbody [highLight]="someSignal<string>"\``);
    }
    this.zone.runOutsideAngular(() => {
      this.elm.appendChild(this.targetElm); // add the empty span, so its ready to go.
      afterRender(this.highLight);
    });
  }
}
