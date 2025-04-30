import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RightSideManagerComponent } from '../right-side-manager/right-side-manager.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { DemandeService, DemandeDTO } from '../../../../services/demande.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { SideBarManagerComponent } from "../side-bar-manager/side-bar-manager.component";

@Component({
  selector: 'app-dmd-log-manager',
  standalone: true,
  imports: [SideBarManagerComponent, CommonModule,
      FormsModule,
      MatIconModule,
      HeaderComponent,
      RightSideManagerComponent,
      NgxDatatableModule],
  templateUrl: './dmd-log-manager.component.html',
  styleUrl: './dmd-log-manager.component.scss'
})
export class DmdLogManagerComponent implements OnInit {
  componentType: string = 'Imprimente';
  origine: string = '';
  departement: string = '';
  comments: string = '';
  history: DemandeDTO[] = [];
  filteredHistory: DemandeDTO[] = [];
  userId: number | null = null;
  isLoading: boolean = false;
  searchText: string = '';
  isFormVisible: boolean = false;

  columns = [
    { name: 'ID Demande', prop: 'id', sortable: true, width: 150 },
    { name: 'Type Composant', prop: 'composant', sortable: true, width: 200 },
    { name: 'Département', prop: 'departement', sortable: true, width: 220 },
    { name: 'Statut Demande', prop: 'statut', sortable: true, width: 250 },
    { name: 'Date Emission', prop: 'dateEmission', sortable: true, width: 300 }
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
      this.resetForm();
    }
  }

  filterHistory(): void {
    const val = this.searchText.toLowerCase();
    this.filteredHistory = this.history.filter(item => {
      return (
        (item.id?.toString() || '').includes(val) ||
        (item.composant?.toLowerCase() || '').includes(val) ||
        (item.departement?.toLowerCase() || '').includes(val) ||
        (item.statut?.toLowerCase() || '').includes(val) ||
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
      type: 'LOGISTIQUE',
      userId: this.userId,
      raisonDmdLog: this.origine,
      commentaireLog: this.comments,
      departement: this.departement,
      composant: this.componentType,
    };

    this.demandeService.createDemande(demandeRequest).subscribe({
      next: (response) => {
        this.showSuccess('Demande logistique soumise avec succès !');
        this.resetForm();
        this.isFormVisible = false;
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
    this.demandeService.getDemandesByUserIdAndType(this.userId, 'LOGISTIQUE').subscribe({
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
    this.componentType = 'Imprimente';
    this.origine = '';
    this.departement = '';
    this.comments = '';
    this.isFormVisible = false;
  }

  private validateForm(): boolean {
    if (!this.componentType || !this.origine || !this.departement) {
      this.showWarning('Veuillez remplir tous les champs obligatoires.');
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