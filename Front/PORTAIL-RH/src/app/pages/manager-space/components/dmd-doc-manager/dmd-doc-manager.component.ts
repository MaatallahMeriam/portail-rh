import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { DemandeService, DemandeDTO } from '../../../../services/demande.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
import { RightSideManagerComponent } from '../right-side-manager/right-side-manager.component';
@Component({
  selector: 'app-dmd-doc-manager',
  standalone: true,
  imports: [SideBarManagerComponent,CommonModule,
      FormsModule,
      MatIconModule,
      HeaderComponent,
      RightSideManagerComponent,
      NgxDatatableModule],
  templateUrl: './dmd-doc-manager.component.html',
  styleUrl: './dmd-doc-manager.component.scss'
})
export class DmdDocManagerComponent implements OnInit {
  documentType: string = 'fiche de paie';
  copies: number = 1;
  reason: string = '';
  comments: string = '';
  history: DemandeDTO[] = [];
  filteredHistory: DemandeDTO[] = [];
  userId: number | null = null;
  isLoading: boolean = false;
  searchText: string = '';
  isFormVisible: boolean = false; // New property to control form visibility

  columns = [
    { name: 'Type Document', prop: 'typeDocument', sortable: true, width: 200 },
    { name: 'Nombre Copies', prop: 'nombreCopies', sortable: true, width: 200 },
    { name: 'Date Emission', prop: 'dateEmission', sortable: true, width: 200 },
    { name: 'Statut Demande', prop: 'statut', sortable: true, width: 210 }
  ];

  constructor(
    private demandeService: DemandeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      this.showError('Vous devez être connecté pour soumettre une demande.');
      return;
    }
    this.loadHistory();
  }

  toggleForm(): void {
    this.isFormVisible = !this.isFormVisible;
    if (!this.isFormVisible) {
      this.resetForm(); // Reset the form when hiding it
    }
  }

  filterHistory(): void {
    const val = this.searchText.toLowerCase();
    this.filteredHistory = this.history.filter(item => {
      return (
        (item.typeDocument?.toLowerCase() || '').includes(val) ||
        (item.statut?.toLowerCase() || '').includes(val) ||
        (item.nombreCopies?.toString() || '').includes(val) ||
        new Date(item.dateEmission).toLocaleDateString().includes(val)
      );
    });
  }

  getStatusColor(status: string): string {
    switch ((status || '').toLowerCase()) {
      case 'en_attente':
        return '#ED6C02';
      case 'validee':
        return '#2E7D32';
      case 'refusee':
        return '#D32F2F';
      default:
        return '#666666';
    }
  }

  getStatusClass(status: string): string {
    return `status-${(status || 'inconnu').toLowerCase().replace('_', '-')}`;
  }

  submitRequest(): void {
    if (!this.userId) {
      this.showError('Utilisateur non authentifié.');
      return;
    }

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    const demandeRequest = {
      type: 'DOCUMENT',
      userId: this.userId,
      typeDocument: this.documentType,
      nombreCopies: this.copies,
      raisonDmdDoc: this.reason,
      commentaires: this.comments,
    };

    this.demandeService.createDemande(demandeRequest).subscribe({
      next: (response) => {
        this.showSuccess('Demande soumise avec succès !');
        this.resetForm();
        this.isFormVisible = false; // Hide the form after submission
        this.loadHistory();
      },
      error: (error) => {
        this.showError(error.error?.message || 'Une erreur est survenue lors de la soumission de la demande.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  loadHistory(): void {
    if (!this.userId) return;

    this.isLoading = true;
    this.demandeService.getDemandesByUserIdAndType(this.userId, 'DOCUMENT').subscribe({
      next: (demandes) => {
        console.log('History loaded:', demandes);
        this.history = demandes;
        this.filteredHistory = [...demandes];
      },
      error: (error) => {
        this.showError(error.error?.message || 'Erreur lors du chargement de l\'historique.');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  resetForm(): void {
    this.documentType = 'fiche de paie';
    this.copies = 1;
    this.reason = '';
    this.comments = '';
    this.isFormVisible = false; // Hide the form when resetting
  }

  private validateForm(): boolean {
    if (!this.documentType || !this.copies || !this.reason) {
      this.showWarning('Veuillez remplir tous les champs obligatoires.');
      return false;
    }
    if (this.copies < 1) {
      this.showWarning('Le nombre de copies doit être supérieur à 0.');
      return false;
    }
    return true;
  }

  private showSuccess(message: string): void {
    Swal.fire({
      icon: 'success',
      title: 'Succès',
      text: message,
      confirmButtonColor: '#230046'
    });
  }

  private showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
      confirmButtonColor: '#230046'
    });
  }

  private showWarning(message: string): void {
    Swal.fire({
      icon: 'warning',
      title: 'Attention',
      text: message,
      confirmButtonColor: '#230046'
    });
  }
}