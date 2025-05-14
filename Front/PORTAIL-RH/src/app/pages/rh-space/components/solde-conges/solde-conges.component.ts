import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CongeTypeService, CongeTypeDTO, UserCongesDTO } from '../../../../services/conge-type.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import { forkJoin } from 'rxjs';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-solde-conges',
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
    MatBadgeModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './solde-conges.component.html',
  styleUrls: ['./solde-conges.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SoldeCongesComponent implements OnInit {
  userId: number | null = null;
  showForm = false;
  editMode = false;
  selectedSlideIndex: number | null = null;
  selectedUser: UserDTO | null = null;
  users: UserDTO[] = [];
  filteredUsers: UserDTO[] = [];
  searchText: string = '';
  congesType: 'RENOUVELABLE' | 'INCREMENTALE' | 'DECREMENTALE' = 'RENOUVELABLE';
  nom: string = '';
  abreviation: string = '';
  unite: 'Jours' | 'Heure' = 'Jours';
  solde: number = 1;
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE' | undefined = undefined;
  pasIncrementale: number | undefined = undefined;
  validite: string = ''; // Initialize as empty string
  isGlobal: boolean = true;
  userCongeTypes: { [userId: number]: UserCongesDTO[] } = {};
  leaveBalances: {
    id?: number;
    type: string;
    nom: string;
    abreviation: string;
    balance: string;
    unite: string;
    periodicite?: string;
    pasIncrementale?: number;
    validite: string;
    color: string;
    isGlobal: boolean;
  }[] = [];
  selectedCongeTypeId: number | null = null;
  isSidebarCollapsed = false;

  customOptions: any = {
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      400: { items: 2 },
      740: { items: 3 },
      940: { items: 4 },
    },
    nav: true,
  };

  columns = [
    { name: 'User', width: 200 },
    { prop: 'departement', name: 'Département', width: 150 },
    { prop: 'poste', name: 'Poste', width: 100 },
    { name: 'Congés', width: 200 },
  ];

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private congeTypeService: CongeTypeService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.loadCongeTypes();
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = [...users];
        this.refreshUserConges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs:', err);
        Swal.fire('Erreur', 'Impossible de charger les utilisateurs', 'error');
      },
    });
  }

  refreshUserConges() {
    const congeTypesObservables = this.users.map((user) =>
      this.congeTypeService.getUserCongesByUserId(user.id)
    );
    forkJoin(congeTypesObservables).subscribe({
      next: (congeTypesList) => {
        this.users.forEach((user, index) => {
          this.userCongeTypes[user.id] = congeTypesList[index] || [];
        });
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des UserConges:', err);
        Swal.fire('Erreur', 'Impossible de charger les congés des utilisateurs', 'error');
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
        (user.poste?.toLowerCase().includes(search) || '')
    );
  }

  loadCongeTypes() {
    this.congeTypeService.getGlobalCongeTypes().subscribe({
      next: (congeTypes: CongeTypeDTO[]) => {
        this.leaveBalances = congeTypes.map((conge) => ({
          id: conge.id,
          type: conge.type,
          nom: conge.nom,
          abreviation: conge.abreviation,
          balance: conge.soldeInitial.toString(),
          unite: conge.unite,
          periodicite: conge.periodicite,
          pasIncrementale: conge.pasIncrementale,
          validite: conge.validite,
          isGlobal: conge.isGlobal,
          color: this.getColorForType(conge.type),
        }));
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des CongeType:', err);
        Swal.fire('Erreur', 'Impossible de charger les motifs de congés', 'error');
      },
    });
  }

  getColorForType(type: string): string {
    switch (type) {
      case 'RENOUVELABLE':
        return 'leave-renouvelable';
      case 'INCREMENTALE':
        return 'leave-incrementale';
      case 'DECREMENTALE':
        return 'leave-decrementale';
      default:
        return 'leave-decrementale';
    }
  }

  getChipColor(type: string): string {
    return this.getColorForType(type);
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm() {
    this.editMode = false;
    this.congesType = 'RENOUVELABLE';
    this.nom = '';
    this.abreviation = '';
    this.unite = 'Jours';
    this.solde = 1;
    this.periodicite = undefined;
    this.pasIncrementale = undefined;
    this.validite = ''; // Reset to empty string
    this.isGlobal = true;
    this.selectedCongeTypeId = null;
  }

  toggleSlideMenu(index: number) {
    event?.stopPropagation();
    this.selectedSlideIndex = this.selectedSlideIndex === index ? null : index;
    this.cdr.detectChanges();
  }

  onTypeChange() {
    this.periodicite = undefined;
    this.pasIncrementale = undefined;
    this.cdr.detectChanges();
  }

  openEditForm(leave: {
    id?: number;
    type: string;
    nom: string;
    abreviation: string;
    balance: string;
    unite: string;
    periodicite?: string;
    pasIncrementale?: number;
    validite: string;
    color: string;
    isGlobal: boolean;
  }) {
    this.editMode = true;
    this.showForm = true;
    this.selectedCongeTypeId = leave.id || null;
    this.congesType = leave.type as 'RENOUVELABLE' | 'INCREMENTALE' | 'DECREMENTALE';
    this.nom = leave.nom;
    this.abreviation = leave.abreviation;
    this.unite = leave.unite as 'Jours' | 'Heure';
    this.solde = parseInt(leave.balance, 10);
    this.periodicite = leave.periodicite as 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE' | undefined;
    this.pasIncrementale = leave.pasIncrementale;
    this.validite = leave.validite;
    this.isGlobal = leave.isGlobal;
    this.cdr.detectChanges();
  }

  submitForm() {
    // Validate common fields
    if (!this.congesType || !this.nom || !this.abreviation || !this.unite || this.solde < 1 || !this.validite) {
      Swal.fire('Erreur', 'Tous les champs sont obligatoires (type, nom, abr., unité, solde, validité)', 'error');
      return;
    }

    // Validate type-specific fields
    if (this.congesType === 'RENOUVELABLE' && !this.periodicite) {
      Swal.fire('Erreur', 'La périodicité est requise pour un congé renouvelable', 'error');
      return;
    }
    if (this.congesType === 'INCREMENTALE') {
      if (!this.periodicite) {
        Swal.fire('Erreur', 'La périodicité est requise pour un congé incrémental', 'error');
        return;
      }
      if (this.pasIncrementale == null || this.pasIncrementale <= 0) {
        Swal.fire('Erreur', 'Un pas incrémental positif est requis pour un congé incrémental', 'error');
        return;
      }
    }

    const congeType: CongeTypeDTO = {
      type: this.congesType,
      nom: this.nom,
      abreviation: this.abreviation,
      unite: this.unite,
      soldeInitial: this.solde,
      periodicite: this.periodicite,
      pasIncrementale: this.pasIncrementale,
      validite: this.validite,
      isGlobal: this.isGlobal,
    };

    if (this.editMode && this.selectedCongeTypeId) {
      this.congeTypeService.updateCongeType(this.selectedCongeTypeId, congeType).subscribe({
        next: (updatedConge: CongeTypeDTO) => {
          const index = this.leaveBalances.findIndex((leave) => leave.id === this.selectedCongeTypeId);
          if (index !== -1) {
            this.leaveBalances[index] = {
              id: updatedConge.id,
              type: updatedConge.type,
              nom: updatedConge.nom,
              abreviation: updatedConge.abreviation,
              balance: updatedConge.soldeInitial.toString(),
              unite: updatedConge.unite,
              periodicite: updatedConge.periodicite,
              pasIncrementale: updatedConge.pasIncrementale,
              validite: updatedConge.validite,
              isGlobal: updatedConge.isGlobal,
              color: this.getColorForType(updatedConge.type),
            };
          }
          if (updatedConge.isGlobal) {
            this.refreshUserConges();
          }
          Swal.fire('Succès', 'Motif de congé mis à jour avec succès', 'success');
          this.toggleForm();
        },
        error: (err: any) => {
          console.error('Erreur lors de la mise à jour du CongeType:', err);
          const errorMessage = err.error?.message || 'Impossible de mettre à jour le motif de congé';
          Swal.fire('Erreur', errorMessage, 'error');
        },
      });
    } else {
      this.congeTypeService.createCongeType(congeType).subscribe({
        next: (createdConge: CongeTypeDTO) => {
          this.leaveBalances.push({
            id: createdConge.id,
            type: createdConge.type,
            nom: createdConge.nom,
            abreviation: createdConge.abreviation,
            balance: createdConge.soldeInitial.toString(),
            unite: createdConge.unite,
            periodicite: createdConge.periodicite,
            pasIncrementale: createdConge.pasIncrementale,
            validite: createdConge.validite,
            isGlobal: createdConge.isGlobal,
            color: this.getColorForType(createdConge.type),
          });
          if (createdConge.isGlobal) {
            this.refreshUserConges();
          }
          Swal.fire('Succès', 'Motif de congé ajouté avec succès', 'success');
          this.toggleForm();
        },
        error: (err: any) => {
          console.error('Erreur lors de la création du CongeType:', err);
          const errorMessage = err.error?.message || 'Impossible d’ajouter le motif de congé';
          Swal.fire('Erreur', errorMessage, 'error');
        },
      });
    }
  }

  deleteCongeType(leave: {
    id?: number;
    type: string;
    nom: string;
    balance: string;
    color: string;
  }) {
    if (!leave.id) {
      Swal.fire('Erreur', 'ID du congé non trouvé', 'error');
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Voulez-vous vraiment supprimer le motif de congé ${leave.nom || leave.type} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.congeTypeService.deleteCongeType(leave.id!).subscribe({
          next: () => {
            this.leaveBalances = this.leaveBalances.filter((item) => item.id !== leave.id);
            this.refreshUserConges();
            Swal.fire('Succès', 'Motif de congé supprimé avec succès', 'success');
          },
          error: (err: any) => {
            console.error('Erreur lors de la suppression du CongeType:', err);
            const errorMessage = err.error?.message || 'Impossible de supprimer le motif de congé. Vérifiez si des congés utilisateurs sont associés.';
            Swal.fire('Erreur', errorMessage, 'error');
          },
        });
      }
    });
  }

  toggleMenu(user: UserDTO) {
    this.selectedUser = this.selectedUser === user ? null : user;
    this.cdr.detectChanges();
  }

  @HostListener('document:click', ['$event'])
  closeMenu(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.menu-button') && !target.closest('.dropdown-menu')) {
      this.selectedSlideIndex = null;
      this.selectedUser = null;
      this.cdr.detectChanges();
    }
  }

  voirDetailsConges(user: UserDTO) {
    this.router.navigate([`/details-conges/${user.id}`]);
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  exportUserConges(): void {
    this.userService.exportUserCongesToCSV().subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Les détails des congés utilisateurs ont été exportés avec succès au format CSV.',
        });
      },
      error: (err) => {
        console.error('Erreur lors de l\'exportation des congés utilisateurs:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Une erreur est survenue lors de l\'exportation des détails des congés utilisateurs.',
        });
      },
    });
  }
}