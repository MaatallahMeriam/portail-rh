import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, UserDTO } from '../../../../services/users.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details-dossier',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SidebarComponent,
    RightSidebarComponent,
  ],
  templateUrl: './details-dossier.component.html',
  styleUrls: ['./details-dossier.component.scss'],
})
export class DetailsDossierComponent implements OnInit {
  user: UserDTO | null = null;
  options = [
    { label: 'Gestion Documents', icon: 'assets/icons/un-journal.png', route: '/dossier-user' },
    { label: 'Infos Personnelles', icon: 'assets/icons/utilisateur.png', route: '/info-user' },
    { label: 'Historique Demandes', icon: 'assets/icons/conforme.png', route: '/dmd-user-list' },
    { label: 'Détails solde congés', icon: 'assets/icons/jour-de-conge.png', route: '/details-conges' },
  ];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.userService.getUserById(+userId).subscribe({
        next: (user: UserDTO) => {
          this.user = user;
        },
        error: (err) => {
          console.error('Erreur lors du chargement des détails de l\'utilisateur:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les détails de l\'utilisateur.',
          });
          this.router.navigate(['/gestion-dossier']);
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID utilisateur manquant.',
      });
      this.router.navigate(['/gestion-dossier']);
    }
  }

  navigateTo(route: string) {
    if (this.user && this.user.id) {
      const queryParamRoutes = ['/dossier-user', '/info-user','/details-conges','/dmd-user-list'];
      if (queryParamRoutes.includes(route)) {
        this.router.navigate([route], { queryParams: { userId: this.user.id } });
      } else {
        this.router.navigate([route, this.user.id]);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non chargé.',
      });
    }
  }
}