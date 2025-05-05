import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar-collab/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicationService, PublicationDTO, CommentDTO, CommentRequest, IdeaRatingDTO, IdeaRatingRequest } from '../../../../services/publication.service';
import { ReactionService, ReactionDTO, ReactionRequest, ReactionSummaryDTO } from '../../../../services/reaction.service';
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';

interface PublicationDTOWithId extends PublicationDTO {
  id: number; 
}

@Component({
  selector: 'app-idee-collab',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    MatIconModule,
    MatButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './idee-collab.component.html',
  styleUrl: './idee-collab.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IdeeCollabComponent implements OnInit {
  @ViewChild('postInput') postInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('editInput') editInput?: ElementRef<HTMLTextAreaElement>;

  ideas: PublicationDTOWithId[] = [];
  filteredIdeas: PublicationDTOWithId[] = [];
  newIdea: string = '';
  newTopic: string = '';
  selectedFile?: File;
  searchQuery: string = '';
  userId: string | null = null;
  editingIdeaId: number | null = null;
  editedIdeaContent: string = '';
  editedTopic: string = '';
  successMessage: string | null = null;
  isSidebarCollapsed = false;

  // Like and Comment State
  likes: { [ideaId: number]: ReactionDTO[] } = {};
  likeSummaries: { [ideaId: number]: ReactionSummaryDTO } = {};
  userLikes: { [ideaId: number]: boolean } = {};
  comments: { [ideaId: number]: CommentDTO[] } = {};
  openCommentSections: { [ideaId: number]: boolean } = {};
  newComment: { [ideaId: number]: string } = {};

  // Rating State
  userRatings: { [ideaId: number]: number } = {};

  constructor(
    private publicationService: PublicationService,
    private reactionService: ReactionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken()?.toString() || null;
    if (!this.userId) {
      console.error('User not authenticated');
      return;
    }
    this.loadIdeas();
  }

  loadIdeas(): void {
    this.publicationService.getAllIdeeBoitePosts().subscribe({
        next: (ideas) => {
            this.ideas = ideas
                .filter(idea => idea.id !== undefined)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as PublicationDTOWithId[];
            this.filteredIdeas = [...this.ideas];
            // Debug: Log the image field of each idea
            this.ideas.forEach(idea => {
                console.log(`Idea ID: ${idea.id}, Image: ${idea.image}`);
                this.loadLikes(idea.id);
                this.loadLikeSummary(idea.id);
                this.loadComments(idea.id);
                this.loadUserRating(idea.id);
            });
        },
        error: (err) => console.error('Erreur lors du chargement des idées', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  addIdea(): void {
    if (!this.newIdea.trim() || !this.newTopic.trim() || !this.userId) return;

    this.publicationService.createIdeeBoitePost(this.userId, this.newIdea, this.newTopic, this.selectedFile).subscribe({
      next: (createdIdea) => {
        if (createdIdea.id !== undefined) {
          this.ideas.unshift(createdIdea as PublicationDTOWithId);
          this.filteredIdeas = [...this.ideas];
          this.loadLikes(createdIdea.id);
          this.loadLikeSummary(createdIdea.id);
          this.loadComments(createdIdea.id);
          this.loadUserRating(createdIdea.id);
          this.newIdea = '';
          this.newTopic = '';
          this.selectedFile = undefined;
          this.postInput.nativeElement.value = '';
          this.showSuccessMessage('Idée publiée avec succès !');
        }
      },
      error: (err) => console.error('Erreur lors de la publication de l\'idée', err)
    });
  }

  searchIdeas(): void {
    this.filteredIdeas = this.ideas.filter(idea =>
      idea.topic?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      idea.idee?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  startEditing(idea: PublicationDTOWithId): void {
    this.editingIdeaId = idea.id;
    this.editedIdeaContent = idea.idee || '';
    this.editedTopic = idea.topic || '';
  }

  saveEdit(): void {
    if (!this.userId || !this.editingIdeaId) return;

    this.publicationService.updateIdeeBoitePost(this.editingIdeaId, this.userId, this.editedIdeaContent, this.editedTopic).subscribe({
      next: (updatedIdea) => {
        const index = this.ideas.findIndex(idea => idea.id === this.editingIdeaId);
        if (index !== -1) {
          this.ideas[index] = updatedIdea as PublicationDTOWithId;
          this.filteredIdeas = [...this.ideas];
        }
        this.editingIdeaId = null;
        this.editedIdeaContent = '';
        this.editedTopic = '';
        this.showSuccessMessage('Idée mise à jour avec succès !');
      },
      error: (err) => console.error('Erreur lors de la mise à jour de l\'idée', err)
    });
  }

  cancelEdit(): void {
    this.editingIdeaId = null;
    this.editedIdeaContent = '';
    this.editedTopic = '';
  }

  deleteIdea(ideaId: number): void {
    if (!this.userId) return;

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Vous ne pourrez pas récupérer cette idée !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#E5007F',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicationService.deleteIdeeBoitePost(ideaId, this.userId!).subscribe({
          next: () => {
            this.ideas = this.ideas.filter(idea => idea.id !== ideaId);
            this.filteredIdeas = [...this.ideas];
            this.showSuccessMessage('Idée supprimée avec succès !');
          },
          error: (err) => console.error('Erreur lors de la suppression de l\'idée', err)
        });
      }
    });
  }

  // Like Functionality
  loadLikes(ideaId: number): void {
    this.reactionService.getReactionsByPublicationId(ideaId).subscribe({
      next: (reactions) => {
        this.likes[ideaId] = reactions;
        this.userLikes[ideaId] = reactions.some(r => r.userId.toString() === this.userId);
      },
      error: (err) => console.error('Erreur lors du chargement des likes', err)
    });
  }

  loadLikeSummary(ideaId: number): void {
    this.reactionService.getReactionSummaryByPublicationId(ideaId).subscribe({
      next: (summary) => this.likeSummaries[ideaId] = summary,
      error: (err) => console.error('Erreur lors du chargement du résumé des likes', err)
    });
  }

  toggleLike(ideaId: number): void {
    if (!this.userId) return;

    const hasLiked = this.userLikes[ideaId] || false;
    const request: ReactionRequest = { userId: Number(this.userId), publicationId: ideaId };

    if (hasLiked) {
      this.reactionService.deleteReaction(Number(this.userId), ideaId).subscribe({
        next: () => {
          this.userLikes[ideaId] = false;
          this.loadLikes(ideaId);
          this.loadLikeSummary(ideaId);
        },
        error: (err) => console.error('Erreur lors de la suppression du like', err)
      });
    } else {
      this.reactionService.createOrUpdateReaction(request).subscribe({
        next: () => {
          this.userLikes[ideaId] = true;
          this.loadLikes(ideaId);
          this.loadLikeSummary(ideaId);
        },
        error: (err) => console.error('Erreur lors de l\'ajout du like', err)
      });
    }
  }

  isLikedByUser(ideaId: number): boolean {
    return this.userLikes[ideaId] || false;
  }

  getLikeCount(ideaId: number): number {
    return this.likeSummaries[ideaId]?.totalLikes || 0;
  }

  // Comment Functionality
  loadComments(ideaId: number): void {
    this.publicationService.getCommentsByPublicationId(ideaId).subscribe({
      next: (comments) => {
        this.comments[ideaId] = comments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err) => console.error('Erreur lors du chargement des commentaires', err)
    });
  }

  toggleCommentSection(ideaId: number): void {
    this.openCommentSections[ideaId] = !this.openCommentSections[ideaId] || false;
    if (this.openCommentSections[ideaId]) {
      this.newComment[ideaId] = this.newComment[ideaId] || '';
      this.loadComments(ideaId);
    }
  }

  isCommentSectionOpen(ideaId: number): boolean {
    return this.openCommentSections[ideaId] || false;
  }

  addComment(ideaId: number): void {
    if (!this.userId || !this.newComment[ideaId]?.trim()) return;

    const commentRequest: CommentRequest = {
      userId: Number(this.userId),
      publicationId: ideaId,
      content: this.newComment[ideaId]
    };

    this.publicationService.createComment(ideaId, commentRequest).subscribe({
      next: (comment) => {
        this.comments[ideaId] = [...(this.comments[ideaId] || []), comment].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.newComment[ideaId] = '';
        this.showSuccessMessage('Commentaire ajouté avec succès !');
      },
      error: (err) => console.error('Erreur lors de l\'ajout du commentaire', err)
    });
  }

  getComments(ideaId: number): CommentDTO[] {
    return this.comments[ideaId] || [];
  }

  getCommentCount(ideaId: number): number {
    return this.comments[ideaId]?.length || 0;
  }

  // Rating Functionality
  loadUserRating(ideaId: number): void {
    this.publicationService.getIdeaRatingsByPublicationId(ideaId).subscribe({
      next: (ratings) => {
        const userRating = ratings.find(r => r.userId.toString() === this.userId);
        this.userRatings[ideaId] = userRating ? userRating.rate : 0;
      },
      error: (err) => console.error('Erreur lors du chargement des évaluations', err)
    });
  }

  rateIdea(ideaId: number, rating: number): void {
    if (!this.userId) return;

    const ratingRequest: IdeaRatingRequest = {
      userId: Number(this.userId),
      publicationId: ideaId,
      rate: rating
    };

    this.publicationService.createIdeaRating(ratingRequest).subscribe({
      next: () => {
        this.userRatings[ideaId] = rating;
        this.showSuccessMessage('Évaluation soumise avec succès !');
      },
      error: (err) => console.error('Erreur lors de la soumission de l\'évaluation', err)
    });
  }

  getUserRating(ideaId: number): number {
    return this.userRatings[ideaId] || 0;
  }

  isAuthenticatedUser(idea: PublicationDTOWithId): boolean {
    return idea.userId.toString() === this.userId;
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 2000);
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
        console.warn('Image path is undefined, using default image');
        return 'assets/icons/user-login-icon-14.png';
    }
    if (imagePath.startsWith('http://localhost:8080/')) {
        console.log(`Image URL already formatted: ${imagePath}`);
        return imagePath;
    }
    const formattedUrl = `http://localhost:8080/${imagePath.replace(/\\/g, '/')}`;
    console.log(`Constructed Image URL: ${formattedUrl}`);
    return formattedUrl;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${imgElement.src}`);
    imgElement.src = 'assets/icons/user-login-icon-14.png'; // Fallback image
  }
}