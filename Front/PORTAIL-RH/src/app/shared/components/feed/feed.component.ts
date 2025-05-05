import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PublicationService, PublicationDTO, CommentRequest, CommentDTO } from '../../../services/publication.service';
import { ReactionService, ReactionRequest, ReactionDTO, ReactionSummaryDTO } from '../../../services/reaction.service';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService, UserDTO } from '../../../services/users.service';
import { Observable } from 'rxjs';
import { NewsService, NewsDTO } from '../../../services/news.service';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CarouselModule,
    MatCardModule,
    MatIconModule,
  ],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {
  publications: PublicationDTO[] = [];
  news: NewsDTO[] = [];
  newPostContent: string = '';
  selectedFile?: File;
  userId: string | null = null;
  userPhoto: string | null = null;
  successMessage: string | null = null;
  
  // Modal state for image preview
  selectedImage: string | null = null;

  // Like and Comment State
  userLikes: { [id: number]: boolean } = {};
  likeSummaries: { [id: number]: ReactionSummaryDTO } = {};
  comments: { [id: number]: CommentDTO[] } = {};
  openCommentSections: { [id: number]: boolean } = {};
  newComment: { [id: number]: string } = {};

  // Dropdown and Edit State
  openDropdowns: { [id: number]: boolean } = {};
  editingPosts: { [id: number]: boolean } = {};
  editPostContent: { [id: number]: string } = {};
  editSelectedFiles: { [id: number]: File } = {};

  customOptions: any = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    stagePadding: 20,
    margin: 15,
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 },
    },
    nav: true,
  };

  constructor(
    private newsService: NewsService,
    private publicationService: PublicationService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken()?.toString() || null;
    if (!this.userId) {
      console.error('User not authenticated');
      return;
    }
    this.loadUserPhoto();
    this.loadNews();
    this.loadPublications();
  }

  loadUserPhoto(): void {
    if (this.userId) {
      this.userService.getUserById(Number(this.userId)).subscribe({
        next: (user: UserDTO) => {
          this.userPhoto = user.image ? user.image : null;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération de la photo utilisateur', error);
        },
      });
    }
  }

  loadNews(): void {
    this.newsService.getAllNews().subscribe({
      next: (news) => {
        this.news = news;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des actualités', err);
      },
    });
  }

  loadPublications(): void {
    this.publicationService.getAllFeedPosts().subscribe({
      next: (posts) => {
        this.publications = posts
          .filter(post => post.id !== undefined)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as PublicationDTO[];
        this.publications.forEach(post => {
          if (post.id !== undefined) {
            this.loadLikes(post.id);
            this.loadLikeSummary(post.id);
            this.loadComments(post.id);
          }
        });
      },
      error: (err) => console.error('Erreur lors du chargement des publications', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onEditFileSelected(event: Event, postId: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.editSelectedFiles[postId] = input.files[0];
    }
  }

  addPost(): void {
    if (!this.newPostContent.trim() || !this.userId) return;

    const postObservable: Observable<PublicationDTO> = this.selectedFile
      ? this.publicationService.createFeedPost(this.userId, this.newPostContent, this.selectedFile)
      : this.publicationService.createFeedPost(this.userId, this.newPostContent);

    postObservable.subscribe({
      next: (createdPost) => {
        if (createdPost.id !== undefined) {
          this.publications.unshift(createdPost);
          this.publications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.loadLikes(createdPost.id);
          this.loadLikeSummary(createdPost.id);
          this.loadComments(createdPost.id);
          this.newPostContent = '';
          this.selectedFile = undefined;
          this.showSuccessMessage('Publication ajoutée avec succès !');
        }
      },
      error: (err) => console.error('Erreur lors de l\'ajout de la publication', err)
    });
  }

  getImageUrl(imagePath: string): string {
    if (imagePath && imagePath.startsWith('http://localhost:8080/')) {
      return imagePath;
    }
    return imagePath ? `http://localhost:8080/${imagePath.replace(/\\/g, '/')}` : 'assets/icons/user-login-icon-14.png';
  }

  getBackgroundImage(comment: CommentDTO): string {
    const imagePath = comment.userPhoto ? this.getImageUrl(comment.userPhoto) : 'assets/icons/user-login-icon-14.png';
    return `url(${imagePath})`;
  }

  // Image Modal Methods
  openImageModal(imageUrl: string): void {
    this.selectedImage = imageUrl;
  }

  closeImageModal(): void {
    this.selectedImage = null;
  }

  // Like Functionality
  loadLikes(publicationId: number): void {
    this.reactionService.getReactionsByPublicationId(publicationId).subscribe({
      next: (reactions) => {
        this.userLikes[publicationId] = reactions.some(r => r.userId.toString() === this.userId);
      },
      error: (err) => console.error(err)
    });
  }

  loadLikeSummary(publicationId: number): void {
    this.reactionService.getReactionSummaryByPublicationId(publicationId).subscribe({
      next: (summary) => this.likeSummaries[publicationId] = summary,
      error: (err) => console.error(err)
    });
  }

  toggleLike(publicationId: number): void {
    if (!this.userId) return;

    const hasLiked = this.userLikes[publicationId] || false;
    const request: ReactionRequest = { userId: Number(this.userId), publicationId };

    if (hasLiked) {
      this.reactionService.deleteReaction(Number(this.userId), publicationId).subscribe({
        next: () => {
          this.userLikes[publicationId] = false;
          this.loadLikeSummary(publicationId);
        },
        error: (err) => console.error(err)
      });
    } else {
      this.reactionService.createOrUpdateReaction(request).subscribe({
        next: () => {
          this.userLikes[publicationId] = true;
          this.loadLikeSummary(publicationId);
        },
        error: (err) => console.error(err)
      });
    }
  }

  isLikedByUser(publicationId: number): boolean {
    return this.userLikes[publicationId] || false;
  }

  getLikeCount(publicationId: number): number {
    return this.likeSummaries[publicationId]?.totalLikes || 0;
  }

  // Comment Functionality
  loadComments(publicationId: number): void {
    this.publicationService.getCommentsByPublicationId(publicationId).subscribe({
      next: (comments) => {
        this.comments[publicationId] = comments.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        console.log('Comments loaded:', comments);
      },
      error: (err) => console.error(err)
    });
  }

  toggleCommentSection(publicationId: number): void {
    this.openCommentSections[publicationId] = !this.openCommentSections[publicationId] || false;
    if (this.openCommentSections[publicationId]) {
      this.newComment[publicationId] = this.newComment[publicationId] || '';
      this.loadComments(publicationId);
    }
  }

  isCommentSectionOpen(publicationId: number): boolean {
    return this.openCommentSections[publicationId] || false;
  }

  addComment(publicationId: number): void {
    if (!this.userId || !this.newComment[publicationId]?.trim()) return;

    const commentRequest: CommentRequest = {
      userId: Number(this.userId),
      publicationId,
      content: this.newComment[publicationId]
    };

    this.publicationService.createComment(publicationId, commentRequest).subscribe({
      next: (comment) => {
        this.comments[publicationId] = [...(this.comments[publicationId] || []), comment].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.newComment[publicationId] = '';
        this.showSuccessMessage('Commentaire ajouté avec succès !');
      },
      error: (err) => console.error('Erreur lors de l\'ajout du commentaire', err)
    });
  }

  getComments(publicationId: number): CommentDTO[] {
    return this.comments[publicationId] || [];
  }

  getCommentCount(publicationId: number): number {
    return this.comments[publicationId]?.length || 0;
  }

  // Dropdown and Edit/Delete Functionality
  toggleDropdown(postId: number): void {
    // Close other dropdowns
    Object.keys(this.openDropdowns).forEach(id => {
      if (Number(id) !== postId) {
        this.openDropdowns[Number(id)] = false;
      }
    });
    this.openDropdowns[postId] = !this.openDropdowns[postId];
  }

  isDropdownOpen(postId: number): boolean {
    return this.openDropdowns[postId] || false;
  }

  startEditing(post: PublicationDTO): void {
    if (post.id === undefined) return;
    this.editingPosts[post.id] = true;
    this.editPostContent[post.id] = post.content || '';
    this.openDropdowns[post.id] = false; // Close dropdown
  }

  isEditing(postId: number): boolean {
    return this.editingPosts[postId] || false;
  }

  cancelEdit(postId: number): void {
    this.editingPosts[postId] = false;
    delete this.editPostContent[postId];
    delete this.editSelectedFiles[postId];
  }

  saveEdit(post: PublicationDTO): void {
    if (!this.userId || post.id === undefined) return;

    const content = this.editPostContent[post.id] || '';
    const media = this.editSelectedFiles[post.id];

    this.publicationService.updateFeedPost(post.id, this.userId, content, media).subscribe({
      next: (updatedPost) => {
        const index = this.publications.findIndex(p => p.id === post.id);
        if (index !== -1) {
          this.publications[index] = updatedPost;
        }
        this.editingPosts[post.id!] = false;
        delete this.editPostContent[post.id!];
        delete this.editSelectedFiles[post.id!];
        this.showSuccessMessage('Publication mise à jour avec succès !');
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour de la publication', err);
        this.showSuccessMessage('Erreur lors de la mise à jour.');
      }
    });
  }

  deletePost(postId: number): void {
    if (!this.userId) return;

    this.publicationService.deleteFeedPost(postId, this.userId).subscribe({
      next: () => {
        this.publications = this.publications.filter(post => post.id !== postId);
        this.showSuccessMessage('Publication supprimée avec succès !');
        delete this.openDropdowns[postId];
      },
      error: (err) => {
        console.error('Erreur lors de la suppression de la publication', err);
        this.showSuccessMessage('Erreur lors de la suppression.');
      }
    });
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 2000);
  }
}