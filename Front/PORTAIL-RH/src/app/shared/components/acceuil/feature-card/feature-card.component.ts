import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feature-card.component.html',
  styleUrl: './feature-card.component.scss',
  animations: [
    trigger('hover', [
      state('normal', style({
        transform: 'translateY(0)'
      })),
      state('hovered', style({
        transform: 'translateY(-8px)'
      })),
      transition('normal <=> hovered', animate('200ms ease-in-out'))
    ])
  ]
})
export class FeatureCardComponent {
  @Input() icon: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  
  hoverState: 'normal' | 'hovered' = 'normal';
  
  onMouseEnter() {
    this.hoverState = 'hovered';
  }
  
  onMouseLeave() {
    this.hoverState = 'normal';
  }
  
  getIconPath(): string {
    switch(this.icon) {
      case 'users':
        return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
      case 'chart-line':
        return 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z';
      case 'calendar-check':
        return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      case 'graduation-cap':
        return 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222';
      default:
        return 'M13 10V3L4 14h7v7l9-11h-7z';
    }
  }
}