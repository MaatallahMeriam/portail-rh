import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { DemandeService, ManagerCongesDemandeDTO } from '../../../../services/demande.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { EquipeService, TeamMemberDTO } from '../../../../services/equipe.service';
import Swal from 'sweetalert2';

interface Demande {
  userDetails: string;
  nomConges: string;
  dateDebut: string;
  dateFin: string;
  dureeUnite: string;
  solde: number;
  image: string;
  demandeId: number;
  statut?: string;
  isProcessing?: boolean; // État de traitement (pour la temporisation)
  processingAction?: 'accept' | 'reject'; // Action en cours (accept ou reject)
  timeoutId?: any; // Identifiant du timeout pour annuler
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  usersOnLeave: { userDetails: string; image: string; totalUsers?: number }[];
}

@Component({
  selector: 'app-trait-dmd',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    SideBarManagerComponent,
    NgxDatatableModule
  ],
  templateUrl: './trait-dmd.component.html',
  styleUrls: ['./trait-dmd.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class TraitDmdComponent implements OnInit {
  demandes: Demande[] = [];
  historyDemandes: Demande[] = [];
  columns = [
    { prop: 'userDetails', name: 'Collaborateur' },
    { prop: 'nomConges', name: 'Congés' },
    { prop: 'dateDebut', name: 'Date Début' },
    { prop: 'dateFin', name: 'Date Fin' },
    { prop: 'dureeUnite', name: 'Durée' },
    { prop: 'solde', name: 'Solde' },
    { prop: 'actions', name: 'Actions' }
  ];
  historyColumns = [
    { prop: 'userDetails', name: 'Collaborateur' },
    { prop: 'nomConges', name: 'Congés' },
    { prop: 'dateDebut', name: 'Date Début' },
    { prop: 'dateFin', name: 'Date Fin' },
    { prop: 'dureeUnite', name: 'Durée' },
    { prop: 'statut', name: 'Statut' }
  ];
  totalDemandes: number = 0;
  totalHistoryDemandes: number = 0;
  currentDate: Date = new Date();
  today: Date = new Date();
  currentMonth: string;
  currentYear: number;
  calendarDays: CalendarDay[] = [];
  daysOfWeek: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  validatedDemandes: ManagerCongesDemandeDTO[] = [];
  teamMembers: TeamMemberDTO[] = [];
  activeTab: 'pending' | 'history' = 'pending';

  constructor(
    private demandeService: DemandeService,
    private authService: AuthService,
    private equipeService: EquipeService
  ) {
    this.currentDate.setDate(1);
    this.currentMonth = this.currentDate.toLocaleString('fr-FR', { month: 'long' }).toUpperCase();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  ngOnInit() {
    const managerId = this.authService.getUserIdFromToken();
    if (!managerId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non authentifié. Veuillez vous connecter.',
      }).then(() => {
        this.authService.logout();
      });
      return;
    }

    this.equipeService.getTeamMembersByManagerId(managerId).subscribe({
      next: (members) => {
        this.teamMembers = members;
        this.loadPendingDemands(managerId);
        this.loadHistoryDemands(managerId);
      },
      error: (error) => {
        console.error('Error fetching team members:', error);
        this.loadPendingDemands(managerId);
        this.loadHistoryDemands(managerId);
      }
    });

    this.demandeService.getValidatedCongesDemandesByManagerId(managerId).subscribe({
      next: (data: ManagerCongesDemandeDTO[]) => {
        this.validatedDemandes = data;
        this.generateCalendar();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes validées.',
        });
        console.error('Error fetching validated demands:', error);
      }
    });
  }

  private loadPendingDemands(managerId: number) {
    this.demandeService.getCongesDemandesByManagerId(managerId, 'EN_ATTENTE').subscribe({
      next: (data: ManagerCongesDemandeDTO[]) => {
        this.demandes = data.map(dto => ({
          userDetails: `${dto.nom} ${dto.prenom}`,
          nomConges: dto.congeNom,
          dateDebut: new Date(dto.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          dateFin: new Date(dto.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          dureeUnite: `${dto.duree} ${dto.unite}`,
          solde: dto.soldeActuel,
          image: this.getUserImage(dto.nom, dto.prenom),
          demandeId: dto.demandeId,
          isProcessing: false,
          processingAction: undefined,
          timeoutId: undefined
        }));
        this.totalDemandes = this.demandes.length;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes de congé.',
        });
        console.error('Error fetching demands:', error);
      }
    });
  }

  private loadHistoryDemands(managerId: number) {
    this.demandeService.getCongesDemandesByManagerId(managerId).subscribe({
      next: (data: ManagerCongesDemandeDTO[]) => {
        this.historyDemandes = data.map(dto => ({
          userDetails: `${dto.nom} ${dto.prenom}`,
          nomConges: dto.congeNom,
          dateDebut: new Date(dto.dateDebut).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          dateFin: new Date(dto.dateFin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
          dureeUnite: `${dto.duree} ${dto.unite}`,
          solde: dto.soldeActuel,
          image: this.getUserImage(dto.nom, dto.prenom),
          demandeId: dto.demandeId,
          statut: dto.statut
        }));
        this.totalHistoryDemandes = this.historyDemandes.length;
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement de l\'historique des demandes.',
        });
        console.error('Error fetching history demands:', error);
      }
    });
  }

  private getUserImage(nom: string, prenom: string): string {
    const member = this.teamMembers.find(m => m.nom === nom && m.prenom === prenom);
    const imagePath = member?.image ? member.image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
    return imagePath;
  }

  getNormalizedImage(image: string): string {
    return image ? image.replace(/\\/g, '/') : '/assets/icons/user-login-icon-14.png';
  }

  onAction(row: Demande, accepted: boolean) {
    // Marquer la demande comme en cours de traitement
    row.isProcessing = true;
    row.processingAction = accepted ? 'accept' : 'reject';

    // Lancer un délai de 2 secondes avant de confirmer l'action
    row.timeoutId = setTimeout(() => {
      this.confirmAction(row);
    }, 2000);

    // Forcer la mise à jour de l'affichage
    this.demandes = [...this.demandes];
  }

  cancelAction(row: Demande) {
    // Annuler le timeout
    if (row.timeoutId) {
      clearTimeout(row.timeoutId);
    }

    // Réinitialiser l'état de la demande
    row.isProcessing = false;
    row.processingAction = undefined;
    row.timeoutId = undefined;

    // Forcer la mise à jour de l'affichage
    this.demandes = [...this.demandes];
  }

  confirmAction(row: Demande) {
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

        // Supprimer la demande de la liste (elle passe dans l'historique)
        this.demandes = this.demandes.filter(d => d.demandeId !== row.demandeId);
        this.totalDemandes = this.demandes.length;

        // Recharger l'historique et le calendrier
        const managerId = this.authService.getUserIdFromToken();
        if (managerId) {
          this.loadHistoryDemands(managerId);
          this.demandeService.getValidatedCongesDemandesByManagerId(managerId).subscribe({
            next: (data: ManagerCongesDemandeDTO[]) => {
              this.validatedDemandes = data;
              this.generateCalendar();
            },
            error: (error) => {
              console.error('Error refreshing validated demands:', error);
            }
          });
        }
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: `Erreur lors de ${row.processingAction === 'accept' ? 'l\'acceptation' : 'le refus'} de la demande.`,
        });
        console.error('Error processing demand:', error);

        // Réinitialiser l'état en cas d'erreur
        row.isProcessing = false;
        row.processingAction = undefined;
        row.timeoutId = undefined;
        this.demandes = [...this.demandes];
      }
    });
  }

  private generateCalendar(): void {
    this.calendarDays = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentDate.getMonth() + 1, 0);
    const startingDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const todayNormalized = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());

    for (let i = 0; i < startingDay; i++) {
      const fillerDate = new Date(this.currentYear, this.currentDate.getMonth(), 0 - (startingDay - i - 1));
      this.calendarDays.push({ date: fillerDate, isCurrentMonth: false, isToday: false, usersOnLeave: [] });
    }

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(this.currentYear, this.currentDate.getMonth(), day);
      const usersOnLeave = this.getUsersOnLeaveForDate(date);

      const isToday = date.getFullYear() === todayNormalized.getFullYear() &&
                      date.getMonth() === todayNormalized.getMonth() &&
                      date.getDate() === todayNormalized.getDate();

      this.calendarDays.push({ date, isCurrentMonth: true, isToday, usersOnLeave });
    }

    const remainingDays = (7 - (this.calendarDays.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const fillerDate = new Date(this.currentYear, this.currentDate.getMonth() + 1, i);
      this.calendarDays.push({ date: fillerDate, isCurrentMonth: false, isToday: false, usersOnLeave: [] });
    }
  }

  private getUsersOnLeaveForDate(date: Date): { userDetails: string; image: string; totalUsers?: number }[] {
    const usersOnLeave: { userDetails: string; image: string; totalUsers?: number }[] = [];
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    for (const demande of this.validatedDemandes) {
      const startDate = new Date(demande.dateDebut);
      const endDate = new Date(demande.dateFin);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);

      if (normalizedDate >= startDate && normalizedDate <= endDate) {
        const userDetails = `${demande.nom} ${demande.prenom}`;
        const image = this.getUserImage(demande.nom, demande.prenom);
        usersOnLeave.push({ userDetails, image });
      }
    }

    const limitedUsers = usersOnLeave.slice(0, 2);
    if (usersOnLeave.length > 2 && limitedUsers.length > 0) {
      limitedUsers[0].totalUsers = usersOnLeave.length;
    }

    return limitedUsers;
  }

  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentMonth = this.currentDate.toLocaleString('fr-FR', { month: 'long' }).toUpperCase();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentMonth = this.currentDate.toLocaleString('fr-FR', { month: 'long' }).toUpperCase();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  setActiveTab(tab: 'pending' | 'history') {
    this.activeTab = tab;
  }
}