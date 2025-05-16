import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NewsService, NewsDTO } from '../../../../services/news.service';
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRippleModule } from '@angular/material/core';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-gestion-news',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    MatCardModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatRippleModule
  ],
  templateUrl: './gestion-news.component.html',
  styleUrls: ['./gestion-news.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class GestionNewsComponent {
  News: NewsDTO[] = [];
  filteredNews: NewsDTO[] = [];
  selectedNews: NewsDTO | null = null;
  showForm = false;
  isEditing = false;
  editingNews: NewsDTO | null = null;
  titre: string = '';
  description: string = '';
  imageFile: File | null = null;
  searchText: string = '';
  isSidebarCollapsed = false;

  customOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 }
    },
    nav: true,
    margin: 10
  };


  columns = [
    { prop: 'titre', name: 'Titre', width: 200 },
    { prop: 'description', name: 'Description', width: 300 },
    { prop: 'createdAt', name: 'Date', width: 150 }
  ];

  constructor(
    private newsService: NewsService,
    private authService: AuthService
  ) {
    this.loadNews();
  }

  getImageUrl(imagePath: string | undefined): string {
    if (!imagePath) {
      return 'assets/images/news-placeholder.jpg';
    }

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    return `http://localhost:8080/Uploads/news/${imagePath.replace(/\\/g, '/')}`;
  }

  loadNews() {
    this.newsService.getAllNews().subscribe({
      next: (news) => {
        this.News = this.sortNewsByDate(news);
        this.filteredNews = [...this.News];
      },
      error: (err) => this.showError('Erreur', 'Impossible de charger les actualités.')
    });
  }

  private sortNewsByDate(news: NewsDTO[]): NewsDTO[] {
    return news.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  }

  filterNews() {
    if (!this.searchText.trim()) {
      this.filteredNews = [...this.News];
      return;
    }

    const search = this.searchText.toLowerCase();
    this.filteredNews = this.News.filter(news =>
      news.titre?.toLowerCase().includes(search) ||
      news.description?.toLowerCase().includes(search)
    );
  }

  supprimer(news: NewsDTO) {
    Swal.fire({
      title: 'Confirmer la suppression',
      text: `Voulez-vous supprimer l'actualité "${news.titre}" ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.newsService.deleteNews(news.id).subscribe({
          next: () => {
            this.News = this.News.filter(n => n.id !== news.id);
            this.filteredNews = this.filteredNews.filter(n => n.id !== news.id);
            this.showSuccess('Actualité supprimée avec succès');
          },
          error: (err) => this.showError('Erreur', 'Impossible de supprimer l\'actualité.')
        });
      }
    });
  }

  modifier(news: NewsDTO) {
    this.isEditing = true;
    this.editingNews = { ...news };
    this.titre = news.titre;
    this.description = news.description;
    this.showForm = true;
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
    }
  }

  submitForm() {
    if (!this.titre.trim() || !this.description.trim()) {
      this.showError('Champs requis', 'Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      this.showError('Non authentifié', 'Veuillez vous reconnecter.');
      return;
    }

    if (this.isEditing && this.editingNews) {
      this.updateNews();
    } else {
      this.createNews(userId);
    }
  }

  private updateNews() {
    if (!this.editingNews) return;

    this.newsService.updateNews(
      this.editingNews.id,
      this.titre.trim(),
      this.description.trim(),
      this.imageFile,
      this.editingNews.imageUrl
    ).subscribe({
      next: () => {
        this.showSuccess('Actualité modifiée avec succès');
        this.loadNews();
        this.resetForm();
      },
      error: (err) => this.showError('Erreur', 'Impossible de modifier l\'actualité.')
    });
  }

  private createNews(userId: number) {
    if (!this.imageFile) {
      this.showError('Image requise', 'Veuillez sélectionner une image.');
      return;
    }

    this.newsService.createNews(
      this.titre.trim(),
      this.description.trim(),
      this.imageFile,
      userId
    ).subscribe({
      next: () => {
        this.showSuccess('Actualité créée avec succès');
        this.loadNews();
        this.resetForm();
      },
      error: (err) => this.showError('Erreur', 'Impossible de créer l\'actualité.')
    });
  }

  private resetForm() {
    this.titre = '';
    this.description = '';
    this.imageFile = null;
    this.isEditing = false;
    this.editingNews = null;
    this.showForm = false;
  }

  private showError(title: string, text: string) {
    Swal.fire({
      icon: 'error',
      title,
      text,
      confirmButtonColor: '#230046'
    });
  }

  private showSuccess(text: string) {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text,
      confirmButtonColor: '#230046',
      timer: 2000,
      showConfirmButton: false
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  @HostListener('document:keydown.escape')
  onEscapePress() {
    if (this.showForm) {
      this.toggleForm();
    }
  }
}