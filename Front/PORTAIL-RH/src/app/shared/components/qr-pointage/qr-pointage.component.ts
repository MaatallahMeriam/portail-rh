import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeletravailPointageService } from '../../../services/teletravail-pointage.service';
import { TeletravailService, UserTeletravailDTO } from '../../../services/teletravail.service';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { RightSidebarComponent } from '../right-sidebar/right-sidebar.component';
import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-qr-pointage',
  standalone: true,
  imports: [CommonModule,
    HeaderComponent,
    RightSidebarComponent
  ],
  templateUrl: './qr-pointage.component.html',
  styleUrls: ['./qr-pointage.component.scss']
})
export class QrPointageComponent implements OnInit, OnDestroy {
  qrCode: string | null = null;
  hasPointedToday = false;
  isTeletravailDay = false;
  errorMessage: string | undefined = undefined; // Changed to string | undefined
  userId: number | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private pointageService: TeletravailPointageService,
    private teletravailService: TeletravailService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = this.authService.getUserIdFromToken();
    if (!this.userId) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Utilisateur non connecté.'
      }).then(() => {
        this.authService.logout();
      });
      return;
    }

    this.checkTeletravailDay();
  }

  // Vérifier si aujourd'hui est un jour de télétravail
  private checkTeletravailDay(): void {
    const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
    this.teletravailService.getUserPlannings(this.userId!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (plannings: UserTeletravailDTO[]) => {
        this.isTeletravailDay = plannings.some(planning =>
          planning.joursChoisis.includes(today)
        );
        if (this.isTeletravailDay && !this.hasPointedToday) {
          this.loadQRCode();
        }
      },
      error: (err) => {
        this.errorMessage = err.message;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  }


  // Charger le QR code
  private loadQRCode(): void {
    this.pointageService.getQRCode(this.userId!).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (qrCode) => {
        this.qrCode = `data:image/png;base64,${qrCode}`;
        this.errorMessage = undefined; // Reset to undefined
      },
      error: (err) => {
        this.errorMessage = err.message;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
        this.qrCode = null;
      }
    });
  }

  // Envoyer l'email de pointage
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
        this.errorMessage = undefined; // Reset to undefined
      },
      error: (err) => {
        this.errorMessage = err.message;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  }

  // Confirmer le pointage (pour tests ou simulation)
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
        this.errorMessage = undefined; // Reset to undefined
      },
      error: (err) => {
        this.errorMessage = err.message;
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.errorMessage
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}