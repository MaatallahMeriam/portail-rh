import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar-collab/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../shared/services/auth.service';
import { TeletravailService, UserTeletravailDTO } from '../../../../services/teletravail.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planning-user',
  standalone: true,
  imports: [
    NgxDatatableModule,
    HeaderComponent,
    SidebarComponent,
    CommonModule,
    CarouselModule,
    BsDatepickerModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './planning-user.component.html',
  styleUrl: './planning-user.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningUserComponent implements OnInit {
  userPlanning: UserTeletravailDTO | null = null;
  currentMonth: Date = new Date();
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
  selectedDays: string[] = [];
  isValidated: boolean = false;
  validatedMonth: string | null = null;
  isSidebarCollapsed = false;

  constructor(
    private teletravailService: TeletravailService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserPlanning();
  }

  onSidebarStateChange(isCollapsed: boolean) {
    this.isSidebarCollapsed = isCollapsed;
    this.cdr.markForCheck();
  }

  navigateToPointage(): void {
    this.router.navigate(['/pointage-collab']);
  }

  loadUserPlanning(): void {
    const userId = this.authService.getUserIdFromToken();
    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      });
      return;
    }

    const currentMonthStr = this.getCurrentMonth();
    
    if (this.validatedMonth && this.validatedMonth !== currentMonthStr) {
      this.isValidated = false;
      this.validatedMonth = null;
      this.selectedDays = [];
    }

    this.teletravailService.getUserPlannings(userId).subscribe({
      next: (plannings: UserTeletravailDTO[]) => {
        console.log('Plannings récupérés :', plannings);
        console.log('Mois courant :', currentMonthStr);
        const planningForMonth = plannings.find(p => p.planning?.mois === currentMonthStr);
        console.log('Planning trouvé :', planningForMonth);
        this.userPlanning = planningForMonth || null;

        if (this.userPlanning && this.userPlanning.joursChoisis) {
          this.selectedDays = [...this.userPlanning.joursChoisis];
          if (this.selectedDays.length > 0) {
            this.isValidated = true;
            this.validatedMonth = currentMonthStr;
          }
        }

        this.generateCalendar();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors de la récupération du planning utilisateur', error);
        this.userPlanning = null;
        this.generateCalendar();
        this.cdr.markForCheck();
      }
    });
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const today = new Date();

    const startDay = firstDayOfMonth.getDay();
    const offset = startDay === 0 ? 6 : startDay - 1;
    for (let i = offset; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }

    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      this.calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday:
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
      });
    }

    const lastDay = lastDayOfMonth.getDay();
    const endOffset = lastDay === 0 ? 0 : 7 - lastDay;
    for (let i = 1; i <= endOffset; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }
  }

  isDaySelectable(date: Date): boolean {
    if (!this.userPlanning || !this.userPlanning.planning || !this.isCurrentMonth(date)) {
      return false;
    }

    const dateString = this.formatDate(date);
    const nombreJoursMax = this.userPlanning.planning.nombreJoursMax;
    const politique = this.userPlanning.planning.politique;

    if (politique === 'PLANNING_FIXE' || politique === 'PLANNING_FIXE_JOURS_LIBRES') {
      return this.userPlanning.planning.joursFixes.includes(dateString);
    }

    if (nombreJoursMax && this.selectedDays.length >= nombreJoursMax && !this.selectedDays.includes(dateString)) {
      return false;
    }

    return true;
  }

  toggleDay(date: Date): void {
    if (this.isValidated || !this.isDaySelectable(date)) {
      return;
    }

    const dateString = this.formatDate(date);
    const index = this.selectedDays.indexOf(dateString);
    if (index === -1) {
      this.selectedDays.push(dateString);
    } else {
      this.selectedDays.splice(index, 1);
    }

    this.cdr.markForCheck();
  }

  isSelectedDay(date: Date): boolean {
    return this.selectedDays.includes(this.formatDate(date));
  }

  isCurrentMonth(date: Date): boolean {
    return (
      date.getMonth() === this.currentMonth.getMonth() &&
      date.getFullYear() === this.currentMonth.getFullYear()
    );
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() - 1, 1);
    this.loadUserPlanning();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.loadUserPlanning();
  }

  validateSelection(): void {
    if (!this.userPlanning || this.selectedDays.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucune sélection',
        text: 'Veuillez sélectionner au moins un jour de télétravail.'
      });
      return;
    }

    const userTeletravailDTO: UserTeletravailDTO = {
      id: this.userPlanning.id,
      userId: this.userPlanning.userId,
      planningId: this.userPlanning.planningId,
      joursChoisis: [...this.selectedDays]
    };

    this.teletravailService.selectDays(userTeletravailDTO).subscribe({
      next: (result) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Vos jours de télétravail ont été enregistrés avec succès !'
        });
        this.userPlanning = result;
        this.isValidated = true;
        this.validatedMonth = this.getCurrentMonth();
        this.cdr.markForCheck();
      },
      error: (error) => {
        // L'erreur est déjà gérée par TeletravailService avec Swal
      }
    });
  }
}