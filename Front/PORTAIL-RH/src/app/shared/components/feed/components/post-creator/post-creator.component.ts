import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PublicationService, PublicationDTO } from '../../../../../services/publication.service';

@Component({
  selector: 'app-post-creator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './post-creator.component.html',
  styleUrls: ['./post-creator.component.scss']
})
export class PostCreatorComponent {
  @Input() userId: string | null = null;
  @Input() userPhoto: string | null = null;
  @Input() isSidebarCollapsed: boolean = false;
  @Output() postCreated = new EventEmitter<PublicationDTO>();

  newPostContent: string = '';
  selectedFile?: File;
  selectedDocument?: File;
  isSubmitting: boolean = false;
  showEmojiPicker: boolean = false;
  errorMessage: string | null = null;
  emojis: string[] = ['😊', '😂', '❤️', '👍', '😍', '😢', '😡', '🎉', '🙌', '💡'];

  constructor(private publicationService: PublicationService) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;
    }
  }

  onDocumentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedDocument = input.files[0];
      this.errorMessage = null;
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = undefined;
    const fileInput = document.getElementById('post-file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  removeSelectedDocument(): void {
    this.selectedDocument = undefined;
    const documentInput = document.getElementById('post-document-input') as HTMLInputElement;
    if (documentInput) documentInput.value = '';
  }

  toggleEmojiPicker(event: Event): void {
    event.stopPropagation();
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(emoji: string): void {
    this.newPostContent += emoji;
    this.showEmojiPicker = false;
    this.errorMessage = null;
  }

  addPost(): void {
    const isOnlyEmojis = this.newPostContent && !this.newPostContent.replace(/[\p{Emoji}]/gu, '').trim();
    const isContentEmpty = !this.newPostContent.trim() && !isOnlyEmojis && !this.selectedFile && !this.selectedDocument;

    if (isContentEmpty) {
      this.errorMessage = 'Post vide'; // Updated error message
      return;
    }

    if (!this.userId || this.isSubmitting) {
      return;
    }

    this.errorMessage = null;
    this.isSubmitting = true;

    const postObservable = this.publicationService.createFeedPost(
      this.userId,
      isOnlyEmojis ? this.newPostContent : this.newPostContent.trim(),
      this.selectedFile,
      this.selectedDocument
    );

    postObservable.subscribe({
      next: (createdPost) => {
        this.postCreated.emit(createdPost);
        this.resetForm();
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error creating post', err);
        this.isSubmitting = false;
        this.errorMessage = 'Erreur lors de la publication';
      }
    });
  }

  resetForm(): void {
    this.newPostContent = '';
    this.selectedFile = undefined;
    this.selectedDocument = undefined;
    this.showEmojiPicker = false;
    this.errorMessage = null;
    const fileInput = document.getElementById('post-file-input') as HTMLInputElement;
    const documentInput = document.getElementById('post-document-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    if (documentInput) documentInput.value = '';
  }

  getDefaultUserPhoto(): string {
    return this.userPhoto || 'assets/icons/user-login-icon-14.png';
  }
}