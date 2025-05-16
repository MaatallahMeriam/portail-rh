import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { NgxDatatableModule, ColumnMode } from '@swimlane/ngx-datatable';
import { DemandeService, ManagerCongesDemandeDTO } from '../../../../services/demande.service';
import { UserService, UserDTO } from '../../../../services/users.service';

@Component({
  selector: 'app-histo-dmd-conges',
  standalone: true,
  imports: [
     CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    NgxDatatableModule,
  ],
  templateUrl: './histo-dmd-conges.component.html',
  styleUrl: './histo-dmd-conges.component.scss',
})
export class HistoDmdCongesComponent implements OnInit {
  demandes: ManagerCongesDemandeDTO[] = [];
  filteredDemandes: ManagerCongesDemandeDTO[] = [];
  totalDemandes: number = 0;
  searchQuery: string = '';
  columns: any[] = [];
  ColumnMode = ColumnMode;
  isLoading: boolean = true;
  isSidebarCollapsed = false;
  private userImageCache: Map<number, string> = new Map();

  constructor(
    private demandeService: DemandeService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadDemandes();
  }

  initializeColumns(): void {
    this.columns = [
      { name: 'Collaborateur', prop: 'nom', width: 200 },
      { name: 'Type de Congé', prop: 'congeNom', width: 150 },
      { name: 'Date Début', prop: 'dateDebut', width: 120 },
      { name: 'Date Fin', prop: 'dateFin', width: 120 },
      { name: 'Durée', prop: 'duree', width: 100 },
      { name: 'Statut', prop: 'statut', width: 120 }
    ];
  }

  loadDemandes(): void {
    this.isLoading = true;
    this.demandeService.getAllCongesDemandes().subscribe({
      next: (data) => {
        this.demandes = data;
        this.filteredDemandes = [...this.demandes];
        this.totalDemandes = this.demandes.length;
        this.preloadUserImages();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des demandes:', error);
        this.isLoading = false;
      }
    });
  }

  private preloadUserImages(): void {
    const userIds = [...new Set(this.demandes.map(d => d.userId))];
    userIds.forEach(userId => {
      if (!this.userImageCache.has(userId)) {
        this.userService.getUserById(userId).subscribe({
          next: (user: UserDTO) => {
            const imageUrl = user.image ? user.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
            this.userImageCache.set(userId, imageUrl);
          },
          error: () => {
            this.userImageCache.set(userId, 'assets/icons/user-login-icon-14.png');
          }
        });
      }
    });
  }

  getPhotoUrl(userId: number): string {
    return this.userImageCache.get(userId) || 'assets/icons/user-login-icon-14.png';
  }

  onImageError(event: any): void {
    event.target.src = 'assets/icons/user-login-icon-14.png';
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  filterDemandes(): void {
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredDemandes = !query ? [...this.demandes] : 
      this.demandes.filter(demande => {
        const fullName = `${demande.nom} ${demande.prenom}`.toLowerCase();
        const congeNom = demande.congeNom.toLowerCase();
        const statut = demande.statut.toLowerCase();
        return fullName.includes(query) || 
               congeNom.includes(query) || 
               statut.includes(query);
      });
    this.totalDemandes = this.filteredDemandes.length;
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.filterDemandes();
  }

  getStatusColor(status: string): string {
    switch (status?.toUpperCase()) {
      case 'EN_ATTENTE': return '#ED6C02';
      case 'VALIDEE': return '#2E7D32';
      case 'REFUSEE': return '#D32F2F';
      default: return '#666666';
    }
  }

  getStatusClass(status: string): string {
    return `status-${(status || 'inconnu').toLowerCase().replace('_', '-')}`;
  }

  formatStatus(status: string): string {
    switch (status?.toUpperCase()) {
      case 'EN_ATTENTE': return 'En attente';
      case 'VALIDEE': return 'Validée';
      case 'REFUSEE': return 'Refusée';
      default: return 'Inconnu';
    }
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}