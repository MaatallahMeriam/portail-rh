import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { UserService, UserDTO } from '../../../../services/users.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-archive-list',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    MatCardModule,
    FormsModule,
    SidebarAdminComponent,
    HeaderComponent,
    RightSidebarComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './archive-list.component.html',
  styleUrls: ['./archive-list.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ArchiveListComponent {
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  searchText: string = '';
  columns: any[] = [];
  selectedUser: UserDTO | null = null;

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadDeactivatedUsers();
  }

  initializeColumns(): void {
    this.columns = [
      { name: 'User', width: 200 },
      { prop: 'departement', name: 'Département', width: 150 },
      { prop: 'poste', name: 'Poste', width: 150 },
      { prop: 'role', name: 'Rôle', width: 100 },
      { name: 'Actions', sortable: false, width: 50 },
    ];
  }

  loadDeactivatedUsers(): void {
    this.userService.getAllDeactivatedUsers().subscribe({
      next: (users) => {
        this.users = users.map(user => ({
          ...user,
          image: this.getNormalizedImage(user.image),
        }));
        this.filteredUsers = [...this.users];
      },
      error: (error) => {
        console.error('Error fetching deactivated users:', error);
      },
    });
  }

  getNormalizedImage(image: string | undefined): string {
    return image ? image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
  }

  filterUsers(): void {
    const query = this.searchText.toLowerCase().trim();
    if (!query) {
      this.filteredUsers = [...this.users];
      return;
    }

    this.filteredUsers = this.users.filter(user => {
      const fullName = `${user.nom} ${user.prenom}`.toLowerCase();
      const departement = user.departement?.toLowerCase() || '';
      const poste = user.poste?.toLowerCase() || '';
      const role = user.role?.toLowerCase() || '';
      return (
        fullName.includes(query) ||
        departement.includes(query) ||
        poste.includes(query) ||
        role.includes(query)
      );
    });
  }

  onRowClick(event: any): void {
    if (event.type === 'click') {
      // Optional: Add row click behavior if needed
    }
  }

  toggleMenu(user: UserDTO, event: Event): void {
    event.stopPropagation();
    this.selectedUser = this.selectedUser === user ? null : user;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      this.selectedUser = null;
    }
  }

  activateUser(user: UserDTO): void {
    Swal.fire({
      title: 'Activer l\'utilisateur ?',
      text: `Voulez-vous activer ${user.nom} ${user.prenom} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, activer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.activateUser(user.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Utilisateur activé',
              text: `${user.nom} ${user.prenom} a été activé avec succès.`,
            });
            this.loadDeactivatedUsers(); // Refresh the list
          },
          error: (error) => {
            console.error('Error activating user:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de l\'activation de l\'utilisateur.',
            });
          },
        });
      }
    });
    this.selectedUser = null;
  }

  deleteUser(user: UserDTO): void {
    Swal.fire({
      title: 'Supprimer l\'utilisateur ?',
      text: `Voulez-vous vraiment supprimer ${user.nom} ${user.prenom} ? Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#230046',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Utilisateur supprimé',
              text: `${user.nom} ${user.prenom} a été supprimé avec succès.`,
            });
            this.loadDeactivatedUsers(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la suppression de l\'utilisateur.',
            });
          },
        });
      }
    });
    this.selectedUser = null;
  }

  // Remove or update this method as it’s redundant with activateUser
  archiveUser(user: UserDTO): void {
    Swal.fire({
      title: 'Réactiver l\'utilisateur ?',
      text: `Voulez-vous réactiver ${user.nom} ${user.prenom} ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, réactiver',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.updateUser(user.id, { ...user, active: true }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Utilisateur réactivé',
              text: `${user.nom} ${user.prenom} a été réactivé avec succès.`,
            });
            this.loadDeactivatedUsers();
          },
          error: (error) => {
            console.error('Error reactivating user:', error);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la réactivation de l\'utilisateur.',
            });
          },
        });
      }
    });
    this.selectedUser = null;
  }
}