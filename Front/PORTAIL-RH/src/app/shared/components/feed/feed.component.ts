import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatIconModule } from '@angular/material/icon';
import { NewsCarouselComponent } from './components/news-carousel/news-carousel.component';
import { PostCreatorComponent } from './components/post-creator/post-creator.component';
import { PostCardComponent } from './components/post-card/post-card.component';
import { ImageModalComponent } from './components/image-modal/image-modal.component';
import { SuccessMessageComponent } from './components/success-message/success-message.component';
import { PublicationService, PublicationDTO } from '../../../services/publication.service';
import { ReactionService, ReactionSummaryDTO } from '../../../services/reaction.service';
import { AuthService } from '../../../shared/services/auth.service';
import { UserService, UserDTO } from '../../../services/users.service';
import { NewsService, NewsDTO } from '../../../services/news.service';
import { AnimationService } from './services/animation.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CarouselModule,
    MatIconModule,
    NewsCarouselComponent,
    PostCreatorComponent,
    PostCardComponent,
    ImageModalComponent,
    SuccessMessageComponent,
  ],
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss'],
})
export class FeedComponent implements OnInit, AfterViewInit {
  @Input() isSidebarCollapsed: boolean = false;

  publications: PublicationDTO[] = [];
  news: NewsDTO[] = [];
  userId: string | null = null;
  userPhoto: string | null = null;
  successMessage: string | null = null;
  selectedImage: string | null = null;

  userLikes: { [id: number]: boolean } = {};
  likeSummaries: { [id: number]: ReactionSummaryDTO } = {};
  openCommentSections: { [id: number]: boolean } = {};

  constructor(
    private newsService: NewsService,
    private publicationService: PublicationService,
    private reactionService: ReactionService,
    private authService: AuthService,
    private userService: UserService,
    private animationService: AnimationService,
    private route: ActivatedRoute
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

  ngAfterViewInit(): void {
    // Vérifier si un publicationId est passé dans les queryParams
    this.route.queryParams.subscribe((params) => {
      const publicationId = params['publicationId'];
      if (publicationId) {
        this.scrollToPublication(publicationId);
      }
    });
  }

  loadUserPhoto(): void {
    if (this.userId) {
      this.userService.getUserById(Number(this.userId)).subscribe({
        next: (user: UserDTO) => {
          this.userPhoto = user.image ? user.image : null;
        },
        error: (error) => {
          console.error('Error loading user photo', error);
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
        console.error('Error loading news', err);
      },
    });
  }

  loadPublications(): void {
    this.publicationService.getAllFeedPosts().subscribe({
      next: (posts) => {
        this.publications = posts
          .filter((post) => post.id !== undefined)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) as PublicationDTO[];
        this.publications.forEach((post) => {
          if (post.id !== undefined) {
            this.loadLikes(post.id);
            this.loadLikeSummary(post.id);
          }
        });
        this.animationService.animateItems('.post-card-container');
      },
      error: (err) => console.error('Error loading publications', err),
    });
  }

  loadLikes(publicationId: number): void {
    this.reactionService.getReactionsByPublicationId(publicationId).subscribe({
      next: (reactions) => {
        this.userLikes[publicationId] = reactions.some((r) => r.userId.toString() === this.userId);
      },
      error: (err) => console.error(err),
    });
  }

  loadLikeSummary(publicationId: number): void {
    this.reactionService.getReactionSummaryByPublicationId(publicationId).subscribe({
      next: (summary) => (this.likeSummaries[publicationId] = summary),
      error: (err) => console.error(err),
    });
  }

  onPostCreated(newPost: PublicationDTO): void {
    if (newPost.id !== undefined) {
      this.showSuccessMessage('Post publiée');
      this.loadPublications();
    }
  }

  onPostUpdated(updatedPost: PublicationDTO): void {
    if (updatedPost.id !== undefined) {
      const index = this.publications.findIndex((p) => p.id === updatedPost.id);
      if (index !== -1) {
        this.publications[index] = updatedPost;
      }
      this.showSuccessMessage('Publication mise à jour avec succès !');
    }
  }

  onPostDeleted(postId: number): void {
    this.publications = this.publications.filter((post) => post.id !== postId);
    this.showSuccessMessage('Publication supprimée avec succès !');
  }

  openImageViewer(imageUrl: string): void {
    this.selectedImage = imageUrl;
    document.body.classList.add('no-scroll');
  }

  closeImageViewer(): void {
    this.selectedImage = null;
    document.body.classList.remove('no-scroll');
  }

  showSuccessMessage(message: string): void {
    this.successMessage = message;
    setTimeout(() => {
      this.successMessage = null;
    }, 3000);
  }

  getImageUrl(imagePath: string): string {
    if (imagePath && imagePath.startsWith('http://localhost:8080/')) {
      return imagePath;
    }
    return imagePath ? `http://localhost:8080/${imagePath.replace(/\\/g, '/')}` : 'assets/icons/user-login-icon-14.png';
  }

  trackByPostId(index: number, post: PublicationDTO): number | undefined {
    return post.id;
  }

  scrollToPublication(publicationId: string): void {
    setTimeout(() => {
      const publicationElement = document.getElementById(`post-${publicationId}`);
      if (publicationElement) {
        publicationElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Appliquer l'effet de surbrillance
        publicationElement.classList.add('highlight');
        setTimeout(() => {
          publicationElement.classList.remove('highlight');
        }, 2000); // Supprimer l'effet après 2 secondes
      } else {
        console.warn(`Publication avec l'ID ${publicationId} non trouvée`);
      }
    }, 500); // Délai pour s'assurer que les publications sont chargées
  }
}