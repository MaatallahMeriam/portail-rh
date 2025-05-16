import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SidebarComponent } from '../sidebar-collab/sidebar.component';
import { PublicationService, PublicationDTO, CommentDTO, CommentRequest, IdeaRatingRequest, CommentUpdateRequest } from '../../../../services/publication.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { trigger, transition, style, animate, state } from '@angular/animations';
import Swal from 'sweetalert2';
import { UserAvatarComponent } from './user-avatar/user-avatar.component';
import { CommentListComponent } from './comment-list/comment-list.component';
import { ImageViewerComponent } from './image-viewer/image-viewer.component';
import { RatingStarsComponent } from './rating-stars/rating-stars.component';
import { CommentFormComponent } from './comment-form/comment-form.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-idea-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule,
    MatTooltipModule,
    HeaderComponent,
    SidebarComponent,
    UserAvatarComponent,
    CommentListComponent,
    ImageViewerComponent,
    RatingStarsComponent,
    CommentFormComponent
  ],
  templateUrl: './details-idee.component.html',
  styleUrl: './details-idee.component.scss',
  animations: [
    trigger('fadeInOut', [
      state('void', style({ opacity: 0 })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(20px)', opacity: 0 }))
      ])
    ])
  ]
})
export class DetailsIdeeComponent implements OnInit {
  isSidebarCollapsed = false;
  currentRating: number = 0;
  newComment: string = '';
  idea: PublicationDTO | null = null;
  comments: CommentDTO[] = [];
  userId: string | null = null;
  private backendBaseUrl = 'http://localhost:8080';
  private ideaId: number | null = null;
  selectedImage: string | null = null;
  editingCommentId: number | null = null;
  editedCommentContent: string = '';
  isLoading: boolean = true;

