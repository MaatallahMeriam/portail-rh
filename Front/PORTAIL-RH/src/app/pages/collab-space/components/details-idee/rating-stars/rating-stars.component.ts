import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-rating-stars',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="rating-container">
      <div class="rating-stars">
        <span 
          *ngFor="let star of stars; let i = index" 
          (mouseenter)="onHover(i + 1)"
          (mouseleave)="onLeave()"
          (click)="onClick(i + 1)"
          class="star-wrapper">
          <mat-icon 
            [@starAnimation]="(hoverRating >= i + 1 || currentRating >= i + 1) ? 'filled' : 'empty'"
            class="star-icon"
            [class.active]="currentRating >= i + 1"
            [class.hover]="hoverRating >= i + 1 && hoverRating !== currentRating">
            {{ (hoverRating >= i + 1 || currentRating >= i + 1) ? 'star' : 'star_border' }}
          </mat-icon>
        </span>
      </div>
      
      <div class="rating-label">
        {{ ratingLabels[(hoverRating || currentRating) - 1] || 'Non évalué' }}
      </div>
    </div>
  `,
  styles: [`
    .rating-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    
    .rating-stars {
      display: flex;
      gap: 8px;
    }
    
    .star-wrapper {
      cursor: pointer;
      user-select: none;
    }
    
    .star-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      transition: transform 0.2s ease, color 0.2s ease;
      
      &.active {
        color: #FFD700;
      }
      
      &.hover {
        color: #FFECB3;
        transform: scale(1.2);
      }
      
      &:not(.active):not(.hover) {
        color: #d1d1d1;
      }
    }
    
    .rating-label {
      font-size: 0.9rem;
      color: #6c757d;
      font-weight: 500;
      min-height: 20px;
      text-align: center;
    }
  `],
  animations: [
    trigger('starAnimation', [
      state('empty', style({
        transform: 'scale(1)',
        color: '#d1d1d1'
      })),
      state('filled', style({
        transform: 'scale(1.1)',
        color: '#FFD700'
      })),
      transition('empty <=> filled', animate('200ms ease-in-out'))
    ])
  ]
})
export class RatingStarsComponent {
  @Input() currentRating: number = 0;
  @Output() ratingChange = new EventEmitter<number>();
  
  hoverRating: number = 0;
  stars = [1, 2, 3, 4, 5];
  ratingLabels = [
    'Insuffisant',
    'Moyen',
    'Bien',
    'Très bien',
    'Excellent'
  ];
  
  onHover(rating: number): void {
    this.hoverRating = rating;
  }
  
  onLeave(): void {
    this.hoverRating = 0;
  }
  
  onClick(rating: number): void {
    this.currentRating = rating;
    this.ratingChange.emit(rating);
  }
}