import { Component, ViewChild, type ElementRef, type AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-absence-rate",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Taux d'Absence</h3>
        <div class="period">
          <mat-icon>calendar_today</mat-icon>
          <span>Aujourd'hui</span>
        </div>
      </div>
      <div class="chart-wrapper">
        <div class="chart-container">
          <canvas #chartCanvas></canvas>
        </div>
        <div class="chart-info">
          <div class="chart-percentage">55%</div>
          <div class="chart-label">Présents</div>
        </div>
      </div>
      <div class="legend">
        <div class="legend-item present">
          <div class="legend-icon">
            <mat-icon>people</mat-icon>
          </div>
          <div class="legend-content">
            <span class="legend-label">Employés en travail</span>
            <span class="legend-value">55%</span>
          </div>
        </div>
        <div class="legend-item absent">
          <div class="legend-icon">
            <mat-icon>event_busy</mat-icon>
          </div>
          <div class="legend-content">
            <span class="legend-label">Employés en congés</span>
            <span class="legend-value">45%</span>
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
      margin-bottom: $spacing-lg;
    }
    
    .period {
      display: flex;
      align-items: center;
      gap: $spacing-xs;
      padding: $spacing-xs $spacing-md;
      background: rgba($primary, 0.05);
      border-radius: $border-radius-sm;
      color: $primary;
      font-size: 14px;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }
    
    .chart-wrapper {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: $spacing-xl 0;
    }
    
    .chart-container {
      position: relative;
      height: 200px;
      width: 200px;
    }
    
    .chart-info {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 2;
    }
    
    .chart-percentage {
      font-size: 32px;
      font-weight: 700;
      color: $primary;
      margin-bottom: $spacing-xs;
    }
    
    .chart-label {
      font-size: 14px;
      color: $text-secondary;
    }
    
    .legend {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      padding: $spacing-md;
      background: $light-bg;
      border-radius: $border-radius-md;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-sm;
      border-radius: $border-radius-sm;
      transition: all $transition-normal;
      
      &:hover {
        background: rgba($primary, 0.05);
        transform: translateX($spacing-xs);
      }
      
      &.present .legend-icon {
        background: rgba($primary, 0.1);
        color: $primary;
      }
      
      &.absent .legend-icon {
        background: rgba($secondary, 0.1);
        color: $secondary;
      }
    }
    
    .legend-icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      
      mat-icon {
        font-size: 20px;
      }
    }
    
    .legend-content {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }
    
    .legend-label {
      font-size: 14px;
      color: $text-primary;
    }
    
    .legend-value {
      font-size: 16px;
      font-weight: 600;
      color: $primary;
    }
  `]
})
export class AbsenceRateComponent implements AfterViewInit {
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: any;

  ngAfterViewInit(): void {
    this.createChart();
  }

  createChart(): void {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    const ctx = this.chartCanvas.nativeElement.getContext("2d");
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Employés en travail", "Employés en congés"],
        datasets: [
          {
            data: [55, 45],
            backgroundColor: ["#3F2A82", "#E5007F"],
            borderWidth: 0,
            borderRadius: 5,
            hoverOffset: 4
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "75%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(63, 42, 130, 0.9)',
            titleFont: {
              size: 14,
              weight: 600
            },
            bodyFont: {
              size: 13
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}%`,
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 1000,
          easing: 'easeOutQuart'
        }
      },
    });
  }
}