import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { DemandeService, ManagerCongesDemandeDTO } from '../../../../services/demande.service';
import { UserService, UserDTO } from '../../../../services/users.service'; // Import UserService
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-histo-dmd-conges',
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
  ],
  templateUrl: './histo-dmd-conges.component.html',
  styleUrl: './histo-dmd-conges.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HistoDmdCongesComponent {
  demandes: ManagerCongesDemandeDTO[] = [];
  filteredDemandes: ManagerCongesDemandeDTO[] = [];
  totalDemandes: number = 0;
  searchQuery: string = '';
  columns: any[] = [];
  public ColumnMode = ColumnMode; // Expose ColumnMode to the template
  private userImageCache: Map<number, string> = new Map(); // Cache for user images

  constructor(
    private demandeService: DemandeService,
    private userService: UserService, // Inject UserService
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadDemandes();
  }

  initializeColumns(): void {
    this.columns = [
      {
        name: 'Collaborateur',
        prop: 'nom',
        cellTemplate: 'collaborateurCellTemplate',
        width: 200,
      },
      {
        name: 'Nom Congé',
        prop: 'congeNom',
        width: 150,
      },
      {
        name: 'Date Début',
        prop: 'dateDebut',
        width: 120,
        pipe: {
          transform: (value: string) => this.formatDate(value),
        },
      },
      {
        name: 'Date Fin',
        prop: 'dateFin',
        width: 120,
        pipe: {
          transform: (value: string) => this.formatDate(value),
        },
      },
      {
        name: 'Durée',
        prop: 'duree',
        cellTemplate: 'dureeCellTemplate',
        width: 100,
      },
      {
        name: 'Statut',
        prop: 'statut',
        cellTemplate: 'statutCellTemplate',
        width: 120,
      },
    ];
  }

  loadDemandes(): void {
    this.demandeService.getAllCongesDemandes().subscribe({
      next: (data) => {
        this.demandes = data;
        this.filteredDemandes = [...this.demandes];
        this.totalDemandes = this.demandes.length;
        // Preload user images into the cache
        this.preloadUserImages();
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes:', error);
      },
    });
  }

  private preloadUserImages(): void {
    // Get unique user IDs from demandes
    const userIds = [...new Set(this.demandes.map(d => d.userId))];
    userIds.forEach(userId => {
      if (!this.userImageCache.has(userId)) {
        this.userService.getUserById(userId).subscribe({
          next: (user: UserDTO) => {
            const imageUrl = user.image ? user.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
            this.userImageCache.set(userId, imageUrl);
          },
          error: (error) => {
            console.error(`Erreur lors du chargement de l'image de l'utilisateur ${userId}:`, error);
            this.userImageCache.set(userId, 'assets/icons/user-login-icon-14.png'); // Fallback on error
          },
        });
      }
    });
  }

  getPhotoUrl(userId: number): string {
    return this.userImageCache.get(userId) || 'assets/icons/user-login-icon-14.png';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  filterDemandes(): void {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredDemandes = [...this.demandes];
      return;
    }

    this.filteredDemandes = this.demandes.filter((demande) => {
      const fullName = `${demande.nom} ${demande.prenom}`.toLowerCase();
      const congeNom = demande.congeNom.toLowerCase();
      const statut = demande.statut.toLowerCase();
      return (
        fullName.includes(query) ||
        congeNom.includes(query) ||
        statut.includes(query)
      );
    });
  }

  // Add methods for status styling
  getStatusColor(status: string): string {
    switch ((status || '').toUpperCase()) {
      case 'EN_ATTENTE':
        return '#ED6C02'; // $warning-color
      case 'VALIDEE':
        return '#2E7D32'; // $success-color
      case 'REFUSEE':
        return '#D32F2F'; // $error-color
      default:
        return '#666666';
    }
  }

  getStatusClass(status: string): string {
    return `status-${(status || 'inconnu').toLowerCase().replace('_', '-')}`;
  }
}