  constructor(
    private publicationService: PublicationService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
  this.userId = this.authService.getUserIdFromToken()?.toString() || null;
  console.log('User ID:', this.userId); // Débogage
  if (!this.userId) {
    this.showError('Utilisateur non authentifié. Veuillez vous connecter.');
    this.isLoading = false;
    this.router.navigate(['/login']); // Redirection vers la page de connexion
    return;
  }
  
  this.route.paramMap.subscribe(params => {
    const ideaIdParam = params.get('id');
    this.ideaId = ideaIdParam ? Number(ideaIdParam) : null;
    console.log('Idea ID:', this.ideaId); // Débogage
    if (this.ideaId) {
      this.loadIdeaDetails(this.ideaId);
      this.loadComments(this.ideaId);
      this.loadUserRating(this.ideaId);
    } else {
      this.showError('ID de l\'idée non trouvé.');
      this.isLoading = false;
    }
  });
}
  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return 'assets/icons/user-login-icon-14.png';
    }
    if (imagePath.startsWith('http://localhost:8080/')) {
      return imagePath;
    }
    return `${this.backendBaseUrl}/${imagePath.replace(/\\/g, '/')}`;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/icons/user-login-icon-14.png';
  }

  openImageModal(imageUrl: string): void {
  console.log('Opening image modal with URL:', imageUrl); // Débogage
  this.selectedImage = imageUrl;
}

  closeImageModal(): void {
    this.selectedImage = null;
  }

  loadIdeaDetails(ideaId: number): void {
    this.isLoading = true;
    this.publicationService.getPublicationById(ideaId).subscribe({
      next: (idea) => {
        if (idea && idea.id !== undefined && idea.id === ideaId) {
          this.idea = idea;
          this.currentRating = this.getUserRating(ideaId) || 0;
        } else {
          this.showError('Idée non trouvée ou invalide.');
          this.idea = null;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.showError(err.message);
        this.isLoading = false;
      }
    });
  }

  loadComments(ideaId: number): void {
    this.publicationService.getCommentsByPublicationId(ideaId).subscribe({
      next: (comments) => {
        this.comments = comments.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err) => console.error('Erreur lors du chargement des commentaires', err)
    });
  }

  loadUserRating(ideaId: number): void {
    if (this.userId) {
      this.publicationService.getIdeaRatingsByPublicationId(ideaId).subscribe({
        next: (ratings) => {
          const userRating = ratings.find(r => r.userId.toString() === this.userId);
          this.currentRating = userRating ? userRating.rate : 0;
        },
        error: (err) => console.error('Erreur lors du chargement des évaluations', err)
      });
    }
  }

  setRating(rating: number): void {
    if (!this.userId || !this.ideaId) {
      this.showError('Idée non chargée ou utilisateur non authentifié.');
      return;
    }
    
    const request: IdeaRatingRequest = { 
      userId: Number(this.userId), 
      publicationId: this.ideaId, 
      rate: rating 
    };
    
    this.publicationService.createIdeaRating(request).subscribe({
      next: () => {
        this.currentRating = rating;
        this.loadUserRating(this.ideaId!);
        this.showSuccess('Évaluation enregistrée !');
      },
      error: (err) => this.showError(err.message)
    });
  }

  addComment(content: string): void {
  console.log('addComment called with:', { userId: this.userId, ideaId: this.ideaId, content }); // Débogage
  if (!this.userId) {
    this.showError('Utilisateur non authentifié. Veuillez vous connecter.');
    this.router.navigate(['/login']);
    return;
  }
  if (!this.ideaId) {
    this.showError('ID de l\'idée non trouvé.');
    return;
  }
  if (!content.trim()) {
    this.showError('Veuillez entrer un commentaire valide.');
    return;
  }

  const commentRequest: CommentRequest = {
    userId: Number(this.userId),
    publicationId: this.ideaId,
    content: content
  };

  this.publicationService.createComment(this.ideaId, commentRequest).subscribe({
    next: (comment) => {
      console.log('Comment added:', comment); // Débogage
      this.comments = [comment, ...this.comments];
      this.newComment = ''; // Réinitialisation
      this.showSuccess('Commentaire ajouté !');
    },
    error: (err) => {
      console.error('Erreur lors de l\'ajout du commentaire:', err); // Débogage
      this.showError('Impossible d\'ajouter le commentaire : ' + err.message);
    }
  });
}

  startEditingComment(comment: CommentDTO): void {
    this.editingCommentId = comment.id || null;
    this.editedCommentContent = comment.content;
  }

  cancelEditingComment(): void {
    this.editingCommentId = null;
    this.editedCommentContent = '';
  }

  updateComment(commentId: number, content: string): void {
    if (!this.userId || !this.ideaId || !content.trim()) {
      this.showError('Le commentaire ne peut pas être vide ou l\'idée est invalide.');
      return;
    }
    
    const updateRequest: CommentUpdateRequest = {
      userId: Number(this.userId),
      publicationId: this.ideaId,
      content: content
    };
    
    this.publicationService.updateComment(commentId, updateRequest).subscribe({
      next: (updatedComment) => {
        this.comments = this.comments.map(c => c.id === commentId ? updatedComment : c);
        this.cancelEditingComment();
        this.showSuccess('Commentaire mis à jour !');
      },
      error: (err) => this.showError(err.message)
    });
  }

  deleteComment(commentId: number): void {
    if (!this.userId || !commentId) {
      this.showError('Utilisateur ou commentaire non valide.');
      return;
    }
    
    Swal.fire({
      title: 'Confirmation',
      text: 'Voulez-vous vraiment supprimer ce commentaire ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#E5007F',
      cancelButtonColor: '#5b2e91',
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicationService.deleteComment(commentId, Number(this.userId)).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c.id !== commentId); // Mise à jour locale
            this.showSuccess('Commentaire supprimé !');
          },
          error: (err) => this.showError(err.message)
        });
      }
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  getUserRating(ideaId: number): number {
    return this.currentRating;
  }
  
  private showError(message: string): void {
    Swal.fire({
      title: 'Erreur',
      text: message,
      icon: 'error',
      confirmButtonColor: '#5b2e91'
    });
  }
  
  private showSuccess(message: string): void {
    Swal.fire({
      title: 'Succès',
      text: message,
      icon: 'success',
      confirmButtonColor: '#5b2e91',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });
  }
}