import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { SidebarComponent } from '../sidebar-RH/sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TeletravailService, TeletravailPlanningDTO, UserTeletravailDTO } from '../../../../services/teletravail.service';
import { UserService, UserDTO } from '../../../../services/users.service';
import Swal from 'sweetalert2';

interface UserPlanning {
  userId: number;
  userName: string;
  userPoste: string;
  userImage: string;
  hasPlanning: boolean;
  selectedDays: string[];
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[];
}

@Component({
  selector: 'app-list-plannings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    NgxDatatableModule,
  ],
  templateUrl: './list-plannings.component.html',
  styleUrl: './list-plannings.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ListPlanningsComponent implements OnInit {
  userPlannings: UserPlanning[] = [];
  currentMonth: Date = new Date();
  loading: boolean = false;
  isSidebarCollapsed = false; // Track sidebar state

  constructor(
    private teletravailService: TeletravailService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}
 // Handle sidebar state changes
 onSidebarStateChange(isCollapsed: boolean) {
  this.isSidebarCollapsed = isCollapsed;
  this.cdr.markForCheck(); // Ensure change detection runs
}
  ngOnInit(): void {
    this.loadUserPlannings();
  }

  loadUserPlannings(): void {
    this.loading = true;
    this.userPlannings = [];
    this.cdr.detectChanges();

    // Étape 1 : Récupérer tous les utilisateurs sauf RH
    this.userService.getAllActiveUsers().subscribe({
      next: (users: UserDTO[]) => {
        const nonRhUsers = users.filter(user => user.role !== 'RH');
        const userPromises = nonRhUsers.map(user =>
          this.loadUserPlanning(user)
        );

        // Étape 2 : Attendre que tous les plannings soient chargés
        Promise.all(userPromises.map(p => p.catch(err => undefined))).then(() => {
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: (error) => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Erreur lors du chargement des utilisateurs.',
        });
        console.error('Error fetching users:', error);
        this.cdr.detectChanges();
      }
    });
  }

  loadUserPlanning(user: UserDTO): Promise<void> {
    return new Promise((resolve) => {
      // Récupérer les plannings de l'utilisateur
      this.teletravailService.getUserPlannings(user.id).subscribe({
        next: (plannings: UserTeletravailDTO[]) => {
          const currentMonthStr = this.getCurrentMonth();
          const currentPlanning = plannings.find(p => p.planning?.mois === currentMonthStr);

          const userPlanning: UserPlanning = {
            userId: user.id,
            userName: `${user.prenom} ${user.nom}`,
            userPoste: user.poste,
            userImage: user.image || '/assets/icons/user-login-icon-14.png',
            hasPlanning: !!currentPlanning,
            selectedDays: currentPlanning ? currentPlanning.joursChoisis : [],
            calendarDays: this.generateCalendar()
          };

          this.userPlannings.push(userPlanning);
          resolve();
        },
        error: (error) => {
          console.error(`Error fetching planning for user ${user.id}:`, error);
          // En cas d'erreur, on ajoute quand même l'utilisateur avec un planning vide
          const userPlanning: UserPlanning = {
            userId: user.id,
            userName: `${user.prenom} ${user.nom}`,
            userPoste: user.poste,
            userImage: user.image || '/assets/icons/user-login-icon-14.png',
            hasPlanning: false,
            selectedDays: [],
            calendarDays: this.generateCalendar()
          };

          this.userPlannings.push(userPlanning);
          resolve();
        }
      });
    });
  }

  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }

  generateCalendar(): { date: Date; isCurrentMonth: boolean; isToday: boolean }[] {
    const calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
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
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Ajouter les jours du mois courant
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      calendarDays.push({
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
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: false
      });
    }

    return calendarDays;
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }
}