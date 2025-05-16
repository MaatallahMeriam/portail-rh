import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';
import { CongeTypeService, CongeTypeDTO, UserCongesDTO } from '../../../../services/conge-type.service';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UserService, UserDTO } from '../../../../services/users.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-gestion-conges',
  standalone: true,
  imports: [
    MatMenuModule,
    CommonModule,
    NgxDatatableModule,
    FormsModule,
    CarouselModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    SidebarComponent,
    HeaderComponent,
  ],
  templateUrl: './gestion-conges.component.html',
  styleUrls: ['./gestion-conges.component.scss'],
})
export class GestionCongesComponent implements OnInit {
  user: UserDTO | null = null;
  userId: number | null = null;
  congeTypes: CongeTypeDTO[] = [];
  filteredConges: CongeTypeDTO[] = [];
  searchText = '';
  showForm = false;
  showEditForm = false;
  selectedConge: CongeTypeDTO | null = null;
  congesType: 'RENOUVELABLE' | 'INCREMENTALE' | 'DECREMENTALE' = 'RENOUVELABLE';
  nom = '';
  abreviation = '';
  unite: 'Jours' | 'Heure' = 'Jours';
  solde = 1;
  periodicite: 'MENSUELLE' | 'TRIMESTRIELLE' | 'SEMESTRIELLE' | 'ANNUELLE' | undefined = undefined;
  pasIncrementale: number | undefined = undefined;
  validite = '';
  isSidebarCollapsed = false;

  carouselOptions = {
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
    { prop: 'nom', name: 'Nom', width: 200 },
    { prop: 'type', name: 'Type', width: 150 },
    { prop: 'soldeInitial', name: 'Solde', width: 100 },
    { prop: 'unite', name: 'Unité', width: 100 },
    { prop: 'validite', name: 'Validité', width: 150 },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private congeTypeService: CongeTypeService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.userId = params['userId'] ? +params['userId'] : null;
      if (this.userId) {
        this.loadUserDetails(this.userId);
        this.loadCongeTypes(this.userId);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'ID utilisateur manquant.',
        });
        this.router.navigate(['/gestion-dossier']);
      }
    });
  }

  loadUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
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
  }

  loadCongeTypes(userId: number): void {
    this.congeTypeService.getAllCongeTypesForUser(userId).subscribe({
      next: (congeTypes: CongeTypeDTO[]) => {
        this.congeTypes = congeTypes;
        this.filteredConges = congeTypes;
        if (congeTypes.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Aucun congé',
            text: 'Aucun type de congé assigné à cet utilisateur.',
          });
        }
      },
      error: (err) => {
        console.error('Erreur lors du chargement des types de congés:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les types de congés.',
        });
      },
    });
  }

  filterConges(): void {
    const search = this.searchText.toLowerCase();
    this.filteredConges = this.congeTypes.filter(conge =>
      conge.nom.toLowerCase().includes(search) ||
      conge.type.toLowerCase().includes(search)
    );
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  toggleEditForm(conge?: CongeTypeDTO): void {
    if (conge) {
      this.selectedConge = conge;
      this.congesType = conge.type;
      this.nom = conge.nom;
      this.abreviation = conge.abreviation;
      this.unite = conge.unite;
      this.solde = conge.soldeInitial;
      this.validite = conge.validite;
      this.periodicite = conge.periodicite;
      this.pasIncrementale = conge.pasIncrementale;
      this.showEditForm = true;
    } else {
      this.showEditForm = false;
      this.selectedConge = null;
      this.resetForm();
    }
  }

  resetForm(): void {
    this.congesType = 'RENOUVELABLE';
    this.nom = '';
    this.abreviation = '';
    this.unite = 'Jours';
    this.solde = 1;
    this.periodicite = undefined;
    this.pasIncrementale = undefined;
    this.validite = '';
  }

  onTypeChange(): void {
    this.periodicite = undefined;
    this.pasIncrementale = undefined;
  }

  submitForm(isEdit: boolean = false): void {
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non spécifié.',
      });
      return;
    }

    // Validation
    if (!this.nom || !this.abreviation || !this.validite || this.solde < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs incomplets',
        text: 'Veuillez remplir tous les champs obligatoires (Nom, Abréviation, Validité, Solde).',
      });
      return;
    }

    if (this.congesType === 'RENOUVELABLE' && !this.periodicite) {
      Swal.fire({
        icon: 'warning',
        title: 'Périodicité requise',
        text: 'La périodicité est obligatoire pour un congé renouvelable.',
      });
      return;
    }

    if (this.congesType === 'INCREMENTALE' && (!this.periodicite || !this.pasIncrementale || this.pasIncrementale < 1)) {
      Swal.fire({
        icon: 'warning',
        title: 'Champs incomplets',
        text: 'La périodicité et un pas incrémental positif sont obligatoires pour un congé incrémental.',
      });
      return;
    }

    const userCongesDTO: UserCongesDTO = {
      userId: this.userId,
      soldeActuel: this.solde,
      type: this.congesType,
      nom: this.nom,
      abreviation: this.abreviation,
      unite: this.unite,
      global: false,
      validite: this.validite,
      periodicite: this.periodicite,
      pasIncrementale: this.pasIncrementale,
    };

    if (isEdit && this.selectedConge?.id) {
      this.congeTypeService.updateSpecificCongeType(this.userId, this.selectedConge.id, userCongesDTO).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Type de congé modifié avec succès.',
          });
          this.toggleEditForm();
          this.loadCongeTypes(this.userId!);
        },
        error: (err) => {
          console.error('Erreur lors de la modification du type de congé:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Impossible de modifier le type de congé.',
          });
        },
      });
    } else {
      this.congeTypeService.assignSpecificCongeType(this.userId, userCongesDTO).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: 'Type de congé ajouté avec succès.',
          });
          this.toggleForm();
          this.loadCongeTypes(this.userId!);
        },
        error: (err) => {
          console.error('Erreur lors de l\'ajout du type de congé:', err);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: err.error?.message || 'Impossible d\'ajouter le type de congé.',
          });
        },
      });
    }
  }

  deleteConge(conge: CongeTypeDTO): void {
    if (!this.userId || !conge.id) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Informations manquantes pour la suppression.',
      });
      return;
    }

    Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Vous allez supprimer le congé "${conge.nom}". Cette action est irréversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
    }).then((result) => {
      if (result.isConfirmed) {
        this.congeTypeService.deleteSpecificCongeType(this.userId!, conge.id!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Supprimé',
              text: 'Le type de congé a été supprimé avec succès.',
            });
            this.loadCongeTypes(this.userId!);
          },
          error: (err) => {
            console.error('Erreur lors de la suppression du type de congé:', err);
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: err.error?.message || 'Impossible de supprimer le type de congé.',
            });
          },
        });
      }
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

  goBack(): void {
    if (this.userId) {
      this.router.navigate(['/details-dossier', this.userId]);
    } else {
      this.router.navigate(['/gestion-dossier']);
    }
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}