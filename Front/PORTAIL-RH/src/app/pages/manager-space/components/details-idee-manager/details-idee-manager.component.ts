import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicationService, PublicationDTO, CommentDTO, CommentRequest, IdeaRatingDTO, IdeaRatingRequest } from '../../../../services/publication.service';
import { ReactionService, ReactionDTO, ReactionRequest, ReactionSummaryDTO } from '../../../../services/reaction.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-details-idee-manager',
  standalone: true,
  imports: [HeaderComponent,
    SideBarManagerComponent,
      MatIconModule,
      MatButtonModule,
      CommonModule,
      FormsModule],
  templateUrl: './details-idee-manager.component.html',
  styleUrl: './details-idee-manager.component.scss'
})
export class DetailsIdeeManagerComponent implements OnInit {
  @ViewChild('postInput') postInput?: ElementRef<HTMLTextAreaElement>;
  @ViewChild('editInput') editInput?: ElementRef<HTMLTextAreaElement>;

  isSidebarCollapsed = false;
  currentRating: number = 0;
  newComment: string = '';
  idea: PublicationDTO | null = null;
  comments: CommentDTO[] = [];
  userId: string | null = null;
  private backendBaseUrl = 'http://localhost:8080';
  private ideaId: number | null = null;
  selectedImage: string | null = null; // Nouvelle propriété pour la modal

  constructor(
    private publicationService: PublicationService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private dialog: MatDialog,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken()?.toString() || null;
    if (!this.userId) {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      return;
    }
    this.route.paramMap.subscribe(params => {
      const ideaIdParam = params.get('id');
      this.ideaId = ideaIdParam ? Number(ideaIdParam) : null;
      if (this.ideaId) {
        this.loadIdeaDetails(this.ideaId);
        this.loadComments(this.ideaId);
        this.loadUserRating(this.ideaId);
      } else {
        Swal.fire('Erreur', 'ID de l\'idée non trouvé.', 'error');
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
    this.selectedImage = imageUrl;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  loadIdeaDetails(ideaId: number): void {
    this.publicationService.getPublicationById(ideaId).subscribe({
      next: (idea) => {
        if (idea && idea.id !== undefined && idea.id === ideaId) {
          this.idea = idea;
          this.currentRating = this.getUserRating(ideaId) || 0;
        } else {
          Swal.fire('Erreur', 'Idée non trouvée ou invalide.', 'error');
          this.idea = null;
        }
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  loadComments(ideaId: number): void {
    this.publicationService.getCommentsByPublicationId(ideaId).subscribe({
      next: (comments) => {
        this.comments = comments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
      Swal.fire('Erreur', 'Idée non chargée ou utilisateur non authentifié.', 'error');
      return;
    }
    const request: IdeaRatingRequest = { userId: Number(this.userId), publicationId: this.ideaId, rate: rating };
    this.publicationService.createIdeaRating(request).subscribe({
      next: () => {
        this.currentRating = rating;
        this.loadUserRating(this.ideaId!);
        Swal.fire('Succès', 'Évaluation enregistrée !', 'success');
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  addComment(): void {
    if (!this.userId || !this.ideaId || !this.newComment.trim()) {
      Swal.fire('Erreur', 'Veuillez entrer un commentaire ou vérifier l\'idée.', 'error');
      return;
    }
    const commentRequest: CommentRequest = {
      userId: Number(this.userId),
      publicationId: this.ideaId,
      content: this.newComment
    };
    this.publicationService.createComment(this.ideaId, commentRequest).subscribe({
      next: (comment) => {
        this.comments = [comment, ...this.comments];
        this.newComment = '';
        Swal.fire('Succès', 'Commentaire ajouté !', 'success');
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  getUserRating(ideaId: number): number {
    return this.currentRating;
  }
}
