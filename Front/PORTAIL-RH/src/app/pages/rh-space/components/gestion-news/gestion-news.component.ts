import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NewsService, NewsDTO } from '../../../../services/news.service';
import { AuthService } from '../../../../shared/services/auth.service';
import Swal from 'sweetalert2';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

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
    RightSidebarComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
],
  templateUrl: './gestion-news.component.html',
  styleUrls: ['./gestion-news.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
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

  private backendBaseUrl = 'http://localhost:8080';

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

  columns = [
    { prop: 'id', name: 'ID news', width: 100 },
    { prop: 'titre', name: 'Titre', width: 200 },
    { prop: 'description', name: 'Description', width: 300 },
    { prop: 'createdAt', name: 'Date Création', width: 150 },
  ];

  constructor(
    private newsService: NewsService,
    private authService: AuthService
  ) {
    this.loadNews();
  }

  getImageUrl(imagePath: string): string {
    return `${this.backendBaseUrl}/${imagePath}`;
  }

  loadNews() {
    this.newsService.getAllNews().subscribe({
      next: (news) => {
        this.News = news;
        this.filteredNews = [...news];
      },
      error: (err) => Swal.fire('Erreur', err.message, 'error'),
    });
  }

  filterNews() {
    if (!this.searchText) {
      this.filteredNews = [...this.News];
      return;
    }
    const search = this.searchText.toLowerCase();
    this.filteredNews = this.News.filter(
      (news) =>
        (news.titre?.toLowerCase().includes(search) || '') ||
        (news.description?.toLowerCase().includes(search) || '') ||
        (news.id?.toString().includes(search) || '')
    );
  }

  toggleMenu(news: NewsDTO) {
    this.selectedNews = this.selectedNews === news ? null : news;
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      this.selectedNews = null;
    }
  }

  supprimer(news: NewsDTO) {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous supprimer "${news.titre}" ?`,
      icon: 'warning',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.newsService.deleteNews(news.id).subscribe({
          next: () => {
            this.News = this.News.filter((n) => n.id !== news.id);
            this.filteredNews = this.filteredNews.filter((n) => n.id !== news.id);
            Swal.fire('Supprimé !', 'La news a été supprimée.', 'success');
          },
          error: (err) => Swal.fire('Erreur', err.message, 'error'),
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
    this.selectedNews = null;
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
    if (!this.titre || !this.description) {
      Swal.fire('Erreur', 'Veuillez remplir tous les champs obligatoires.', 'error');
      return;
    }

    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      Swal.fire('Erreur', 'Utilisateur non authentifié', 'error');
      return;
    }

    if (this.isEditing && this.editingNews) {
      this.newsService
        .updateNews(
          this.editingNews.id,
          this.titre,
          this.description,
          this.imageFile,
          this.editingNews.imageUrl
        )
        .subscribe({
          next: (response) => {
            Swal.fire('Succès', 'News modifiée avec succès !', 'success');
            this.loadNews();
            this.resetForm();
            this.showForm = false;
          },
          error: (err) => {
            console.error('Erreur lors de la modification de la news :', err);
            Swal.fire(
              'Erreur',
              err.error || err.message || 'Une erreur est survenue lors de la modification.',
              'error'
            );
          },
        });
    } else {
      if (!this.imageFile) {
        Swal.fire('Erreur', 'Veuillez sélectionner une image.', 'error');
        return;
      }

      this.newsService.createNews(this.titre, this.description, this.imageFile, userId).subscribe({
        next: (response) => {
          Swal.fire('Succès', 'News ajoutée !', 'success');
          this.loadNews();
          this.resetForm();
          this.showForm = false;
        },
        error: (err) => {
          console.error('Erreur lors de la création de la news :', err);
          Swal.fire(
            'Erreur',
            err.error || err.message || 'Une erreur est survenue lors de l\'ajout de la news.',
            'error'
          );
        },
      });
    }
  }

  resetForm() {
    this.titre = '';
    this.description = '';
    this.imageFile = null;
    this.isEditing = false;
    this.editingNews = null;
    this.searchText = '';
    this.filteredNews = [...this.News];
  }
}