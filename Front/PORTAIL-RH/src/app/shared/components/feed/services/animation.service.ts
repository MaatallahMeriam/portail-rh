import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnimationService {
  constructor() {}

  /**
   * Animate elements with a staggered effect
   * @param selector CSS selector for the elements to animate
   * @param immediate If true, all elements animate at once
   */
  animateItems(selector: string, immediate: boolean = false): void {
    setTimeout(() => {
      const items = document.querySelectorAll(selector);
      
      if (immediate) {
        items.forEach(item => {
          item.classList.add('animate');
        });
        return;
      }
      
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('animate');
        }, index * 100); // Stagger effect with 100ms delay between each item
      });
    }, 0);
  }

  /**
   * Animate an element with a fade-in effect
   * @param element DOM element to animate
   */
  fadeIn(element: HTMLElement): void {
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
      element.style.opacity = '1';
    }, 10);
  }

  /**
   * Animate an element with a fade-out effect
   * @param element DOM element to animate
   * @param callback Optional callback to run after animation completes
   */
  fadeOut(element: HTMLElement, callback?: () => void): void {
    element.style.opacity = '1';
    element.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
      element.style.opacity = '0';
      
      if (callback) {
        setTimeout(callback, 500);
      }
    }, 10);
  }
}