import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { DemandeService, UserDemandeDetailsDTO } from '../../../../services/demande.service';
import { UserService, UserDTO } from '../../../../services/users.service';
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
    RightSidebarComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dmd-user.component.html',
  styleUrls: ['./dmd-user.component.scss'],
})
export class DmdUserComponent implements OnInit {
  user: UserDTO | null = null;
  demandes: DemandeRow[] = [];
  filteredDemandes: DemandeRow[] = [];
  columns: any[] = [];
  totalDemandes: number = 0;

  // Filter properties
  typeFilter: string = 'Tous';
  statutFilter: string = 'Tous';
  typeOptions: string[] = ['Tous', 'CONGES', 'DOCUMENT', 'LOGISTIQUE'];
  statutOptions: string[] = ['Tous', 'EN_ATTENTE', 'VALIDEE', 'REFUSEE'];

  constructor(
    private demandeService: DemandeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadUserAndDemands();
  }

  initializeColumns(): void {
    this.columns = [
      { name: 'Collaborateur', width: 200 },
      { prop: 'type', name: 'Type de Demande', width: 150 },
      { prop: 'dateEmission', name: 'Date d\'Émission', width: 150 },
      { prop: 'statut', name: 'Statut', width: 150 },
    ];
  }

  loadUserAndDemands(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID utilisateur manquant.',
      });
      this.router.navigate(['/gestion-dossier']);
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
          },
          error: (error) => {
            console.error('Error fetching demands:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors du chargement des demandes.',
            });
          },
        });
      },
      error: (error) => {
        console.error('Error fetching user details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des détails de l\'utilisateur.',
        });
        this.router.navigate(['/gestion-dossier']);
      },
    });
  }

  getNormalizedImage(image: string | undefined): string {
    return image ? image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
  }

  applyFilters(): void {
    this.filteredDemandes = this.demandes.filter(demande => {
      const matchesType = this.typeFilter === 'Tous' || demande.type === this.typeFilter;
      const matchesStatut = this.statutFilter === 'Tous' || demande.statut === this.statutFilter;
      return matchesType && matchesStatut;
    });
    this.totalDemandes = this.filteredDemandes.length;
  }

  resetFilters(): void {
    this.typeFilter = 'Tous';
    this.statutFilter = 'Tous';
    this.applyFilters();
  }
}