import { Component, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio'; // Added for radio buttons
import { CreateEquipeRequest, EquipeDTO, EquipeService } from '../../../../services/equipe.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details-equipe',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    MatCardModule,
    MatCheckboxModule,
    MatRadioModule, // Added for radio buttons
    FormsModule,
    SidebarComponent,
    HeaderComponent,
    RightSidebarComponent,
    NgxDatatableModule,
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './details-equipe.component.html',
  styleUrl: './details-equipe.component.scss',
})
export class DetailsEquipeComponent implements OnInit {
  equipe: EquipeDTO | null = null;
  manager: UserDTO | null = null;
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  managerUsers: UserDTO[] = [];
  filteredManagerUsers: UserDTO[] = [];
  teamMembers: UserDTO[] = [];
  searchText: string = '';
  showAddMemberForm: boolean = false;
  showManagerForm: boolean = false;
  selectedUserIds: number[] = [];
  managerSearchText: string = '';
  showManagerMenu: boolean = false;
  selectedManagerId: number | null = null; // Added to track selected manager

  columns = [
    { name: 'User', width: 200 },
    { prop: 'departement', name: 'Département', width: 150 },
    { prop: 'poste', name: 'Poste', width: 150 },
    { prop: 'role', name: 'Rôle', width: 100 },
    { name: 'Select', sortable: false, width: 50 },
  ];

  memberColumns = [
    { name: 'User', width: 200 },
    { prop: 'departement', name: 'Département', width: 150 },
    { prop: 'poste', name: 'Poste', width: 150 },
    { prop: 'role', name: 'Rôle', width: 100 },
    { name: 'Actions', sortable: false, width: 50 },
  ];

  constructor(
    private equipeService: EquipeService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const equipeId = Number(this.route.snapshot.paramMap.get('id'));
    if (equipeId) {
      this.loadEquipeDetails(equipeId);
      this.loadTeamMembers(equipeId);
      this.loadManager(equipeId);
      this.loadUsers();
    } else {
      Swal.fire('Erreur', 'ID de l\'équipe non valide', 'error');
      this.router.navigate(['/list-equipes']);
    }
  }

  loadEquipeDetails(equipeId: number): void {
    this.equipeService.getEquipeById(equipeId).subscribe({
      next: (equipe) => {
        this.equipe = equipe;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les détails de l\'équipe', 'error');
        this.router.navigate(['/list-equipes']);
      },
    });
  }

  loadTeamMembers(equipeId: number): void {
    this.equipeService.getUsersByEquipeIdExcludingManager(equipeId).subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les membres de l\'équipe', 'error');
      },
    });
  }

  loadManager(equipeId: number): void {
    this.equipeService.getManagerByEquipeId(equipeId).subscribe({
      next: (manager) => {
        this.manager = manager;
        this.cdr.detectChanges();
      },
      error: () => {
        this.manager = null;
        this.cdr.detectChanges();
      },
    });
  }

  loadUsers(): void {
    this.userService.getAllActiveUsersWithNoEquipe().subscribe({
      next: (users) => {
        this.users = users.map(user => ({ ...user, checked: false }));
        this.filteredUsers = [...this.users];
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs actifs sans équipe', 'error');
      },
    });

    this.userService.getAllActiveUsers().subscribe({
      next: (managerUsers) => {
        this.managerUsers = managerUsers;
        this.filteredManagerUsers = [...managerUsers];
        this.cdr.detectChanges();
      },
      error: () => {
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs actifs', 'error');
      },
    });
  }

  filterUsers(): void {
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

  filterManagers(): void {
    if (!this.managerSearchText.trim()) {
      this.filteredManagerUsers = [...this.managerUsers];
      return;
    }
    const search = this.managerSearchText.toLowerCase().trim();
    this.filteredManagerUsers = this.managerUsers.filter(
      (user) =>
        `${user.prenom} ${user.nom}`.toLowerCase().includes(search) ||
        user.prenom.toLowerCase().includes(search) ||
        user.nom.toLowerCase().includes(search)
    );
  }

  toggleAddMemberForm(): void {
    this.showAddMemberForm = !this.showAddMemberForm;
    if (!this.showAddMemberForm) {
      this.selectedUserIds = [];
      this.searchText = '';
      this.filterUsers();
    }
  }

  toggleManagerForm(): void {
    this.showManagerForm = !this.showManagerForm;
    this.showManagerMenu = false;
    if (!this.showManagerForm) {
      this.managerSearchText = '';
      this.selectedManagerId = null;
      this.filteredManagerUsers = [...this.managerUsers];
    }
  }

  toggleManagerMenu(): void {
    this.showManagerMenu = !this.showManagerMenu;
  }

  selectManager(userId: number): void {
    this.selectedManagerId = userId;
  }

  confirmManagerSelection(): void {
    if (!this.selectedManagerId) {
      Swal.fire('Avertissement', 'Veuillez sélectionner un manager', 'warning');
      return;
    }

    if (this.equipe) {
      this.equipeService.updateManager(this.equipe.id, this.selectedManagerId).subscribe({
        next: () => {
          Swal.fire('Succès', 'Manager mis à jour avec succès', 'success');
          this.loadManager(this.equipe!.id);
          this.loadTeamMembers(this.equipe!.id);
          this.toggleManagerForm();
        },
        error: (error) => {
          Swal.fire('Erreur', error.error || 'Erreur lors de la mise à jour du manager', 'error');
        },
      });
    }
  }

  onUserSelect(userId: number, checked: boolean): void {
    if (checked) {
      this.selectedUserIds.push(userId);
    } else {
      this.selectedUserIds = this.selectedUserIds.filter((id) => id !== userId);
    }
  }

  addSelectedUsersToTeam(): void {
    if (!this.equipe || this.selectedUserIds.length === 0) {
      Swal.fire('Avertissement', 'Veuillez sélectionner au moins un utilisateur', 'warning');
      return;
    }

    const equipeId = this.equipe.id;
    this.equipeService.assignUsersToEquipe(equipeId, this.selectedUserIds).subscribe({
      next: () => {
        Swal.fire('Succès', 'Utilisateurs ajoutés à l\'équipe avec succès', 'success');
        this.toggleAddMemberForm();
        this.loadTeamMembers(equipeId);
        this.loadUsers();
      },
      error: (error) => {
        Swal.fire('Erreur', error.error || 'Erreur lors de l\'ajout des utilisateurs à l\'équipe', 'error');
      },
    });
  }

  removeUserFromTeam(userId: number): void {
    if (!this.equipe) {
      Swal.fire('Erreur', 'Équipe non chargée', 'error');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment retirer cet utilisateur de l\'équipe ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Oui, retirer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.equipeService.removeUserFromEquipe(this.equipe!.id, userId).subscribe({
          next: () => {
            Swal.fire('Succès', 'Utilisateur retiré de l\'équipe avec succès', 'success');
            this.loadTeamMembers(this.equipe!.id);
            this.loadUsers();
          },
          error: (error) => {
            Swal.fire('Erreur', error.error || 'Erreur lors du retrait de l\'utilisateur', 'error');
          },
        });
      }
    });
  }

  onRowClick(event: any): void {
    if (event.target) {
      const target = event.target as HTMLElement;
      if (target.closest('.dropdown-menu') || target.closest('.menu-button') || target.closest('.action-button')) {
        event.stopPropagation();
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.manager-menu') && !target.closest('.menu-button')) {
      this.showManagerMenu = false;
    }
  }
}