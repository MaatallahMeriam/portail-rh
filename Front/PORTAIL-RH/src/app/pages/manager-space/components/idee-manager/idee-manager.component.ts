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
import { AddIdeaDialogComponent } from './add-idea-dialog/add-idea-dialog.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
// Interface with required id for safer typing in this context
interface PublicationDTOWithId extends PublicationDTO {
  id: number; // Make id required for this component's context
}

@Component({
  selector: 'app-idee-manager',
  standalone: true,
  imports: [ HeaderComponent,
      MatIconModule,
      MatButtonModule,
      CommonModule,
      FormsModule,
    SideBarManagerComponent],
  templateUrl: './idee-manager.component.html',
  styleUrl: './idee-manager.component.scss'
})
export class IdeeManagerComponent implements OnInit {
  @ViewChild('postInput') postInput?: ElementRef<HTMLTextAreaElement>;
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
  editedImageFile: File | null = null;
  successMessage: string | null = null;
  isSidebarCollapsed = false;

  likes: { [ideaId: number]: ReactionDTO[] } = {};
  likeSummaries: { [ideaId: number]: ReactionSummaryDTO } = {};
  userLikes: { [ideaId: number]: boolean } = {};
  comments: { [ideaId: number]: CommentDTO[] } = {};
  openCommentSections: { [ideaId: number]: boolean } = {};
  newComment: { [ideaId: number]: string } = {};

  userRatings: { [ideaId: number]: number } = {};

  private backendBaseUrl = 'http://localhost:8080';

