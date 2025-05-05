import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RightSideManagerComponent } from '../right-side-manager/right-side-manager.component';
import { FormsModule } from '@angular/forms';
import { PublicationService, PublicationDTO, CommentDTO, CommentRequest } from '../../../../services/publication.service';
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { ReactionService, ReactionDTO, ReactionRequest, ReactionSummaryDTO } from '../../../../services/reaction.service';

// Interface with required id for safer typing in this context
interface PublicationDTOWithId extends PublicationDTO {
  id: number; // Make id required for this component's context
}

@Component({
  selector: 'app-idee-manager',
  standalone: true,
  imports: [ HeaderComponent,
    SideBarManagerComponent,
    RightSideManagerComponent,
      MatIconModule,
      MatButtonModule,
      CommonModule,
      FormsModule],
  templateUrl: './idee-manager.component.html',
  styleUrl: './idee-manager.component.scss'
})
export class IdeeManagerComponent implements OnInit {
  @ViewChild('postInput') postInput!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('editInput') editInput?: ElementRef<HTMLTextAreaElement>;

  ideas: PublicationDTOWithId[] = [];
  filteredIdeas: PublicationDTOWithId[] = [];
  newIdea: string = '';
  searchQuery: string = '';
  userId: string | null = null;
  editingIdeaId: number | null = null;
  editedIdeaContent: string = '';
  successMessage: string | null = null;
  isSidebarCollapsed = false;

  // Like and Comment State
  likes: { [ideaId: number]: ReactionDTO[] } = {};
  likeSummaries: { [ideaId: number]: ReactionSummaryDTO } = {};
  userLikes: { [ideaId: number]: boolean } = {};
  comments: { [ideaId: number]: CommentDTO[] } = {};
  openCommentSections: { [ideaId: number]: boolean } = {};
  newComment: { [ideaId: number]: string } = {};

