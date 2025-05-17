import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SidebarAdminComponent } from '../sidebar-admin/sidebar-admin.component';
import { UserService, UserDTO } from '../../../../services/users.service';
import { EquipeService, EquipeDTO } from '../../../../services/equipe.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-archive-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarAdminComponent,
    HeaderComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './archive-list.component.html',
  styleUrls: ['./archive-list.component.scss'],
})
export class ArchiveListComponent {
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  searchText: string = '';
  columns: any[] = [];
  selectedUser: UserDTO | null = null;
  isSidebarCollapsed: boolean = false;

  constructor(
    private userService: UserService,
    private equipeService: EquipeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadDeactivatedUsers();
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  initializeColumns(): void {
    this.columns = [
      { name: 'Utilisateur', width: 180 },
      { prop: 'departement', name: 'Département', width: 150 },
      { prop: 'nomEquipe', name: 'Équipe', width: 150 },
      { prop: 'poste', name: 'Poste', width: 150 },
      { prop: 'mail', name: 'Mail', width: 200 },
      { prop: 'role', name: 'Rôle', width: 100 },
      { name: 'Actions', sortable: false, width: 120 },
    ];
  }

  loadDeactivatedUsers(): void {
    this.userService.getAllDeactivatedUsers().subscribe({
      next: (users) => {
        this.equipeService.getAllEquipes().subscribe({
          next: (equipes) => {
            this.users = users.map(user => ({
              ...user,
              image: this.getNormalizedImage(user.image),
              nomEquipe: equipes.find(e => e.id === user.equipeId)?.nom
            }));
            this.filteredUsers = [...this.users];
          },
          error: (error) => {
            console.error('Error fetching teams:', error);
            this.users = users.map(user => ({
              ...user,
              image: this.getNormalizedImage(user.image)
            }));
            this.filteredUsers = [...this.users];
          }
        });
      },
      error: (error) => {
        console.error('Error fetching deactivated users:', error);
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs archivés', 'error');
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
      const mail = user.mail?.toLowerCase() || '';
      const nomEquipe = user.nomEquipe?.toLowerCase() || '';
      return (
        fullName.includes(query) ||
        departement.includes(query) ||
        poste.includes(query) ||
        role.includes(query) ||
        mail.includes(query) ||
        nomEquipe.includes(query)
      );
    });
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
            this.loadDeactivatedUsers();
            this.selectedUser = null;
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
            this.loadDeactivatedUsers();
            this.selectedUser = null;
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
  }

 

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.action-icon')) {
      this.selectedUser = null;
    }
  }
}