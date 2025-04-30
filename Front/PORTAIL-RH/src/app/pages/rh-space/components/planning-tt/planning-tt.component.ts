import { ChangeDetectionStrategy, Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router'; // Ajout de l'import pour RouterModule
import { AuthService } from '../../../../shared/services/auth.service';
import { TeletravailService, TeletravailPlanningDTO, UserTeletravailDTO } from '../../../../services/teletravail.service';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-planning-tt',
  standalone: true,
  imports: [
    NgxDatatableModule,
    HeaderComponent,
    SidebarComponent,
    CommonModule,
    CarouselModule,
    BsDatepickerModule,
    MatCardModule,
    MatDatepickerModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule,
    FormsModule,
    RouterModule // Ajout de RouterModule dans les imports
  ],
  templateUrl: './planning-tt.component.html',
  styleUrl: './planning-tt.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlanningTtComponent implements OnInit {
  planning: TeletravailPlanningDTO = {
    politique: 'CHOIX_LIBRE',
    mois: this.getCurrentMonth(),
    joursFixes: [],
    rhId: 0
  };

  existingPlanning: TeletravailPlanningDTO | null = null;
  currentMonth: Date = new Date();
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
  selectedDays: string[] = [];

  constructor(
    private teletravailService: TeletravailService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkExistingPlanning();
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  checkExistingPlanning(): void {
    this.teletravailService.getPlanningsForMonth(this.getCurrentMonth()).subscribe({
      next: (plannings: TeletravailPlanningDTO[]) => {
        console.log('Plannings trouvés pour le mois courant :', plannings);
        if (plannings.length > 0) {
          this.existingPlanning = plannings[0];
          this.selectedDays = this.existingPlanning.joursFixes || [];
        } else {
          this.existingPlanning = null;
        }
        this.generateCalendar();
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Erreur lors de la vérification du planning', error);
        this.existingPlanning = null;
        this.generateCalendar();
        this.cdr.markForCheck();
      }
    });
  }

  onPolitiqueChange(): void {
    this.planning.nombreJoursMax = undefined;
    this.selectedDays = [];
    this.planning.joursFixes = [];
    this.generateCalendar();
    this.cdr.markForCheck();
  }

  generateCalendar(): void {
    this.calendarDays = [];
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const today = new Date();

    // Ajouter des jours de remplissage avant le début du mois
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

    // Ajouter les jours du mois courant
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

    // Ajouter des jours de remplissage après la fin du mois
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

  toggleDay(date: Date): void {
    if (this.existingPlanning || this.planning.politique !== 'PLANNING_FIXE' || !this.isCurrentMonth(date)) {
      return;
    }

    const dateString = this.formatDate(date);
    const index = this.selectedDays.indexOf(dateString);
    if (index === -1) {
      this.selectedDays.push(dateString);
    } else {
      this.selectedDays.splice(index, 1);
    }
    this.planning.joursFixes = [...this.selectedDays];
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
    this.generateCalendar();
    this.cdr.markForCheck();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 1);
    this.generateCalendar();
    this.cdr.markForCheck();
  }

  isFormValid(): boolean {
    if (this.planning.politique === 'SEUIL_LIBRE' || this.planning.politique === 'PLANNING_FIXE') {
      if (this.planning.nombreJoursMax === undefined || this.planning.nombreJoursMax <= 0) {
        return false;
      }
    }
    if (this.planning.politique === 'PLANNING_FIXE') {
      if (this.planning.joursFixes.length === 0) {
        return false;
      }
    }
    return true;
  }

  createPlanning(): void {
    if (!this.isFormValid()) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Veuillez remplir tous les champs requis.'
      });
      return;
    }

    this.teletravailService.createPlanning(this.planning).subscribe({
      next: (result) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: `Planning de télétravail créé avec succès pour ${result.mois} !`
        });
        this.resetForm();
        this.checkExistingPlanning();
      },
      error: (error) => {
        // L'erreur est déjà gérée par TeletravailService avec Swal
      }
    });
  }

  resetForm(): void {
    this.planning = {
      politique: 'CHOIX_LIBRE',
      mois: this.getCurrentMonth(),
      joursFixes: [],
      rhId: 0
    };
    this.selectedDays = [];
    this.currentMonth = new Date();
    this.generateCalendar();
    this.cdr.markForCheck();
  }
}