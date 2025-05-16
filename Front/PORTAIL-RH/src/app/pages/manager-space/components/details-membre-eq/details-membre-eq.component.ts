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
import { animate, style, transition, trigger } from '@angular/animations';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class DetailsMembreEqComponent implements OnInit {
  user: UserDTO | null = null;
  userConges: CongeTypeDTO[] = [];
  currentMonth: Date = new Date();
  calendarDays: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];
  selectedDays: string[] = [];
  hasPlanning: boolean = false;
  loading: boolean = true;
  isSidebarCollapsed: boolean = false;

  carouselOptions = {
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      576: { items: 2 },
      768: { items: 2 },
      992: { items: 3 },
      1200: { items: 4 }
    },
    nav: true,
    autoplay: false,
    autoplayTimeout: 5000,
    autoplayHoverPause: true
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
        this.showError('ID du membre manquant.');
        this.router.navigate(['/list-member-manager']);
      }
    });
  }

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  loadUserDetails(userId: number): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (user: UserDTO) => {
        this.user = user;
        setTimeout(() => {
          this.loading = false;
        }, 500); // Add slight delay for smoother transition
      },
      error: (err) => {
        console.error('Erreur lors du chargement des détails de l\'utilisateur:', err);
        this.showError('Impossible de charger les détails de l\'utilisateur.');
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
        this.showError('Impossible de charger les congés de l\'utilisateur.');
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
    const defaultImage = 'assets/icons/user-login-icon-14.png';
    if (!user.image) return `url(${defaultImage})`;
    
    const imagePath = user.image.replace(/\\/g, '/');
    return `url(${imagePath})`;
  }

  getColorForType(type: string): string {
    switch (type?.toUpperCase()) {
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

    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const startDay = firstDayOfMonth.getDay();
    // Adjust for Monday as first day of week
    const offset = startDay === 0 ? 6 : startDay - 1;
    
    // Add days from previous month
    for (let i = offset; i > 0; i--) {
      const date = new Date(year, month, 1 - i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today)
      });
    }

    // Add days from current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(year, month, day);
      calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today)
      });
    }

    // Add days from next month to complete the grid
    const lastDay = lastDayOfMonth.getDay();
    const endOffset = lastDay === 0 ? 0 : 7 - lastDay;
    for (let i = 1; i <= endOffset; i++) {
      const date = new Date(year, month + 1, i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today)
      });
    }

    return calendarDays;
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  }

  formatDate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }
  
  showError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: message,
      confirmButtonColor: '#230046'
    });
  }
}