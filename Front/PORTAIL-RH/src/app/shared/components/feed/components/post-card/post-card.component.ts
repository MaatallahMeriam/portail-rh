import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PublicationDTO, PublicationService, CommentDTO, CommentRequest, CommentUpdateRequest } from '../../../../../services/publication.service';
import { ReactionService, ReactionRequest } from '../../../../../services/reaction.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule
  ],
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.scss']
})
export class PostCardComponent implements OnInit {
  @Input() post!: PublicationDTO;
  @Input() userId: string | null = null;
  @Input() isLiked: boolean = false;
  @Input() likeCount: number = 0;
  @Input() isOwnPost: boolean = false;
  @Input() userPhoto: string | null = null;
  @Input() isSidebarCollapsed: boolean = false;

  @Output() imageClick = new EventEmitter<string>();
  @Output() postUpdated = new EventEmitter<PublicationDTO>();
  @Output() postDeleted = new EventEmitter<PublicationDTO>();
  
  isDropdownOpen: boolean = false;
  isEditing: boolean = false;
  isCommentSectionOpen: boolean = false;
  isSubmitting: boolean = false;
  
  editPostContent: string = '';
  editSelectedFile?: File;
  newComment: string = '';
  comments: CommentDTO[] = [];
  isEditingComment: boolean[] = [];
  editedCommentContent: string[] = [];
  
  timeAgo: string = '';
  userPhotoUrl: string = 'assets/icons/user-login-icon-14.png'; // Default image

  constructor(
    private publicationService: PublicationService,
    private reactionService: ReactionService
  ) {}
  
  ngOnInit(): void {
    this.updateTimeAgo();
    this.loadComments();
    
    // Log post data to debug userPhoto
    console.log('Post data:', this.post);
    
    // Set user photo URL with error handling
    this.setUserPhotoUrl();
    
    setInterval(() => {
      this.updateTimeAgo();
    }, 60000);
  }
  
  setUserPhotoUrl(): void {
    const imagePath = this.post.userPhoto;
    const defaultImage = 'assets/icons/user-login-icon-14.png';
    
    if (!imagePath) {
      console.warn('User photo path is undefined or null for post:', this.post.id);
      this.userPhotoUrl = defaultImage;
      return;
    }

    console.log('User photo path received:', imagePath);

    let fullUrl = imagePath;
    if (!imagePath.startsWith('http://localhost:8080/')) {
      fullUrl = `http://localhost:8080/${imagePath.replace(/\\/g, '/')}`;
    }
    console.log('Using user photo URL:', fullUrl);

    const img = new Image();
    img.onload = () => {
      console.log('User photo loaded successfully:', fullUrl);
      this.userPhotoUrl = fullUrl;
    };
    img.onerror = () => {
      console.error('Failed to load user photo:', fullUrl);
      this.userPhotoUrl = defaultImage;
    };
    img.src = fullUrl;
  }

