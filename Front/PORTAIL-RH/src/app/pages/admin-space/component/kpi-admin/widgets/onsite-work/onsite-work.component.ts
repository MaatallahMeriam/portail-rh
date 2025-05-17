import { Component, ViewChild, type ElementRef, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js"

@Component({
  selector: "app-onsite-work",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Répartition du travail</h3>
      </div>
      <div class="widget-content">
        <div class="chart-wrapper">
          <div class="chart-container">
            <canvas #chartCanvas></canvas>
          </div>
          <div class="chart-info">
            <div class="chart-percentage" [ngClass]="{'highlight': highlightOnsite}">75%</div>
            <div class="chart-label" [ngClass]="{'highlight': highlightOnsite}">Sur site</div>
          </div>
        </div>
        <div class="legend-container">
          <div class="legend-item" (mouseenter)="highlightOnsite = true" (mouseleave)="highlightOnsite = false">
            <span class="legend-color onsite"></span>
            <span class="legend-text">Sur site</span>
            <span class="legend-value">75%</span>
          </div>
          <div class="legend-item" (mouseenter)="highlightOnsite = false" (mouseleave)="highlightOnsite = true">
            <span class="legend-color remote"></span>
            <span class="legend-text">Télétravail</span>
            <span class="legend-value">25%</span>
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
    
    .widget-content {
      @include widget-content();
      align-items: center;
      gap: $spacing-lg;
    }
    
    .chart-wrapper {
      position: relative;
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: $spacing-md 0;
    }
    
    .chart-container {
      position: relative;
      height: 180px;
      width: 180px;
    }
    
    .chart-info {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      transition: all $transition-normal;
      z-index: 2;
    }
    
    .chart-percentage {
      font-size: 28px;
      font-weight: 700;
      color: $primary;
      transition: all $transition-normal;
      
      &.highlight {
        transform: scale(1.1);
      }
    }
    
    .chart-label {
      font-size: 14px;
      color: $text-secondary;
      font-weight: 500;
      transition: all $transition-normal;
      
      &.highlight {
        color: $primary;
      }
    }
    
    .legend-container {
      display: flex;
      margin-top : 60px;
      flex-direction: column;
      gap: $spacing-md;
      width: 100%;
      padding: 0 $spacing-md;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      padding: $spacing-sm $spacing-md;
      border-radius: $border-radius-sm;
      background-color: rgba(0, 0, 0, 0.02);
      transition: all $transition-normal;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        transform: translateX(5px);
      }
    }
    
    .legend-color {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 4px;
      margin-right: $spacing-md;
      
      &.onsite {
        background-color: $primary;
      }
      
      &.remote {
        background-color: $secondary;
      }
    }
    
    .legend-text {
      flex: 1;
      font-size: 14px;
      font-weight: 500;
      color: $text-primary;
    }
    
    .legend-value {
      font-weight: 600;
      color: $text-primary;
    }
  `],
})
export class OnsiteWorkComponent implements AfterViewInit {
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>
  chart: any
  highlightOnsite = true;

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.createChart()
    }, 100)
  }

  createChart(): void {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

    const ctx = this.chartCanvas.nativeElement.getContext("2d")
    if (!ctx) return

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Sur site", "Télétravail"],
        datasets: [
          {
            data: [75, 25],
            backgroundColor: ["#3F2A82", "#E5007F"],
            borderWidth: 0,
            borderRadius: 5,
            hoverOffset: 5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 10,
            cornerRadius: 8,
            caretSize: 0,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}%`,
            },
          },
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeOutQuart',
        },
      },
    })
  }
}