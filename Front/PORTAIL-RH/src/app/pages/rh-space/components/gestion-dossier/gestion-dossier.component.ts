import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService, UserDTO, RegisterRequest, RegisterResponse } from '../../../../services/users.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-gestion-dossier',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    RightSidebarComponent,
    NgxDatatableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './gestion-dossier.component.html',
  styleUrls: ['./gestion-dossier.component.scss'],
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
  password: string = '';
  confirmPassword: string = '';
  dateNaissance: string = '';
  poste: string = '';
  departement: string = '';
  role: string = '';

  cvFile: File | null = null;
  diplomeFile: File | null = null;
  contratFile: File | null = null;
  newUserId: number | null = null;

  departementOptions: string[] = ['RH', 'CLOUD', 'DEVELOPPEMENT', 'IA', 'BA', 'BI'];
  roleOptions: string[] = ['COLLAB', 'RH', 'ADMIN', 'MANAGER'];

  columns = [
    { prop: 'id', name: 'ID user', width: 100 },
    { name: 'User', width: 200 },
    { prop: 'departement', name: 'Département', width: 150 },
    { prop: 'poste', name: 'Poste', width: 150 },
    { prop: 'role', name: 'Rôle', width: 100 },
    { name: 'Actions', sortable: false, width: 50 },
  ];
$event: any;

  constructor(private userService: UserService, private router: Router) {
    this.loadUsers();
  }
  getDropdownTopPosition(event: any): number {
    // You can adjust this calculation based on your layout
    // This helps position the dropdown relative to the viewport
    const buttonHeight = 40; // Approximate height of your button
    return buttonHeight;
  }
  
  toggleMenu(row: any, event: Event): void {
    // Prevent the event from bubbling up to the row
    event.stopPropagation();
    
    // Toggle the selected user
    this.selectedUser = this.selectedUser === row ? null : row;
    
    // Add a click outside handler to close the menu
    if (this.selectedUser) {
      setTimeout(() => {
        const closeMenuHandler = (e: any) => {
          if (!e.target.closest('.dropdown-menu') && !e.target.closest('.menu-button')) {
            this.selectedUser = null;
            document.removeEventListener('click', closeMenuHandler);
          }
        };
        document.addEventListener('click', closeMenuHandler);
      });
    }
  }
  
  



  // In your ngOnInit method
ngOnInit() {
  // Add this to your existing ngOnInit
  document.addEventListener('click', (event) => {
    // Fix: Add null check for event.target
    if (this.selectedUser && event.target) {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-menu') && !target.closest('.menu-button')) {
        this.selectedUser = null;
      }
    }
  });
}

// In your onRowClick method
onRowClick(event: any) {
  // Fix: Add null check for event.target
  if (event.target) {
    const target = event.target as HTMLElement;
    if (target.closest('.dropdown-menu') || target.closest('.menu-button')) {
      event.stopPropagation();
    }
  }
}

// You already have a closeMenu method with proper typing, but let's make sure it's consistent
@HostListener('document:click', ['$event'])
closeMenu(event: Event) {
  const target = event.target as HTMLElement;
  if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
    this.selectedUser = null;
  }
}




  get passwordMismatch(): boolean {
    return this.password !== this.confirmPassword && this.confirmPassword.length > 0;
  }

  loadUsers() {
    this.userService.getAllActiveUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
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
        (user.role?.toLowerCase().includes(search) || '')
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
    this.password = '';
    this.confirmPassword = '';
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
      !this.password ||
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

    if (this.passwordMismatch) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Les mots de passe ne correspondent pas.',
      });
      return;
    }
    
    const registerRequest: RegisterRequest = {
      userName: this.userName,
      nom: this.nom,
      prenom: this.prenom,
      mail: this.mail,
      password: this.password,
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
          text: response.message || 'Utilisateur enregistré avec succès !',
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
    this.router.navigate(['/details-dossier', user.id]);
  }

  deleteUser(user: UserDTO): void {
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


  
}