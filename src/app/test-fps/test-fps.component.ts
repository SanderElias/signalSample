import { Component, afterNextRender, signal } from '@angular/core';

@Component({
    selector: 'app-test-fps',
    imports: [],
    template: `
    <h1>FPS test</h1>
    <p>{{ counter() }}</p>
  `,
    styleUrl: './test-fps.component.css'
})
export class TestFPSComponent {

  counter = signal(0);

  constructor() {
    afterNextRender(async () => {
      const start = performance.now()
      while (true) {
        await new Promise(r => setTimeout(() => r(undefined), 1))
        this.counter.update(n => n+1)
        if (this.counter()%100) {
          const time = (performance.now() - start) / this.counter()
          console.log(`Average fps ${60/time}`)
        }
      }
    });
  }
}
