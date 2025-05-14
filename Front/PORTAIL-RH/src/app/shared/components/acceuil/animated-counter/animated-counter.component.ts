import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-animated-counter',
  standalone: true,
  imports: [CommonModule],
  template: `<span>{{ displayValue }}</span>`,
  styles: []
})
export class AnimatedCounterComponent implements OnInit {
  @Input() startValue: number = 0;
  @Input() endValue: number = 100;
  @Input() duration: number = 2000; // in milliseconds
  @Input() delay: number = 0; // in milliseconds
  
  displayValue: number | string = 0;
  
  ngOnInit() {
    setTimeout(() => {
      this.animateValue(this.startValue, this.endValue, this.duration);
    }, this.delay);
  }
  
  animateValue(start: number, end: number, duration: number) {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      this.displayValue = Math.floor(progress * (end - start) + start);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }
}