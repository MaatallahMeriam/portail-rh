import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KpiService, Kpi } from '../../../../../../services/kpi.service';

@Component({
  selector: 'app-turnover',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Turnover Rate</h3>
        <div class="date-mesure">{{ kpi?.dateCalcul | date:'MMMM yyyy' }}</div>
        <div class="menu-container">
          <!-- Menu options can be added here if needed -->
        </div>
      </div>
      <div class="turnover-content">
        <div class="turnover-rate">{{ kpi?.turnover }}%</div>
        <div class="turnover-details">
          <div class="detail-item">Nombre de départs: {{ kpi?.nbreDepart }}</div>
          <div class="detail-item">Effectif moyen: {{ kpi?.effectifMoyen }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .menu-button {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #56142f;
      }

      .menu-container {
        position: relative;
      }

      .dropdown-menu {
        position: absolute;
        top: 100%;
        right: 0;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        padding: 15px;
        z-index: 1000;
        min-width: 250px;
      }

      .turnover-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .form-group label {
        font-size: 14px;
        color: #56142f;
        font-weight: 500;
      }

      .form-group input {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }

      .calculate-button {
        background-color: #e91e63;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        margin-top: 8px;
        transition: background-color 0.2s;
      }

      .calculate-button:hover {
        background-color: #3e0f23;
      }

      .widget-container {
        background-color: #f5f5f5;
        border-radius: 15px;
        padding: 15px;
        height: 100%;
        display: flex;
        flex-direction: column;
      }

      .widget-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }

      .widget-header h3 {
        margin: 0;
        font-size: 20px;
        font-weight: 600;
        color: #56142f;
      }

      .date-mesure {
        font-size: 14px;
        color: #56142f;
        font-weight: 500;
      }

      .turnover-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        gap: 20px;
      }

      .turnover-rate {
        font-size: 48px;
        font-weight: bold;
        color: #1a237e;
      }

      .turnover-details {
        background-color: #ffc107;
        border-radius: 25px;
        padding: 15px;
        text-align: center;
        width: 100%;
        max-width: 250px;
      }

      .detail-item {
        color: white;
        font-weight: 500;
        margin-bottom: 5px;
      }
    `,
  ],
})
export class TurnoverComponent implements OnInit, OnDestroy {
  kpi: Kpi | null = null;
  private subscription: Subscription | null = null;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    // Récupérer les données initiales
    this.loadKpi();

    // Configurer le polling pour mettre à jour toutes les heures
    this.subscription = interval(3600000) // 1 heure = 3600000ms
      .pipe(switchMap(() => this.kpiService.getLatestKpi()))
      .subscribe({
        next: (kpi) => {
          this.kpi = kpi;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération du KPI:', err);
        },
      });
  }

  ngOnDestroy(): void {
    // Nettoyer l'abonnement pour éviter les fuites de mémoire
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private loadKpi(): void {
    this.kpiService.getLatestKpi().subscribe({
      next: (kpi) => {
        this.kpi = kpi;
      },
      error: (err) => {
        console.error('Erreur lors de la récupération initiale du KPI:', err);
      },
    });
  }
}