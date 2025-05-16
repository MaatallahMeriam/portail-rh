import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService, UserDTO, RegisterRequest, RegisterResponse } from '../../../../services/users.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';
import { EquipeService, EquipeDTO } from '../../../../services/equipe.service'; // Ajout de EquipeService
@Component({
  selector: 'app-gestion-dossier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './gestion-dossier.component.html',
  styleUrls: ['./gestion-dossier.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-in', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-out', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class GestionDossierComponent {
  showFirstForm = false;
  showFileUploadForm = false;
  selectedUser: UserDTO | null = null;
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  searchText: string = '';
  showMenu = false;

  userName: string = '';
  nom: string = '';
  prenom: string = '';
  mail: string = '';
  dateNaissance: string = '';
  poste: string = '';
  departement: string = '';
  role: string = '';
  isSidebarCollapsed = false;

  cvFile: File | null = null;
  diplomeFile: File | null = null;
  contratFile: File | null = null;
  newUserId: number | null = null;

  departementOptions: string[] = ['RH', 'CLOUD', 'DEVELOPPEMENT', 'IA', 'BA', 'BI'];
  roleOptions: string[] = ['COLLAB', 'RH', 'ADMIN', 'MANAGER'];

  columns = [
    { name: 'Utilisateur', width: 180 },
    { prop: 'departement', name: 'Département', width: 150 },
    { prop: 'poste', name: 'Poste', width: 150 },
    { prop: 'mail', name: 'Mail', width: 200 }, // Nouvelle colonne
    { prop: 'nomEquipe', name: 'Équipe', width: 150 },
    { prop: 'role', name: 'Rôle', width: 100 },
    { name: 'Actions', sortable: false, width: 60 },
  ];

  constructor(
    private userService: UserService,
    private equipeService: EquipeService, // Ajout de EquipeService
    private router: Router
  ) {
    this.loadUsers();
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  toggleMenu(row: UserDTO, event: Event): void {
    event.stopPropagation();
    this.selectedUser = this.selectedUser?.id === row.id ? null : row;
  }
  
  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      this.selectedUser = null;
    }
  }

  onRowClick(event: any) {
    // Ne fait rien si le clic provient du menu ou du bouton
    const target = event.target as HTMLElement;
    if (target.closest('.dropdown-menu') || target.closest('.menu-button')) {
      return;
    }
    // Vous pouvez ajouter une logique ici si un clic sur la ligne doit faire quelque chose
  }

  loadUsers() {
    this.userService.getAllActiveUsers().subscribe({
      next: (users) => {
        // Récupérer toutes les équipes pour associer les noms
        this.equipeService.getAllEquipes().subscribe({
          next: (equipes) => {
            // Mapper les utilisateurs avec le nom de l'équipe
            this.users = users.map(user => {
              const equipe = equipes.find(e => e.id === user.equipeId);
              return {
                ...user,
                nomEquipe: equipe ? equipe.nom : undefined // Ajout du nom de l'équipe
              };
            });
            this.filteredUsers = [...this.users];
          },
          error: (err) => {
            console.error('Erreur lors du chargement des équipes:', err);
            Swal.fire('Erreur', 'Impossible de charger les équipes', 'error');
            // Charger les utilisateurs sans nom d'équipe en cas d'erreur
            this.users = users;
            this.filteredUsers = [...users];
          }
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des utilisateurs actifs:', err);
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs actifs', 'error');
      },
    });
  }

  filterUsers() {
    if (!this.searchText) {
      this.filteredUsers = [...this.users];
      return;
    }
    const search = this.searchText.toLowerCase();
    this.filteredUsers = this.users.filter(
      (user) =>
        (user.id?.toString().includes(search) || '') ||
        (user.nom?.toLowerCase().includes(search) || '') ||
        (user.prenom?.toLowerCase().includes(search) || '') ||
        (user.departement?.toLowerCase().includes(search) || '') ||
        (user.poste?.toLowerCase().includes(search) || '') ||
        (user.role?.toLowerCase().includes(search) || '') ||
        (user.mail?.toLowerCase().includes(search) || '') || // Ajout de la recherche par mail
        (user.nomEquipe?.toLowerCase().includes(search) || '') // Ajout de la recherche par nom d'équipe
    );
  }

  toggleForm() {
    this.showFirstForm = !this.showFirstForm;
    if (!this.showFirstForm) {
      this.resetForm();
    }
  }

  toggleFileUploadForm() {
    this.showFileUploadForm = !this.showFileUploadForm;
    if (!this.showFileUploadForm) {
      this.resetFileForm();
    }
  }

  resetForm() {
    this.userName = '';
    this.nom = '';
    this.prenom = '';
    this.mail = '';
    this.dateNaissance = '';
    this.poste = '';
    this.departement = '';
    this.role = '';
    this.searchText = '';
    this.filteredUsers = [...this.users];
  }

  resetFileForm() {
    this.cvFile = null;
    this.diplomeFile = null;
    this.contratFile = null;
  }

  register() {
    if (
      !this.userName ||
      !this.nom ||
      !this.prenom ||
      !this.mail ||
      !this.dateNaissance ||
      !this.poste ||
      !this.departement ||
      !this.role
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Tous les champs sont obligatoires.',
      });
      return;
    }

    const registerRequest: RegisterRequest = {
      userName: this.userName,
      nom: this.nom,
      prenom: this.prenom,
      mail: this.mail,
      dateNaissance: this.dateNaissance,
      poste: this.poste,
      departement: this.departement,
      role: this.role,
    };

    this.userService.registerUser(registerRequest).subscribe({
      next: (response: RegisterResponse) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: response.message || 'Utilisateur enregistré avec succès ! Un mot de passe a été envoyé par e-mail.',
        });
        this.newUserId = response.id;
        this.showFirstForm = false;
        this.showFileUploadForm = true;
        this.resetForm();
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erreur lors de l\'enregistrement:', err);
        let errorMessage = 'Une erreur est survenue lors de l\'enregistrement.';
        if (err.status === 409) {
          errorMessage = 'Cet email est déjà utilisé.';
        }
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: errorMessage,
        });
      },
    });
  }

  onFileChange(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'cv') this.cvFile = file;
      if (type === 'diplome') this.diplomeFile = file;
      if (type === 'contrat') this.contratFile = file;
    }
  }

  uploadFiles() {
    if (!this.newUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Aucun utilisateur sélectionné pour l\'upload.',
      });
      return;
    }

    this.userService.uploadDossierFiles(this.newUserId, this.cvFile, this.contratFile, this.diplomeFile).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Fichiers uploadés avec succès pour l\'utilisateur !',
        });
        this.toggleFileUploadForm();
        this.resetFileForm();
        this.newUserId = null;
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload des fichiers:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: err.message || 'Une erreur est survenue lors de l\'upload des fichiers.',
        });
      },
    });
  }

  viewDetails(user: UserDTO): void {
    if (!user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID utilisateur invalide.',
      });
      return;
    }
    this.router.navigate(['/details-dossier', user.id]);
  }
          onRowActivate(event: any) {
              // Vérifier que l'événement est un clic sur une ligne (type 'click')
              if (event.type === 'click') {
                const target = event.event.target as HTMLElement;
                // Ignorer si le clic provient d'un bouton d'action
                if (target.closest('.action-icon')) {
                  return;
                }
                // Rediriger vers la page des détails de l'utilisateur
                const user: UserDTO = event.row;
                if (user.id) {
                  this.viewDetails(user);
                }
              }
            }
  deleteUser(user: UserDTO): void {
    if (!user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID utilisateur invalide.',
      });
      return;
    }

    Swal.fire({
      title: 'Voulez-vous vraiment supprimer cet utilisateur ?',
      text: `Vous allez supprimer ${user.nom} ${user.prenom}. Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: `L'utilisateur ${user.nom} ${user.prenom} a été supprimé avec succès.`,
            });
            this.users = this.users.filter((u) => u.id !== user.id);
            this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
            this.selectedUser = null;
          },
          error: (err) => {
            console.error('Erreur lors de la suppression de l\'utilisateur:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: err.message || 'Une erreur est survenue lors de la suppression.',
            });
          },
        });
      }
    });
  }

  archiveUser(user: UserDTO): void {
    if (!user.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID utilisateur invalide.',
      });
      return;
    }

    Swal.fire({
      title: 'Voulez-vous vraiment archiver cet utilisateur ?',
      text: `L'utilisateur ${user.nom} ${user.prenom} sera archivé et ne sera plus affiché dans la liste des utilisateurs actifs.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Oui, archiver',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.userService.deactivateUser(user.id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: `L'utilisateur ${user.nom} ${user.prenom} a été archivé avec succès.`,
            });
            this.users = this.users.filter((u) => u.id !== user.id);
            this.filteredUsers = this.filteredUsers.filter((u) => u.id !== user.id);
            this.selectedUser = null;
          },
          error: (err) => {
            console.error('Erreur lors de l\'archivage de l\'utilisateur:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: err.message || 'Une erreur est survenue lors de l\'archivage.',
            });
          },
        });
      }
    });
  }

  exportUsers(): void {
    this.userService.exportActiveUsersToCSV().subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Les utilisateurs actifs ont été exportés avec succès au format CSV.',
        });
      },
      error: (err) => {
        console.error('Erreur lors de l\'exportation des utilisateurs:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'exportation des utilisateurs.',
        });
      },
    });
  }
}