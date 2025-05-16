import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeService, UserDemandeDetailsDTO } from '../../../../services/demande.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';

interface DemandeRow {
  demandeId: number;
  type: string;
  statut: string;
  dateEmission: string;
  dateValidation?: string;
  userId: number;
  userFullName: string;
  userPhoto?: string;
}

@Component({
  selector: 'app-dmd-user',
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
    MatTooltipModule,
  ],
  providers: [DatePipe],
  templateUrl: './dmd-user.component.html',
  styleUrls: ['./dmd-user.component.scss'],
})
export class DmdUserComponent implements OnInit {
  user: UserDTO | null = null;
  demandes: DemandeRow[] = [];
  filteredDemandes: DemandeRow[] = [];
  columns: any[] = [];
  totalDemandes: number = 0;
  isSidebarCollapsed = false;
  isLoading = true;
  searchQuery = '';

  // Filter properties
  typeFilter: string = 'Tous';
  statutFilter: string = 'Tous';
  typeOptions: string[] = ['Tous', 'CONGES', 'DOCUMENT', 'LOGISTIQUE'];
  statutOptions: string[] = ['Tous', 'EN_ATTENTE', 'VALIDEE', 'REFUSEE'];

  constructor(
    private demandeService: DemandeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadUserAndDemands();
  }

  initializeColumns(): void {
    this.columns = [
      { name: 'Collaborateur', width: 200 },
      { prop: 'type', name: 'Type de Demande', width: 150 },
      { prop: 'dateEmission', name: "Date d'Émission", width: 150 },
      { prop: 'statut', name: 'Statut', width: 150 },
    ];
  }

  loadUserAndDemands(): void {
    this.isLoading = true;
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (!userId) {
      this.handleError('ID utilisateur manquant');
      return;
    }

    this.userService.getUserById(+userId).subscribe({
      next: (user: UserDTO) => {
        this.user = user;
        this.demandeService.getUserDemandeDetails(+userId).subscribe({
          next: (demandes: UserDemandeDetailsDTO[]) => {
            this.demandes = demandes;
            this.totalDemandes = this.demandes.length;
            this.applyFilters();
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error fetching demands:', error);
            this.handleError('Erreur lors du chargement des demandes');
          },
        });
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        this.handleError('Erreur lors du chargement des détails de l\'utilisateur');
      },
    });
  }

  getNormalizedImage(image: string | undefined): string {
    return image ? image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
  }

  onImageError(event: any): void {
    event.target.src = '/assets/icons/user-login-icon-14.png';
  }

  applyFilters(): void {
    let filtered = [...this.demandes];
    
    // Apply type filter
    if (this.typeFilter !== 'Tous') {
      filtered = filtered.filter(demande => demande.type === this.typeFilter);
    }
    
    // Apply status filter
    if (this.statutFilter !== 'Tous') {
      filtered = filtered.filter(demande => demande.statut === this.statutFilter);
    }
    
    // Apply search query if it exists
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(demande => {
        const formattedDate = this.datePipe.transform(demande.dateEmission, 'dd/MM/yyyy')?.toLowerCase() || '';
        return (
          demande.userFullName.toLowerCase().includes(query) ||
          demande.type.toLowerCase().includes(query) ||
          demande.statut.toLowerCase().includes(query) ||
          formattedDate.includes(query)
        );
      });
    }
    
    this.filteredDemandes = filtered;
    this.totalDemandes = this.filteredDemandes.length;
  }

  searchDemandes(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.typeFilter = 'Tous';
    this.statutFilter = 'Tous';
    this.searchQuery = '';
    this.applyFilters();
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'VALIDEE':
        return 'status-validated';
      case 'REFUSEE':
        return 'status-refused';
      case 'EN_ATTENTE':
        return 'status-pending';
      default:
        return '';
    }
  }

  formatStatus(status: string): string {
    switch (status) {
      case 'VALIDEE':
        return 'Validée';
      case 'REFUSEE':
        return 'Refusée';
      case 'EN_ATTENTE':
        return 'En attente';
      default:
        return status;
    }
  }

  getTypeBadgeClass(type: string): string {
    switch (type) {
      case 'CONGES':
        return 'type-conges';
      case 'DOCUMENT':
        return 'type-document';
      case 'LOGISTIQUE':
        return 'type-logistique';
      default:
        return '';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'CONGES':
        return 'fa fa-calendar-alt';
      case 'DOCUMENT':
        return 'fa fa-file-alt';
      case 'LOGISTIQUE':
        return 'fa fa-truck';
      default:
        return 'fa fa-question-circle';
    }
  }

  viewDetails(row: DemandeRow): void {
    Swal.fire({
      title: 'Détails de la demande',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p><strong>Collaborateur:</strong> ${row.userFullName}</p>
          <p><strong>Type:</strong> ${row.type}</p>
          <p><strong>Statut:</strong> ${this.formatStatus(row.statut)}</p>
          <p><strong>Date d'émission:</strong> ${new Date(row.dateEmission).toLocaleDateString()}</p>
          ${row.dateValidation ? `<p><strong>Date de validation:</strong> ${new Date(row.dateValidation).toLocaleDateString()}</p>` : ''}
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Fermer',
      confirmButtonColor: '#230046',
    });
  }

  private handleError(message: string): void {
    this.isLoading = false;
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
    });
    this.router.navigate(['/gestion-dossier']);
  }
}