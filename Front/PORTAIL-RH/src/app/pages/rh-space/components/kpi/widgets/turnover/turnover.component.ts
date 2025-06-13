import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { KpiService, Kpi } from '../../../../../../services/kpi.service';

@Component({
  selector: 'app-turnover',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Turnover Rate</h3>
        <div class="refresh-button" (click)="loadKpi()" [class.rotating]="isRefreshing">
          <mat-icon>refresh</mat-icon>
        </div>
      </div>
      <div class="widget-content">
       
        
        <div class="turnover-display">
          <div class="turnover-rate" [ngClass]="getTurnoverRateClass()">
            14,29 %
          </div>
          <div class="turnover-gauge">
            <div class="gauge-fill" [style.width.%]="getGaugeWidth()"></div>
            </div>
        </div>
        
        <div class="turnover-details">
          <div class="detail-card">
            <div class="detail-icon">
              <mat-icon>people_alt</mat-icon>
            </div>
            <div class="detail-content">
              <div class="detail-label">Effectif moyen</div>
              <div class="detail-value">14</div>
            </div>
          </div>
          
          <div class="detail-card">
            <div class="detail-icon departure">
              <mat-icon>exit_to_app</mat-icon>
            </div>
            <div class="detail-content">
              <div class="detail-label">Départs</div>
              <div class="detail-value">2</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    // Base styles for all dashboard widgets
    $primary: #3F2A82;
    $secondary: #E5007F;
    $accent: #F5AF06;
    $light-bg: #f8f9fa;
    $card-bg: #ffffff;
    $text-primary: #333333;
    $text-secondary: #666666;
    $text-light: #999999;
    $shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
    $shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
    $shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
    $border-radius-sm: 8px;
    $border-radius-md: 12px;
    $border-radius-lg: 16px;
    $spacing-xs: 4px;
    $spacing-sm: 8px;
    $spacing-md: 16px;
    $spacing-lg: 24px;
    $spacing-xl: 32px;
    $transition-fast: 0.2s ease;
    $transition-normal: 0.3s ease;
    $transition-slow: 0.5s ease;

    @mixin widget-container {
      background-color: $card-bg;
      border-radius: $border-radius-md;
      box-shadow: $shadow-sm;
      height: 100%;
      transition: transform $transition-normal, box-shadow $transition-normal;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }
    }

    @mixin widget-header {
      padding: $spacing-md $spacing-md $spacing-sm;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
        color: $secondary;
        position: relative;
        
        &::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 30px;
          height: 3px;
          background-color: $accent;
          border-radius: 3px;
        }
      }
    }

    @mixin widget-content {
      padding: $spacing-md;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    @mixin avatar($size: 40px) {
      width: $size;
      height: $size;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
      box-shadow: $shadow-sm;
    }

    @mixin badge($bg-color: $accent) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 $spacing-sm;
      height: 20px;
      border-radius: 10px;
      background-color: $bg-color;
      color: white;
      font-size: 12px;
      font-weight: 500;
    }

    @mixin button($bg-color: $secondary) {
      background-color: $bg-color;
      color: white;
      border: none;
      border-radius: 20px;
      padding: $spacing-sm $spacing-md;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color $transition-fast, transform $transition-fast;
      
      &:hover {
        background-color: darken($bg-color, 10%);
        transform: translateY(-1px);
      }
      
      &:active {
        transform: translateY(0);
      }
    }

    // Animations
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from { 
        opacity: 0;
        transform: translateY(20px);
      }
      to { 
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }

    // Component-specific styles
    .widget-container {
      @include widget-container();
    }
    
    .widget-header {
      @include widget-header();
    }
    
    .refresh-button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 50%;
      transition: all $transition-normal;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }
      
      &.rotating mat-icon {
        animation: rotate 1s linear infinite;
      }
      
      mat-icon {
        color: $secondary;
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
    }
    
    .widget-content {
      @include widget-content();
      gap: $spacing-lg;
    }
    
    .calculation-date {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      color: $text-secondary;
      font-size: 14px;
      
      mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
    }
    
    .turnover-display {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-md 0;
    }
    
    .turnover-rate {
      font-size: 48px;
      font-weight: 700;
      transition: color $transition-normal;
      
      &.low {
        color: #4CAF50; // Green for good (low turnover)
      }
      
      &.medium {
        color: #FF9800; // Orange for caution
      }
      
      &.high {
        color: #F44336; // Red for warning (high turnover)
      }
    }
    
    .turnover-gauge {
      margin-top : 125px;
      width: 100%;
      height: 8px;
      background-color: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }
    
    .gauge-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: linear-gradient(to right, #4CAF50, #FF9800, #F44336);
      border-radius: 4px;
      transition: width 1s ease-in-out;
    }
    
    .turnover-details {
      display: flex;
      gap: $spacing-md;
      width: 100%;
    }
    
    .detail-card {
      flex: 1;
      display: flex;
      align-items: center;
      gap: $spacing-sm;
      padding: $spacing-md;
      background-color: rgba(0, 0, 0, 0.02);
      border-radius: $border-radius-sm;
      transition: all $transition-normal;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        transform: translateY(-2px);
      }
    }
    
    .detail-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(63, 42, 130, 0.1);
      border-radius: 50%;
      
      &.departure {
        background-color: rgba(229, 0, 127, 0.1);
      }
      
      mat-icon {
        color: $primary;
        font-size: 20px;
        height: 20px;
        width: 20px;
      }
      
      &.departure mat-icon {
        color: $secondary;
      }
    }
    
    .detail-content {
      display: flex;
      flex-direction: column;
    }
    
    .detail-label {
      font-size: 12px;
      color: $text-secondary;
    }
    
    .detail-value {
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }
    
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `],
})
export class TurnoverComponent implements OnInit, OnDestroy {
  kpi: Kpi | null = null;
  private subscription: Subscription | null = null;
  isRefreshing = false;

  constructor(private kpiService: KpiService) {}

  ngOnInit(): void {
    // Load initial data
    this.loadKpi();

    // Set up polling to update hourly
    this.subscription = interval(3600000) // 1 hour = 3600000ms
      .pipe(switchMap(() => this.kpiService.getLatestKpi()))
      .subscribe({
        next: (kpi) => {
          this.kpi = kpi;
        },
        error: (err) => {
          console.error('Error retrieving KPI:', err);
        },
      });
  }

  ngOnDestroy(): void {
    // Clean up subscription to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadKpi(): void {
    this.isRefreshing = true;
    this.kpiService.getLatestKpi().subscribe({
      next: (kpi) => {
        this.kpi = kpi;
        setTimeout(() => {
          this.isRefreshing = false;
        }, 1000);
      },
      error: (err) => {
        console.error('Error retrieving initial KPI:', err);
        this.isRefreshing = false;
      },
    });
  }
  
  getTurnoverRateClass(): string {
    if (!this.kpi) return '';
    
    const rate = this.kpi.turnover;
    if (rate <= 10) return 'low';
    if (rate <= 20) return 'medium';
    return 'high';
  }
  
  getGaugeWidth(): number {
    if (!this.kpi) return 0;
    
    // Limit the gauge to a max of 100%
    // Assuming 30% turnover is the "max" we want to show visually
    return Math.min(100, (this.kpi.turnover / 30) * 100);
  }
}