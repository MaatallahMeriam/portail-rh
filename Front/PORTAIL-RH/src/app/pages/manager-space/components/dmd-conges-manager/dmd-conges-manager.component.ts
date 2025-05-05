import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { provideNativeDateAdapter } from '@angular/material/core';
import { AuthService } from '../../../../shared/services/auth.service';
import { CongeTypeService, UserCongesDTO } from '../../../../services/conge-type.service';
import { DemandeService, DemandeDTO, DemandeRequest } from '../../../../services/demande.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { DemandeCongesDialogComponent } from '../dmd-conges-manager/demande-conges-dialog/demande-conges-dialog.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SideBarManagerComponent } from "../side-bar-manager/side-bar-manager.component";

@Component({
  selector: 'app-dmd-conges-manager',
  standalone: true,
  imports: [
    NgxDatatableModule,
    SideBarManagerComponent,
    HeaderComponent,
    CommonModule,
    CarouselModule,
    BsDatepickerModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    FormsModule
  ],
  providers: [provideNativeDateAdapter()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dmd-conges-manager.component.html',
  styleUrl: './dmd-conges-manager.component.scss'
})
export class DmdCongesManagerComponent implements OnInit {
  leaveBalances: { type: string; balance: string; validity: string; color: string; id: number }[] = [];
  userId: number | null = null;
  isLoading: boolean = true;
  isLoadingDemandes: boolean = true;
  demandes: DemandeDTO[] = [];
  filteredDemandes: DemandeDTO[] = [];
  searchText: string = '';
  userCongesList: UserCongesDTO[] = [];
  validatedDemandes: DemandeDTO[] = [];

  currentDate: Date = new Date();
  currentMonth: string;
  currentYear: number;
  calendarDays: { date: Date; isCurrentMonth: boolean }[] = [];
  daysOfWeek: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  columns = [
    { name: 'Congés', prop: 'userCongesId', sortable: true, width: 140 },
    { name: 'Durée', prop: 'duree', sortable: true, width: 150 },
    { name: 'Date début', prop: 'dateDebut', sortable: true, width: 150 },
    { name: 'Statut', prop: 'statut', sortable: true, width: 150 },
  ];

  messages = {
    emptyMessage: 'Aucune demande de congé trouvée.',
  };

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

  isSidebarCollapsed = false; // Track sidebar state

  constructor(
    private authService: AuthService,
    private congeTypeService: CongeTypeService,
    private demandeService: DemandeService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {
    // Initialize current month and year based on the actual current date
    this.currentMonth = this.currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  ngOnInit(): void {
    this.fetchUserConges();
    this.fetchDemandes();
    this.fetchValidatedDemandes();
  }

  // Handle sidebar state changes
  onSidebarStateChange(isCollapsed: boolean) {
    this.isSidebarCollapsed = isCollapsed;
    this.cdr.markForCheck(); // Ensure change detection runs
  }

  // Fetch validated leave requests (statut = VALIDEE)
  private fetchValidatedDemandes(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Vous devez être connecté pour voir vos demandes.',
      });
      return;
    }
    this.demandeService.getDemandesByUserIdAndType(this.userId, 'CONGES').subscribe({
      next: (demandes) => {
        this.validatedDemandes = demandes.filter((d) => d.statut.toUpperCase() === 'VALIDEE');
        this.generateCalendar(); // Regenerate calendar to reflect leave dates
        this.cdr.markForCheck();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des demandes validées.',
        });
      },
    });
  }

  // Generate calendar for the current month
  private generateCalendar(): void {
    this.calendarDays = [];
    const firstDayOfMonth = new Date(this.currentYear, this.currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentDate.getMonth() + 1, 0);
    const startingDay = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
    const totalDays = lastDayOfMonth.getDate();

    // Add filler days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      const fillerDate = new Date(this.currentYear, this.currentDate.getMonth(), 0 - (startingDay - i - 1));
      this.calendarDays.push({ date: fillerDate, isCurrentMonth: false });
    }

    // Add days of the current month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(this.currentYear, this.currentDate.getMonth(), day);
      this.calendarDays.push({ date, isCurrentMonth: true });
    }

    // Add filler days after the last day to complete the grid
    const remainingDays = (7 - (this.calendarDays.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      const fillerDate = new Date(this.currentYear, this.currentDate.getMonth() + 1, i);
      this.calendarDays.push({ date: fillerDate, isCurrentMonth: false });
    }

    this.cdr.markForCheck();
  }

  // Check if a date is today (based on the actual current date)
  isToday(date: Date): boolean {
    const today = new Date(); // Use the actual current date
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }

  // Get the leave type for a specific date (if it falls within a validated leave range)
  getLeaveTypeForDate(date: Date): string | null {
    for (const demande of this.validatedDemandes) {
      const startDate = new Date(demande.dateDebut!);
      const endDate = new Date(demande.dateFin!);
      // Normalize dates to remove time component
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      // Check if the date is within [startDate, endDate]
      if (date >= startDate && date <= endDate) {
        const leave = this.leaveBalances.find((l) => l.id === demande.userCongesId);
        return leave ? leave.color : null;
      }
    }
    return null;
  }

  // Navigate to the previous month
  previousMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.currentMonth = this.currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  // Navigate to the next month
  nextMonth(): void {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.currentMonth = this.currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
    this.currentYear = this.currentDate.getFullYear();
    this.generateCalendar();
  }

  filterHistory(): void {
    const val = this.searchText.toLowerCase();
    this.filteredDemandes = this.demandes.filter((item) => {
      const leaveType =
        item.userCongesId !== undefined ? this.getLeaveTypeName(item.userCongesId)?.toLowerCase() || '' : '';
      return (
        leaveType.includes(val) ||
        (item.duree?.toString() || '').toLowerCase().includes(val) ||
        (item.unite?.toLowerCase() || '').includes(val) ||
        (item.dateDebut || '').toLowerCase().includes(val) ||
        (item.statut?.toLowerCase() || '').includes(val)
      );
    });
    this.cdr.markForCheck();
  }

  getLeaveTypeName(userCongesId: number | undefined): string {
    if (userCongesId === undefined) return 'Congé';
    const userConges = this.userCongesList.find((uc) => uc.id === userCongesId);
    return userConges ? userConges.nom || 'Congé' : 'Congé';
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

  private fetchUserConges(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Vous devez être connecté pour voir vos soldes de congés.',
      });
      this.isLoading = false;
      this.cdr.markForCheck();
      return;
    }

    this.congeTypeService
      .getUserCongesByUserId(this.userId)
      .pipe(
        map((userConges: UserCongesDTO[]) => {
          this.userCongesList = userConges;
          return userConges
            .filter((uc) => uc.id !== undefined)
            .map((uc, index) => ({
              id: uc.id!,
              type: uc.nom || 'Type inconnu',
              balance: `${uc.soldeActuel} ${uc.unite === 'Heure' ? 'H' : 'J'}`,
              validity: uc.validite || 'N/A',
              color: this.getColorClass(index),
            }));
        }),
        catchError((error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les soldes de congés.',
          });
          return of([]);
        })
      )
      .subscribe((mappedUserConges) => {
        this.leaveBalances = mappedUserConges;
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  private fetchDemandes(): void {
    this.isLoadingDemandes = true;
    this.cdr.markForCheck();
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Vous devez être connecté pour voir vos demandes.',
      });
      this.isLoadingDemandes = false;
      this.cdr.markForCheck();
      return;
    }
    this.demandeService.getDemandesByUserIdAndType(this.userId, 'CONGES').subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.filteredDemandes = [...demandes];
        this.isLoadingDemandes = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.isLoadingDemandes = false;
        this.cdr.markForCheck();
      },
    });
  }

  openRequestDialog(): void {
    const dialogRef = this.dialog.open(DemandeCongesDialogComponent, {
      width: '1000px',
      data: {
        userId: this.userId,
        leaveBalances: this.leaveBalances,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const demandeRequest: DemandeRequest = {
          type: 'CONGES',
          userId: this.userId!,
          userCongesId: parseInt(result.congeTypeId, 10),
          dateDebut: result.dateDebut,
          dateFin: result.dateFin,
          unite: result.unite,
          duree: parseInt(result.duree, 10),
          commentaires: result.commentaires,
          fileUrl: result.fileUrl,
        };

        this.demandeService.createDemande(demandeRequest).subscribe({
          next: (createdDemande) => {
            Swal.fire({
              icon: 'success',
              title: 'Succès',
              text: 'Demande de congé soumise avec succès !',
            });
            this.fetchDemandes();
            this.fetchUserConges();
            this.fetchValidatedDemandes();
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.message || 'Erreur lors de la soumission de la demande.',
            });
          },
        });
      }
    });
  }

  private getColorClass(index: number): string {
    const colors = ['leave-paid', 'leave-authorization', 'leave-other'];
    return colors[index % colors.length];
  }
}