  constructor(   
    private router: Router,
    private publicationService: PublicationService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken()?.toString() || null;
    if (!this.userId) {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      return;
    }
    this.loadIdeas();
  }

  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return 'assets/icons/user-login-icon-14.png';
    }
    return `${this.backendBaseUrl}/${imagePath}`;
  }

  loadIdeas(): void {
    this.publicationService.getAllIdeeBoitePosts().subscribe({
      next: (ideas) => {
        this.ideas = ideas
          .filter(idea => idea.id !== undefined)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as PublicationDTOWithId[];
        this.filteredIdeas = [...this.ideas];
        this.ideas.forEach(idea => {
          this.loadLikes(idea.id);
          this.loadLikeSummary(idea.id);
          this.loadComments(idea.id);
          this.loadUserRating(idea.id);
        });
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  openAddIdeaDialog(): void {
    const dialogRef = this.dialog.open(AddIdeaDialogComponent, {
      width: '500px',
      data: { newIdea: '', newTopic: '', selectedFile: undefined }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.newIdea = result.newIdea;
        this.newTopic = result.newTopic;
        this.selectedFile = result.selectedFile;
        this.addIdea();
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onEditFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editedImageFile = input.files[0];
    }
  }

  addIdea(): void {
    if (!this.newIdea.trim() || !this.newTopic.trim() || !this.userId || !this.selectedFile) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs et sélectionner une image.', 'error');
      return;
    }

    this.publicationService.createIdeeBoitePost(this.userId, this.newIdea, this.newTopic, this.selectedFile).subscribe({
      next: (createdIdea) => {
        if (createdIdea.id !== undefined) {
          this.ideas.unshift(createdIdea as PublicationDTOWithId);
          this.filteredIdeas = [...this.ideas];
          this.loadLikes(createdIdea.id);
          this.loadLikeSummary(createdIdea.id);
          this.comments[createdIdea.id] = [];
          this.userRatings[createdIdea.id] = 0;
          this.newIdea = '';
          this.newTopic = '';
          this.selectedFile = undefined;
          this.showSuccessMessage('Idée publiée avec succès !');
        }
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  searchIdeas(): void {
    this.filteredIdeas = this.ideas.filter(idea =>
      (idea.topic?.toLowerCase().includes(this.searchQuery.toLowerCase()) || false) ||
      (idea.idee?.toLowerCase().includes(this.searchQuery.toLowerCase()) || false)
    );
  }

  startEditing(idea: PublicationDTOWithId): void {
    this.editingIdeaId = idea.id;
    this.editedIdeaContent = idea.idee || '';
    this.editedTopic = idea.topic || '';
    this.editedImageFile = null;
  }

  saveEdit(): void {
    if (!this.userId || !this.editingIdeaId || !this.editedIdeaContent.trim() || !this.editedTopic.trim()) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs.', 'error');
      return;
    }

    const idea = this.ideas.find(i => i.id === this.editingIdeaId);
    if (!idea) return;

    this.publicationService.updateIdeeBoitePost(
      this.editingIdeaId,
      this.editedIdeaContent,
      this.editedTopic,
      this.editedImageFile,
      idea.image || null,
      this.userId
    ).subscribe({
      next: (updatedIdea) => {
        const index = this.ideas.findIndex(i => i.id === this.editingIdeaId);
        if (index !== -1) {
          this.ideas[index] = updatedIdea as PublicationDTOWithId;
          this.filteredIdeas = [...this.ideas];
        }
        this.editingIdeaId = null;
        this.editedIdeaContent = '';
        this.editedTopic = '';
        this.editedImageFile = null;
        this.showSuccessMessage('Idée mise à jour avec succès !');
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  cancelEdit(): void {
    this.editingIdeaId = null;
    this.editedIdeaContent = '';
    this.editedTopic = '';
    this.editedImageFile = null;
  }

  deleteIdea(ideaId: number): void {
    if (!this.userId) {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      return;
    }

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
        this.publicationService.deleteIdeeBoitePost(ideaId).subscribe({
          next: () => {
            this.ideas = this.ideas.filter(idea => idea.id !== ideaId);
            this.filteredIdeas = [...this.ideas];
            this.showSuccessMessage('Idée supprimée avec succès !');
          },
          error: (err) => Swal.fire('Erreur', err.message, 'error')
        });
      }
    });
  }

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
    if (!this.userId) {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      return;
    }

    const hasLiked = this.userLikes[ideaId] || false;
    const request: ReactionRequest = { userId: Number(this.userId), publicationId: ideaId };

    if (hasLiked) {
      this.reactionService.deleteReaction(Number(this.userId), ideaId).subscribe({
        next: () => {
          this.userLikes[ideaId] = false;
          this.loadLikes(ideaId);
          this.loadLikeSummary(ideaId);
        },
        error: (err) => Swal.fire('Erreur', err.message, 'error')
      });
    } else {
      this.reactionService.createOrUpdateReaction(request).subscribe({
        next: () => {
          this.userLikes[ideaId] = true;
          this.loadLikes(ideaId);
          this.loadLikeSummary(ideaId);
        },
        error: (err) => Swal.fire('Erreur', err.message, 'error')
      });
    }
  }

  isLikedByUser(ideaId: number): boolean {
    return this.userLikes[ideaId] || false;
  }

  getLikeCount(ideaId: number): number {
    return this.likeSummaries[ideaId]?.totalLikes || 0;
  }

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
    if (!this.userId || !this.newComment[ideaId]?.trim()) {
      Swal.fire('Erreur', 'Veuillez entrer un commentaire.', 'error');
      return;
    }

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
      error: (err) => Swal.fire('Erreur', err.message, 'error')
    });
  }

  getComments(ideaId: number): CommentDTO[] {
    return this.comments[ideaId] || [];
  }

  getCommentCount(ideaId: number): number {
    return this.comments[ideaId]?.length || 0;
  }

  loadUserRating(ideaId: number): void {
    this.publicationService.getIdeaRatingsByPublicationId(ideaId).subscribe({
      next: (ratings) => {
        const userRating = ratings.find(r => r.userId.toString() === this.userId);
        this.userRatings[ideaId] = userRating ? userRating.rate : 0;
      },
      error: (err) => console.error('Erreur lors du chargement des évaluations', err)
    });
  }

  getAverageRating(idea: PublicationDTOWithId): number {
    return idea.averageRate ? Math.round(idea.averageRate) : 0;
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

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error(`Failed to load image: ${imgElement.src}`);
    imgElement.src = 'assets/icons/user-login-icon-14.png'; 
  }

  navigateTo(ideaId: number): void {
    this.router.navigate(['/details-idee-manager', ideaId]);
  }
}