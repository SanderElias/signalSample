import { Component, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { injectDomRepeatOnHold } from './injectDomRepeatOnHold';

@Component({
  selector: 'mock-repeat-on-hold',
  template: `<button id="test-btn">Hold me</button>`,
  standalone: true,
})
class MockRepeatOnHoldComponent {
  count = 0;
  sideEffect = vi.fn((n: number) => { this.count += n; });
  helper = injectDomRepeatOnHold('#test-btn', 10, this.sideEffect);
}

describe('injectDomRepeatOnHold', () => {
  let fixture: any;
  let component: MockRepeatOnHoldComponent;
  let button: HTMLButtonElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MockRepeatOnHoldComponent],
      providers: [
        provideZonelessChangeDetection(),
      ],
    });
    fixture = TestBed.createComponent(MockRepeatOnHoldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('#test-btn');
    document.body.appendChild(fixture.nativeElement); // Attach to DOM for event propagation
  });

  afterEach(() => {
    document.body.removeChild(fixture.nativeElement); // Clean up
  });

  it('should create the mock component', () => {
    expect(component).toBeTruthy();
    expect(button).toBeTruthy();
  });

  // TODO: figure our how to do mousedown and up with vitest

  // it('should call sideEffect on mousedown and mouseup', async () => {
  //   button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
  //   fixture.detectChanges();
  //   await new Promise((r) => setTimeout(r, 250)); // wait for timer to trigger at least once
  //   fixture.detectChanges();
  //   button.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }));
  //   fixture.detectChanges();
  //   expect(component.count).toBeGreaterThan(0);
  //   expect(component.sideEffect).toHaveBeenCalled();
  // });

  // it('should allow changing the sideEffect function', async () => {
  //   const newFn = vi.fn();
  //   component.helper.sideEffect(newFn);
  //   button.dispatchEvent(new MouseEvent('mousedown'));
  //   await new Promise((r) => setTimeout(r, 250));
  //   button.dispatchEvent(new MouseEvent('mouseup'));
  //   expect(newFn).toHaveBeenCalled();
  // });
});
