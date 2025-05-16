import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule
  ],
  template: `
    <div class="comment-form">
      <textarea 
        [(ngModel)]="commentText" 
        placeholder="Partagez votre avis..." 
        rows="2" 
        class="comment-input"
        [class.has-content]="commentText.trim().length > 0">
      </textarea>
      
      <button 
        mat-flat-button 
        class="submit-btn" 
        [disabled]="commentText.trim().length === 0"
        [class.active]="commentText.trim().length > 0"
        (click)="onSubmit()"
        matRipple>
        <mat-icon>send</mat-icon>
        <span>Commenter</span>
      </button>
    </div>
  `,
  styles: [`
    .comment-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .comment-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #ced4da;
      border-radius: 12px;
      font-size: 0.95rem;
      color: #343a40;
      resize: vertical;
      transition: all 0.3s ease;
      
      &:focus {
        border-color: #5b2e91;
        box-shadow: 0 0 0 2px rgba(91, 46, 145, 0.15);
        outline: none;
      }
      
      &.has-content {
        border-color: #5b2e91;
      }
    }
    
    .submit-btn {
      align-self: flex-end;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      background-color: #e0e0e0;
      color: #6c757d;
      transition: all 0.3s ease;
      
      mat-icon {
        font-size: 16px;
        transition: transform 0.3s ease;
      }
      
      &.active {
        background-color: #5b2e91;
        color: white;
        
        mat-icon {
          transform: translateX(2px);
        }
      }
      
      &:hover.active {
        background-color: #230046;
        box-shadow: 0 2px 8px rgba(91, 46, 145, 0.3);
      }
    }
    
    @media screen and (max-width: 480px) {
      .submit-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CommentFormComponent {
  @Input() commentText: string = '';
  @Output() commentTextChange = new EventEmitter<string>();
  @Output() submitComment = new EventEmitter<string>();
  
  onSubmit(): void {
  if (this.commentText.trim()) {
    console.log('Emitting comment:', this.commentText); // Débogage
    this.submitComment.emit(this.commentText);
    this.commentText = '';
    this.commentTextChange.emit(this.commentText);
  } else {
    console.warn('Tentative de soumission d\'un commentaire vide'); // Débogage
  }
}
}