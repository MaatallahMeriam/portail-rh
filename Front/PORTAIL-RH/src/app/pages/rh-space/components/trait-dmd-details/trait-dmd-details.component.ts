import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemandeService, LogisticDemandeDTO, DocumentDemandeDTO, DemandeDTO } from '../../../../services/demande.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import Swal from 'sweetalert2';

interface Demande {
  userDetails: string;
  typeComposant?: string;
  origineDemande?: string;
  departement?: string;
  commentaire?: string;
  typeDocument?: string;
  nombreCopies?: number;
  raisonDemande?: string;
  dateEmission?: string;
  statut?: string;
  image: string;
  demandeId: number;
  userId: number;
  isProcessing?: boolean;
  processingAction?: 'accept' | 'reject';
  timeoutId?: any;
}

@Component({
  selector: 'app-trait-dmd-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    NgxDatatableModule,
  ],
  templateUrl: './trait-dmd-details.component.html',
  styleUrls: ['./trait-dmd-details.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class TraitDmdDetailsComponent implements OnInit {
  pendingDemandes: Demande[] = [];
  historyDemandes: Demande[] = [];
  columns: any[] = [];
  historyColumns: any[] = [];
  totalPendingDemandes: number = 0;
  totalHistoryDemandes: number = 0;
  selectedType: 'logistique' | 'document' = 'logistique';
  activeTab: 'pending' | 'history' = 'pending';
  loading: boolean = false;
  private typeChangeSubject = new Subject<'logistique' | 'document'>();
  private userImageCache: Map<number, string> = new Map();
  isSidebarCollapsed = false;

  constructor(
    private demandeService: DemandeService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.typeChangeSubject.pipe(debounceTime(300)).subscribe(type => {
      this.selectedType = type;
      this.loadDemandes();
    });

    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.pendingDemandes = [];
    this.historyDemandes = [];
    this.cdr.detectChanges();

    if (this.activeTab === 'pending') {
      if (this.selectedType === 'logistique') {
        this.demandeService.getPendingLogisticDemandes().subscribe({
          next: (data: LogisticDemandeDTO[]) => {
            this.initializePendingDemands(data);
            this.initializeLogisticColumns();
          },
          error: (error) => this.handleError(error, 'logistiques'),
        });
      } else {
        this.demandeService.getPendingDocumentDemandes().subscribe({
          next: (data: DocumentDemandeDTO[]) => {
            this.initializePendingDemands(data);
            this.initializeDocumentColumns();
          },
          error: (error) => this.handleError(error, 'de documents'),
        });
      }
    } else {
      this.demandeService.getAllDemandeDocumentAndLogistique().subscribe({
        next: (data: DemandeDTO[]) => {
          this.initializeHistoryDemands(data);
          this.initializeHistoryColumns();
        },
        error: (error) => this.handleError(error, 'de l\'historique'),
      });
    }
  }

  private initializePendingDemands(data: (LogisticDemandeDTO | DocumentDemandeDTO)[]): void {
    const userIds = [...new Set(data.map(dto => dto.userId))];
    this.preloadUserImages(userIds).then(() => {
      this.pendingDemandes = data.map(dto => {
        const image = this.userImageCache.get(dto.userId) || '/assets/icons/user-login-icon-14.png';
        if ('composant' in dto) {
          return {
            userDetails: `${dto.nom} ${dto.prenom}`,
            typeComposant: dto.composant,
            origineDemande: dto.raisonDmd,
            departement: dto.departement,
            commentaire: dto.commentaire,
            image,
            demandeId: dto.demandeId,
            userId: dto.userId,
            isProcessing: false,
            processingAction: undefined,
            timeoutId: undefined
          };
        } else {
          return {
            userDetails: `${dto.nom} ${dto.prenom}`,
            typeDocument: dto.typeDocument,
            nombreCopies: dto.nombreCopies,
            raisonDemande: dto.raisonDmd,
            image,
            demandeId: dto.demandeId,
            userId: dto.userId,
            isProcessing: false,
            processingAction: undefined,
            timeoutId: undefined
          };
        }
      });
      this.totalPendingDemandes = this.pendingDemandes.length;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private initializeHistoryDemands(data: DemandeDTO[]): void {
    const filteredData = data.filter(dto => dto.type.toLowerCase() === this.selectedType);
    const userIds = [...new Set(filteredData.map(dto => dto.userId))];
    this.preloadUserImages(userIds).then(() => {
      this.historyDemandes = filteredData.map(dto => {
        const image = this.userImageCache.get(dto.userId) || '/assets/icons/user-login-icon-14.png';
        if (dto.type === 'LOGISTIQUE') {
          return {
            userDetails: `${dto.userNom}`,
            typeComposant: dto.composant,
            origineDemande: dto.raisonDmdLog,
            departement: dto.departement,
            commentaire: dto.commentaire,
            dateEmission: dto.dateEmission,
            statut: dto.statut,
            image,
            demandeId: dto.id,
            userId: dto.userId,
          };
        } else {
          return {
            userDetails: `${dto.userNom}`,
            typeDocument: dto.typeDocument,
            nombreCopies: dto.nombreCopies,
            raisonDemande: dto.raisonDmd,
            dateEmission: dto.dateEmission,
            statut: dto.statut,
            image,
            demandeId: dto.id,
            userId: dto.userId,
          };
        }
      });
      this.totalHistoryDemandes = this.historyDemandes.length;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  private preloadUserImages(userIds: number[]): Promise<void> {
    const imageRequests: Promise<void>[] = userIds.map(userId => {
      if (this.userImageCache.has(userId)) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        this.userService.getUserById(userId).subscribe({
          next: (user: UserDTO) => {
            const imageUrl = user.image ? user.image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
            this.userImageCache.set(userId, imageUrl);
            resolve();
          },
          error: (error) => {
            console.error(`Erreur lors du chargement de l'image de l'utilisateur ${userId}:`, error);
            this.userImageCache.set(userId, '/assets/icons/user-login-icon-14.png');
            resolve();
          },
        });
      });
    });
    return Promise.all(imageRequests).then(() => {});
  }

  private handleError(error: any, type: string): void {
    this.loading = false;
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: `Erreur lors du chargement des demandes ${type}.`,
    });
    console.error(`Error fetching ${type} demands:`, error);
    this.cdr.detectChanges();
  }

  getNormalizedImage(image: string): string {
    return image ? image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
  }

  initializeLogisticColumns(): void {
    this.columns = [
      { prop: 'userDetails', name: 'Collaborateur', width: 150 },
      { prop: 'typeComposant', name: 'Composant', width: 120 },
      { prop: 'origineDemande', name: 'Origine Demande', width: 150 },
      { prop: 'departement', name: 'Département', width: 120 },
      { prop: 'commentaire', name: 'Commentaire', width: 150 },
      { prop: 'actions', name: 'Actions', width: 100 },
    ];
  }

  initializeDocumentColumns(): void {
    this.columns = [
      { prop: 'userDetails', name: 'Collaborateur', width: 150 },
      { prop: 'typeDocument', name: 'Document', width: 120 },
      { prop: 'nombreCopies', name: 'Nbre Copies', width: 100 },
      { prop: 'raisonDemande', name: 'Raison', width: 150 },
      { prop: 'actions', name: 'Actions', width: 100 },
    ];
  }

  initializeHistoryColumns(): void {
    if (this.selectedType === 'logistique') {
      this.historyColumns = [
        { prop: 'userDetails', name: 'Collaborateur', width: 150 },
        { prop: 'dateEmission', name: 'Date d\'Émission', width: 120 },
        { prop: 'typeComposant', name: 'Composant', width: 120 },
        { prop: 'origineDemande', name: 'Origine Demande', width: 150 },
        { prop: 'departement', name: 'Département', width: 120 },
        { prop: 'commentaire', name: 'Commentaire', width: 150 },
        { prop: 'statut', name: 'Statut', width: 120 },
      ];
    } else {
      this.historyColumns = [
        { prop: 'userDetails', name: 'Collaborateur', width: 150 },
        { prop: 'dateEmission', name: 'Date d\'Émission', width: 120 },
        { prop: 'typeDocument', name: 'Document', width: 120 },
        { prop: 'nombreCopies', name: 'Nbre Copies', width: 100 },
        { prop: 'raisonDemande', name: 'Raison', width: 150 },
        { prop: 'statut', name: 'Statut', width: 120 },
      ];
    }
  }

  onTypeChange(type: 'logistique' | 'document'): void {
    this.typeChangeSubject.next(type);
  }

  onAction(row: Demande, accepted: boolean): void {
    row.isProcessing = true;
    row.processingAction = accepted ? 'accept' : 'reject';

    row.timeoutId = setTimeout(() => {
      this.confirmAction(row);
    }, 2000);

    this.pendingDemandes = [...this.pendingDemandes];
    this.cdr.detectChanges();
  }

  cancelAction(row: Demande): void {
    if (row.timeoutId) {
      clearTimeout(row.timeoutId);
    }

    row.isProcessing = false;
    row.processingAction = undefined;
    row.timeoutId = undefined;

    this.pendingDemandes = [...this.pendingDemandes];
    this.cdr.detectChanges();
  }

  confirmAction(row: Demande): void {
    const actionObservable = row.processingAction === 'accept'
      ? this.demandeService.acceptDemande(row.demandeId)
      : this.demandeService.refuseDemande(row.demandeId);

    actionObservable.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Demande ${row.processingAction === 'accept' ? 'acceptée' : 'refusée'} avec succès.`,
        });

        this.pendingDemandes = this.pendingDemandes.filter(d => d.demandeId !== row.demandeId);
        this.totalPendingDemandes = this.pendingDemandes.length;

        this.loadDemandes();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: `Erreur lors de ${row.processingAction === 'accept' ? 'l\'acceptation' : 'le refus'} de la demande.`,
        });
        console.error('Error processing demand:', error);

        row.isProcessing = false;
        row.processingAction = undefined;
        row.timeoutId = undefined;
        this.pendingDemandes = [...this.pendingDemandes];
        this.cdr.detectChanges();
      }
    });
  }

  setActiveTab(tab: 'pending' | 'history'): void {
    this.activeTab = tab;
    this.loadDemandes();
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }
}