  constructor(
    private publicationService: PublicationService,
    private reactionService: ReactionService,
    private authService: AuthService,
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
        // Filter out ideas with undefined or null id and cast to PublicationDTOWithId
        this.ideas = ideas
          .filter((idea): idea is PublicationDTOWithId => idea.id !== undefined && idea.id !== null)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        this.filteredIdeas = [...this.ideas];

        // Load likes and comments for each idea
        this.ideas.forEach(idea => {
          this.loadLikes(idea.id);
          this.loadLikeSummary(idea.id);
          this.loadComments(idea.id);
        });
      },
      error: (err) => console.error('Error fetching ideas:', err)
    });
  }

  loadLikes(ideaId: number): void {
    this.reactionService.getReactionsByPublicationId(ideaId).subscribe({
      next: (reactions) => {
        this.likes[ideaId] = reactions;
        // Check if the current user has liked this idea
        const userReaction = reactions.find(r => r.userId.toString() === this.userId);
        this.userLikes[ideaId] = !!userReaction;
      },
      error: (err) => console.error(`Error fetching likes for idea ${ideaId}:`, err)
    });
  }

  loadLikeSummary(ideaId: number): void {
    this.reactionService.getReactionSummaryByPublicationId(ideaId).subscribe({
      next: (summary) => {
        this.likeSummaries[ideaId] = summary;
      },
      error: (err) => console.error(`Error fetching like summary for idea ${ideaId}:`, err)
    });
  }

  loadComments(ideaId: number): void {
    this.publicationService.getCommentsByPublicationId(ideaId).subscribe({
      next: (comments) => {
        this.comments[ideaId] = comments;
      },
      error: (err) => console.error(`Error fetching comments for idea ${ideaId}:`, err)
    });
  }

 

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredIdeas = [...this.ideas];
      return;
    }

    this.filteredIdeas = this.ideas.filter(idea => {
      const fullName = `${idea.userNom || ''} ${idea.userPrenom || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }

  adjustTextareaHeight(): void {
    const textarea = this.postInput.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  adjustCommentTextareaHeight(ideaId: number): void {
    const textarea = document.querySelector(`#comment-input-${ideaId}`) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }

  startEditing(idea: PublicationDTOWithId): void {
    if (idea.userId.toString() === this.userId && this.userId && typeof this.userId === 'string') {
      this.editingIdeaId = idea.id;
      this.editedIdeaContent = idea.idee || '';
    }
  }

  cancelEditing(): void {
    this.editingIdeaId = null;
    this.editedIdeaContent = '';
  }

  saveEditedIdea(): void {
    if (this.editingIdeaId && this.userId && typeof this.userId === 'string' && this.editedIdeaContent.trim()) {
      this.publicationService.updateIdeeBoitePost(this.editingIdeaId, this.userId, this.editedIdeaContent).subscribe({
        next: (updatedIdea) => {
          const index = this.ideas.findIndex(i => i.id === this.editingIdeaId);
          if (index !== -1) {
            this.ideas[index] = updatedIdea as PublicationDTOWithId;
            this.filteredIdeas = [...this.ideas];
          }
          this.editingIdeaId = null;
          this.editedIdeaContent = '';
          this.showSuccessMessage('Idée mise à jour avec succès !');
        },
        error: (err) => console.error('Error updating idea:', err)
      });
    }
  }

  deleteIdea(ideaId: number): void {
    if (this.userId && typeof this.userId === 'string') {
      const userId: string = this.userId;
      Swal.fire({
        title: 'Êtes-vous sûr ?',
        text: 'Cette action supprimera l\'idée de manière permanente !',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Oui, supprimer !',
        cancelButtonText: 'Annuler'
      }).then((result) => {
        if (result.isConfirmed) {
          this.publicationService.deleteIdeeBoitePost(ideaId, userId).subscribe({
            next: () => {
              this.ideas = this.ideas.filter(i => i.id !== ideaId);
              this.filteredIdeas = [...this.ideas];
              Swal.fire('Supprimé !', 'L\'idée a été supprimée.', 'success');
            },
            error: (err) => console.error('Error deleting idea:', err)
          });
        }
      });
    }
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

  toggleLike(ideaId: number): void {
    if (!this.userId) return;

    const hasLiked = this.userLikes[ideaId];
    if (hasLiked) {
      this.reactionService.deleteReaction(Number(this.userId), ideaId).subscribe({
        next: () => {
          this.userLikes[ideaId] = false;
          this.loadLikes(ideaId);
          this.loadLikeSummary(ideaId);
        },
        error: (err) => console.error(`Error unliking idea ${ideaId}:`, err)
      });
    } else {
      const reactionRequest: ReactionRequest = {
        userId: Number(this.userId),
        publicationId: ideaId
      };
      this.reactionService.createOrUpdateReaction(reactionRequest).subscribe({
        next: () => {
          this.userLikes[ideaId] = true;
          this.loadLikes(ideaId);
          this.loadLikeSummary(ideaId);
        },
        error: (err) => console.error(`Error liking idea ${ideaId}:`, err)
      });
    }
  }

  isLikedByUser(ideaId: number): boolean {
    return this.userLikes[ideaId] || false;
  }

  getLikeCount(ideaId: number): number {
    return this.likeSummaries[ideaId]?.totalLikes || 0;
  }

  toggleCommentSection(ideaId: number): void {
    this.openCommentSections[ideaId] = !this.openCommentSections[ideaId];
    if (this.openCommentSections[ideaId]) {
      this.newComment[ideaId] = '';
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
        this.comments[ideaId] = [...(this.comments[ideaId] || []), comment];
        this.newComment[ideaId] = '';
        this.adjustCommentTextareaHeight(ideaId);
        this.showSuccessMessage('Commentaire ajouté !');
      },
      error: (err) => console.error(`Error adding comment to idea ${ideaId}:`, err)
    });
  }

  getComments(ideaId: number): CommentDTO[] {
    return this.comments[ideaId] || [];
  }

  getCommentCount(ideaId: number): number {
    return this.comments[ideaId]?.length || 0;
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}