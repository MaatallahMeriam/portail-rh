import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeletravailPointageService } from '../../../../services/teletravail-pointage.service';
import { TeletravailService, UserTeletravailDTO } from '../../../../services/teletravail.service';
import { AuthService } from '../../../../shared/services/auth.service';
import { Subject, takeUntil, interval } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { RightSidebarComponent } from '../../../../shared/components/right-sidebar/right-sidebar.component';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { RightSideManagerComponent } from '../right-side-manager/right-side-manager.component';
import { SideBarManagerComponent } from '../side-bar-manager/side-bar-manager.component';
@Component({
  selector: 'app-pointage-manager',
  standalone: true,
  imports: [CommonModule,SideBarManagerComponent,
        HeaderComponent,
        RightSideManagerComponent],
  templateUrl: './pointage-manager.component.html',
  styleUrl: './pointage-manager.component.scss'
})
export class PointageManagerComponent implements OnInit, OnDestroy {
  qrCode: string | null = null;
  hasPointedToday = false;
  isTeletravailDay = false;
  errorMessage: string | undefined = undefined;
  userId: number | null = null;
  private destroy$ = new Subject<void>();
  isSidebarCollapsed = false;

  constructor(
    private pointageService: TeletravailPointageService,
    private teletravailService: TeletravailService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
  this.userId = this.authService.getUserIdFromToken();
  console.log('UserId récupéré:', this.userId, 'Type:', typeof this.userId); // Log détaillé
  if (!this.userId || isNaN(this.userId)) {
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: 'Utilisateur non connecté ou ID invalide.'
    }).then(() => {
      this.authService.logout();
    });
    return;
  }

  this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
    const token = params['token'];
    if (token) {
      this.confirmPointage(token);
    }
  });

  this.checkTeletravailDay();
  this.checkPointageStatus();
  this.startPolling();
}

  onSidebarStateChange(isCollapsed: boolean) {
    this.isSidebarCollapsed = isCollapsed;
  }

  private checkTeletravailDay(): void {
    const today = new Date().toISOString().split('T')[0];
    this.teletravailService.getUserPlannings(this.userId!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (plannings: UserTeletravailDTO[]) => {
        this.isTeletravailDay = plannings.some(planning =>
          planning.joursChoisis.includes(today)
        );
        console.log('isTeletravailDay:', this.isTeletravailDay, 'Plannings:', plannings);
        if (this.isTeletravailDay && !this.hasPointedToday) {
          this.loadQRCode();
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Erreur dans checkTeletravailDay:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  }

  private checkPointageStatus(): void {
  const today = new Date().toISOString().split('T')[0];
  console.log('Vérification pointage pour userId:', this.userId, 'Date:', today);
  console.log('Token JWT:', this.authService.getToken());
  if (this.userId) { // Vérification pour éviter les erreurs si userId est null
    this.pointageService.getPointages(today, today, this.userId).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (pointages) => {
        console.log('Pointages reçus:', pointages);
        this.hasPointedToday = pointages.length > 0;
        if (this.hasPointedToday) {
          this.qrCode = null;
        }
      },
      error: (err) => {
        this.errorMessage = `Erreur lors de la vérification du pointage : ${err.message}`;
        console.error('Erreur dans checkPointageStatus:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  } else {
    this.errorMessage = 'Utilisateur non identifié.';
    console.error('Erreur : userId est null');
    Swal.fire({
      icon: 'error',
      title: 'Erreur',
      text: this.errorMessage
    });
  }
}

  private loadQRCode(): void {
    this.pointageService.getQRCode(this.userId!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (qrCode) => {
        this.qrCode = `data:image/png;base64,${qrCode}`;
        this.errorMessage = undefined;
        console.log('QR Code chargé avec succès');
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Erreur dans loadQRCode:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
        this.qrCode = null;
      }
    });
  }

  sendPointageEmail(): void {
    this.pointageService.sendPointageEmail(this.userId!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (message) => {
        Swal.fire({
          icon: 'success',
          title: 'Succès',
          text: 'Email de pointage envoyé avec succès !'
        });
        this.errorMessage = undefined;
        console.log('Email de pointage envoyé');
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Erreur dans sendPointageEmail:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  }

  confirmPointage(token: string): void {
    this.pointageService.confirmPointage(token).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (message) => {
        Swal.fire({
          icon: 'success',
          title: 'Pointage confirmé',
          text: message
        });
        this.hasPointedToday = true;
        this.qrCode = null;
        this.errorMessage = undefined;
        this.checkPointageStatus();
        console.log('Pointage confirmé avec succès');
      },
      error: (err) => {
        this.errorMessage = err.message;
        console.error('Erreur dans confirmPointage:', err);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  }

  private startPolling(): void {
    interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isTeletravailDay && !this.hasPointedToday) {
          this.checkPointageStatus();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}