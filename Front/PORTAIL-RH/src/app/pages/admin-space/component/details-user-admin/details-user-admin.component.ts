import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';
import { UserService, UserDTO } from '../../../../services/users.service';
import Swal from 'sweetalert2';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
@Component({
  selector: 'app-details-user-admin',
  standalone: true,
  imports: [SidebarAdminComponent,CommonModule,
      HeaderComponent,
      RightSidebarComponent,],
  templateUrl: './details-user-admin.component.html',
  styleUrl: './details-user-admin.component.scss'
})
export class DetailsUserAdminComponent implements OnInit {
  user: UserDTO | null = null;
  options = [
    { label: 'Gestion Documents', icon: 'assets/icons/un-journal.png', route: '/dossier-user-admin' },
    { label: 'Infos Personnelles', icon: 'assets/icons/utilisateur.png', route: '/info-user-admin' },
   
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
      const queryParamRoutes = ['/dossier-user-admin', '/info-user-admin'];
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