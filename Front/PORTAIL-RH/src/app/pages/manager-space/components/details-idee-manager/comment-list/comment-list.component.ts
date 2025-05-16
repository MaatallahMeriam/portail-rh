import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UserAvatarComponent } from '../user-avatar/user-avatar.component';
import { CommentDTO } from '../../../../../services/publication.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-comment-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatTooltipModule,
    UserAvatarComponent
  ],
  templateUrl: './comment-list.component.html',
  styleUrls: ['./comment-list.component.scss'],
  animations: [
    trigger('commentAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(10px)' }))
      ])
    ])
  ]
})
export class CommentListComponent {
  @Input() comments: CommentDTO[] = [];
  @Input() userId: string | null = null;
  @Input() editingCommentId: number | null = null;
  @Input() editedCommentContent: string = '';
  
  @Output() editComment = new EventEmitter<CommentDTO>();
  @Output() updateComment = new EventEmitter<{id: number, content: string}>();
  @Output() deleteComment = new EventEmitter<number>();
  @Output() cancelEdit = new EventEmitter<void>();
  
  private backendBaseUrl = 'http://localhost:8080';
  
  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return 'assets/icons/user-login-icon-14.png';
    }
    if (imagePath.startsWith('http://localhost:8080/')) {
      return imagePath;
    }
    return `${this.backendBaseUrl}/${imagePath.replace(/\\/g, '/')}`;
  }
  
  isCommentOwner(comment: CommentDTO): boolean {
    return this.userId !== null && comment.userId.toString() === this.userId;
  }
  
  onEditComment(comment: CommentDTO): void {
    this.editComment.emit(comment);
  }
  
  onUpdateComment(id: number): void {
    this.updateComment.emit({id, content: this.editedCommentContent});
  }
  
  onDeleteComment(id: number): void {
    this.deleteComment.emit(id);
  }
  
  onCancelEdit(): void {
    this.cancelEdit.emit();
  }
}