  updateTimeAgo(): void {
    if (this.post.createdAt) {
      const postDate = new Date(this.post.createdAt);
      const now = new Date();
      const diffMs = now.getTime() - postDate.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 1) {
        this.timeAgo = "À l'instant";
      } else if (diffMins < 60) {
        this.timeAgo = `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
      } else if (diffMins < 1440) {
        const hours = Math.floor(diffMins / 60);
        this.timeAgo = `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(diffMins / 1440);
        if (days < 7) {
          this.timeAgo = `Il y a ${days} jour${days > 1 ? 's' : ''}`;
        } else if (days < 30) {
          const weeks = Math.floor(days / 7);
          this.timeAgo = `Il y a ${weeks} semaine${weeks > 1 ? 's' : ''}`;
        } else {
          const formatOptions: Intl.DateTimeFormatOptions = { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
          };
          this.timeAgo = postDate.toLocaleDateString('fr-FR', formatOptions);
        }
      }
    }
  }
  
  loadComments(): void {
    if (this.post.id === undefined) return;
    
    this.publicationService.getCommentsByPublicationId(this.post.id).subscribe({
      next: (comments) => {
        this.comments = comments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.isEditingComment = new Array(this.comments.length).fill(false);
        this.editedCommentContent = this.comments.map(comment => comment.content || '');
      },
      error: (err) => console.error('Error loading comments', err)
    });
  }
  
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
  
  startEditing(): void {
    this.editPostContent = this.post.content || '';
    this.isEditing = true;
    this.isDropdownOpen = false;
  }
  
  cancelEditing(): void {
    this.isEditing = false;
    this.editPostContent = '';
    this.editSelectedFile = undefined;
  }
  
  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editSelectedFile = input.files[0];
    }
  }
  
  removeEditFile(): void {
    this.editSelectedFile = undefined;
    const fileInput = document.getElementById(`edit-file-${this.post.id}`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
  
  saveEdit(): void {
    if (!this.userId || this.post.id === undefined || (!this.editPostContent.trim() && !this.editSelectedFile) || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    this.publicationService.updateFeedPost(
      this.post.id,
      this.userId as string,
      this.editPostContent,
      this.editSelectedFile
    ).subscribe({
      next: (updatedPost) => {
        this.isEditing = false;
        this.isSubmitting = false;
        this.editPostContent = '';
        this.editSelectedFile = undefined;
        this.postUpdated.emit(updatedPost);
      },
      error: (err) => {
        console.error('Error updating post', err);
        this.isSubmitting = false;
      }
    });
  }
  
  deletePost(): void {
    if (!this.userId || this.post.id === undefined || this.isSubmitting) {
      return;
    }
    
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer cette publication ? Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;
        
        if (this.post.id === undefined) {
          console.error('Post ID is undefined, cannot delete.');
          this.isSubmitting = false;
          Swal.fire('Erreur', 'Impossible de supprimer : ID de publication manquant.', 'error');
          return;
        }
        
        if (this.userId === null) {
          console.error('User ID is null, cannot delete.');
          this.isSubmitting = false;
          Swal.fire('Erreur', 'Impossible de supprimer : Identifiant utilisateur manquant.', 'error');
          return;
        }
        
        this.publicationService.deleteFeedPost(this.post.id, this.userId).subscribe({
          next: () => {
            this.isSubmitting = false;
            this.postDeleted.emit(this.post);
          },
          error: (err) => {
            console.error('Error deleting post', err);
            this.isSubmitting = false;
            Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
          }
        });
      }
    });
  }
  
  toggleLike(): void {
    if (!this.userId || this.post.id === undefined || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    if (this.isLiked) {
      this.reactionService.deleteReaction(Number(this.userId), this.post.id).subscribe({
        next: () => {
          this.isLiked = false;
          this.likeCount = Math.max(0, this.likeCount - 1);
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error removing like', err);
          this.isSubmitting = false;
        }
      });
    } else {
      const request: ReactionRequest = { 
        userId: Number(this.userId), 
        publicationId: this.post.id 
      };
      
      this.reactionService.createOrUpdateReaction(request).subscribe({
        next: () => {
          this.isLiked = true;
          this.likeCount += 1;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error adding like', err);
          this.isSubmitting = false;
        }
      });
    }
  }
  
  toggleCommentSection(): void {
    this.isCommentSectionOpen = !this.isCommentSectionOpen;
    if (this.isCommentSectionOpen) {
      this.loadComments();
    }
  }
  
  addComment(): void {
    if (!this.userId || this.post.id === undefined || !this.newComment.trim() || this.isSubmitting) {
      return;
    }
    
    this.isSubmitting = true;
    
    const commentRequest: CommentRequest = {
      userId: Number(this.userId),
      publicationId: this.post.id,
      content: this.newComment
    };
    
    this.publicationService.createComment(this.post.id, commentRequest).subscribe({
      next: (comment) => {
        this.comments.unshift(comment);
        this.newComment = '';
        this.isEditingComment = [false, ...this.isEditingComment];
        this.editedCommentContent = ['', ...this.editedCommentContent];
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error adding comment', err);
        this.isSubmitting = false;
      }
    });
  }
  
  editComment(index: number): void {
    if (this.userId && this.comments[index].id !== undefined) {
      this.isEditingComment[index] = true;
    }
  }
  
  saveEditedComment(index: number): void {
    if (!this.userId || this.comments[index].id === undefined || this.post.id === undefined || !this.editedCommentContent[index]?.trim() || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const updateRequest: CommentUpdateRequest = {
      userId: Number(this.userId),
      publicationId: this.post.id,
      content: this.editedCommentContent[index]
    };

    this.publicationService.updateComment(this.comments[index].id, updateRequest).subscribe({
      next: (updatedComment) => {
        this.comments[index] = updatedComment;
        this.isEditingComment[index] = false;
        this.isSubmitting = false;
      },
      error: (err) => {
        console.error('Error updating comment', err);
        this.isSubmitting = false;
      }
    });
  }
  
  cancelEditComment(index: number): void {
    this.isEditingComment[index] = false;
    this.editedCommentContent[index] = this.comments[index].content || '';
  }
  
  deleteComment(index: number): void {
    if (!this.userId || this.comments[index].id === undefined || this.isSubmitting) {
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer ce commentaire ? Cette action est irréversible !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.isSubmitting = true;

        const commentId = this.comments[index].id; // Capture the id
        if (commentId === undefined) {
          console.error('Comment ID is undefined, cannot delete.');
          this.isSubmitting = false;
          Swal.fire('Erreur', 'Impossible de supprimer : ID de commentaire manquant.', 'error');
          return;
        }

        this.publicationService.deleteComment(commentId, Number(this.userId)).subscribe({
          next: () => {
            this.comments.splice(index, 1);
            this.isEditingComment.splice(index, 1);
            this.editedCommentContent.splice(index, 1);
            this.isSubmitting = false;
          },
          error: (err) => {
            console.error('Error deleting comment', err);
            this.isSubmitting = false;
            Swal.fire('Erreur', 'Une erreur est survenue lors de la suppression.', 'error');
          }
        });
      }
    });
  }
  
  viewImage(): void {
    if (this.post.mediaUrl) {
      this.imageClick.emit(this.post.mediaUrl);
    }
  }
  
  downloadDocument(): void {
    if (this.post.id === undefined || !this.post.documentDownloadUrl) {
      console.error('Cannot download document: Invalid post ID or document URL');
      return;
    }
    
    this.publicationService.downloadFeedDocument(this.post.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const filename = this.post.documentDownloadUrl?.split('/').pop() || 'document';
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading document', err);
      }
    });
  }
  
  getImageUrl(imagePath: string | null | undefined): string {
    const defaultImage = 'assets/icons/user-login-icon-14.png';
    
    if (!imagePath) {
      console.warn('Image path is undefined or null');
      return defaultImage;
    }

    console.log('Image path received:', imagePath);

    let fullUrl = imagePath;
    if (!imagePath.startsWith('http://localhost:8080/')) {
      fullUrl = `http://localhost:8080/${imagePath.replace(/\\/g, '/')}`;
    }
    console.log('Using image URL:', fullUrl);

    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', fullUrl);
    };
    img.onerror = () => {
      console.error('Failed to load image:', fullUrl);
    };
    img.src = fullUrl;

    return fullUrl;
  }

  getDefaultUserPhoto(): string {
    return this.userPhoto || 'assets/icons/user-login-icon-14.png';
  }
}