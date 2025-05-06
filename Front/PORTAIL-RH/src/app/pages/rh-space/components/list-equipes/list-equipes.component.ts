import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { AddTeamFormComponent } from './add-team-form/add-team-form.component';
import { EditTeamFormComponent } from './edit-team-form/edit-team-form.component';
import { TeamCardComponent } from './team-card/team-card.component';
import { UserService, UserDTO } from '../../../../services/users.service';
import { CreateEquipeRequest, EquipeDTO, EquipeService } from '../../../../services/equipe.service';

@Component({
  selector: 'app-list-equipes',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    RightSidebarComponent,
    AddTeamFormComponent,
    EditTeamFormComponent,
    TeamCardComponent,
  ],
  templateUrl: './list-equipes.component.html',
  styleUrl: './list-equipes.component.scss'
})
export class ListEquipesComponent implements OnInit {
  equipes: (EquipeDTO & { manager?: UserDTO; showDropdown?: boolean })[] = [];
  filteredEquipes: (EquipeDTO & { manager?: UserDTO; showDropdown?: boolean })[] = [];
  activeUsers: UserDTO[] = [];
  filteredActiveUsers: UserDTO[] = [];
  showAddForm: boolean = false;
  showEditForm: boolean = false;
  newEquipe: CreateEquipeRequest = { nom: '', departement: '', managerId: 0 };
  editEquipeData: { id: number; nom: string; departement: string } = { id: 0, nom: '', departement: '' };
  searchText: string = '';
  managerSearchText: string = '';
  isSidebarCollapsed = false;

  constructor(
    private equipeService: EquipeService,
    private userService: UserService,
    private router: Router,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {
    this.loadEquipes();
    this.loadActiveUsers();
  }

  loadEquipes(): void {
    this.equipeService.getAllEquipes().subscribe({
      next: (equipes) => {
        this.equipes = equipes.map(equipe => ({ ...equipe, showDropdown: false }));
        this.equipes.forEach(equipe => {
          if (equipe.managerId) {
            this.equipeService.getManagerByEquipeId(equipe.id).subscribe({
              next: (manager) => {
                equipe.manager = manager;
              },
              error: () => {
                equipe.manager = undefined;
              }
            });
          }
        });
        this.filteredEquipes = [...this.equipes];
      },
      error: () => {
        this.equipes = [];
        this.filteredEquipes = [];
      }
    });
  }

  loadActiveUsers(): void {
    this.userService.getAllActiveUsers().subscribe({
      next: (users) => {
        this.activeUsers = users;
        this.filteredActiveUsers = [...users];
        if (this.activeUsers.length > 0) {
          this.newEquipe.managerId = 0;
          this.managerSearchText = '';
        }
      },
      error: () => {
        this.activeUsers = [];
        this.filteredActiveUsers = [];
      }
    });
  }

  filterEquipes(): void {
    if (!this.searchText.trim()) {
      this.filteredEquipes = [...this.equipes];
      return;
    }
    const search = this.searchText.toLowerCase().trim();
    this.filteredEquipes = this.equipes.filter(equipe =>
      equipe.nom?.toLowerCase().includes(search) ||
      equipe.departement?.toLowerCase().includes(search) ||
      (equipe.manager && `${equipe.manager.prenom} ${equipe.manager.nom}`.toLowerCase().includes(search))
    );
  }

  filterManagers(searchText: string): void {
    if (!searchText.trim()) {
      this.filteredActiveUsers = [...this.activeUsers];
      return;
    }
    const search = searchText.toLowerCase().trim();
    this.filteredActiveUsers = this.activeUsers.filter(user =>
      `${user.prenom} ${user.nom}`.toLowerCase().includes(search) ||
      user.prenom.toLowerCase().includes(search) ||
      user.nom.toLowerCase().includes(search)
    );
  }

  selectManager(userId: number): void {
    const selectedUser = this.activeUsers.find(user => user.id === userId);
    if (selectedUser) {
      this.newEquipe.managerId = userId;
      this.managerSearchText = `${selectedUser.prenom} ${selectedUser.nom}`;
    }
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetAddForm();
    }
  }

  toggleEditForm(equipe?: EquipeDTO & { manager?: UserDTO }): void {
    if (equipe) {
      this.editEquipeData = {
        id: equipe.id,
        nom: equipe.nom,
        departement: equipe.departement
      };
      this.showEditForm = true;
    } else {
      this.showEditForm = false;
      this.resetEditForm();
    }
  }

  createEquipe(): void {
    if (!this.newEquipe.nom.trim() || !this.newEquipe.departement.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs incomplets',
        text: 'Veuillez remplir tous les champs.',
      });
      return;
    }

    this.equipeService.createEquipe(this.newEquipe).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Équipe créée avec succès!',
        });
        this.toggleAddForm();
        this.loadEquipes();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error || 'Erreur lors de la création de l\'équipe.',
        });
      }
    });
  }

  updateEquipe(): void {
    if (!this.editEquipeData.nom.trim() || !this.editEquipeData.departement.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs incomplets',
        text: 'Veuillez remplir tous les champs.',
      });
      return;
    }

    this.equipeService.updateEquipe(this.editEquipeData.id, {
      nom: this.editEquipeData.nom,
      departement: this.editEquipeData.departement
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Équipe mise à jour avec succès!',
        });
        this.toggleEditForm();
        this.loadEquipes();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: error.error || 'Erreur lors de la mise à jour de l\'équipe.',
        });
      }
    });
  }

  resetAddForm(): void {
    this.newEquipe = { nom: '', departement: '', managerId: 0 };
    this.managerSearchText = '';
    this.filteredActiveUsers = [...this.activeUsers];
  }

  resetEditForm(): void {
    this.editEquipeData = { id: 0, nom: '', departement: '' };
  }

  toggleDropdown(equipe: EquipeDTO & { showDropdown?: boolean }): void {
    console.log('Toggling dropdown for equipe:', equipe, 'Current showDropdown:', equipe.showDropdown);
    this.filteredEquipes.forEach(e => {
      if (e !== equipe) e.showDropdown = false;
    });
    equipe.showDropdown = !equipe.showDropdown;
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      console.log('Closing all dropdowns due to outside click');
      this.filteredEquipes.forEach(e => e.showDropdown = false);
    }
  }

  viewDetails(equipeId: number): void {
    this.router.navigate(['/details-equipe', equipeId]);
  }

  editEquipe(equipe: EquipeDTO & { manager?: UserDTO }): void {
    this.toggleEditForm(equipe);
  }

  deleteEquipe(equipeId: number): void {
    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: 'Voulez-vous vraiment supprimer cette équipe ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#230046',
      cancelButtonColor: '#ccc',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.equipeService.deleteEquipe(equipeId).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Supprimé',
              text: 'Équipe supprimée avec succès!',
            });
            this.loadEquipes();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error || 'Erreur lors de la suppression de l\'équipe.',
            });
          }
        });
      }
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}