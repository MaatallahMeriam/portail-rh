import { Component, OnInit } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { MatCardModule } from '@angular/material/card';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { UserService, UserDTO } from '../../../../services/users.service';
import { CongeTypeService, CongeTypeDTO } from '../../../../services/conge-type.service';
import { TeletravailService, UserTeletravailDTO } from '../../../../services/teletravail.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-details-membre-eq',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    MatCardModule,
    HeaderComponent,
    SideBarManagerComponent,
  ],
  templateUrl: './details-membre-eq.component.html',
  styleUrl: './details-membre-eq.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DetailsMembreEqComponent implements OnInit {
  user: UserDTO | null = null;
  userConges: CongeTypeDTO[] = [];
  currentMonth: Date = new Date();
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
  selectedDays: string[] = [];
  hasPlanning: boolean = false;
  loading: boolean = true;

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
      940: { items: 4 }
    },
    nav: true
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private congeTypeService: CongeTypeService,
    private teletravailService: TeletravailService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const memberId = params['memberId'] ? +params['memberId'] : null;
      if (memberId) {
        this.loadUserDetails(memberId);
        this.loadUserConges(memberId);
        this.loadUserTeletravail(memberId);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'ID du membre manquant.',
        });
        this.router.navigate(['/list-member-manager']);
      }
    });
  }

  loadUserDetails(userId: number): void {
    this.userService.getUserById(userId).subscribe({
      next: (user: UserDTO) => {
        this.user = user;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de l\'utilisateur:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les détails de l\'utilisateur.',
        });
        this.loading = false;
        this.router.navigate(['/list-member-manager']);
      }
    });
  }

  loadUserConges(userId: number): void {
    this.congeTypeService.getAllCongeTypesForUser(userId).subscribe({
      next: (conges: CongeTypeDTO[]) => {
        this.userConges = conges;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des congés:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de charger les congés de l\'utilisateur.',
        });
      }
    });
  }

  loadUserTeletravail(userId: number): void {
    this.teletravailService.getUserPlannings(userId).subscribe({
      next: (plannings: UserTeletravailDTO[]) => {
        const currentMonthStr = this.getCurrentMonth();
        const currentPlanning = plannings.find(p => p.planning?.mois === currentMonthStr);
        const hasSelectedDays = !!currentPlanning && !!currentPlanning.joursChoisis && currentPlanning.joursChoisis.length > 0;

        this.hasPlanning = hasSelectedDays;
        this.selectedDays = hasSelectedDays && currentPlanning ? currentPlanning.joursChoisis : [];
        this.calendarDays = this.generateCalendar();
      },
      error: (err) => {
        console.error('Erreur lors du chargement du planning de télétravail:', err);
        this.hasPlanning = false;
        this.selectedDays = [];
        this.calendarDays = this.generateCalendar();
      }
    });
  }

  getBackgroundImage(user: UserDTO): string {
    const imagePath = user.image ? user.image.replace(/\\/g, '/') : 'assets/icons/user-login-icon-14.png';
    return `url(${imagePath})`;
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