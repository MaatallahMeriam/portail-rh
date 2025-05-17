import { Component, ViewChild, ElementRef, AfterViewInit, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip } from "chart.js";
import { UserService, UserDTO } from "../../../../../../services/users.service";

@Component({
  selector: "app-age-groups",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <div class="header-main">
          <h3>Tranches d'âges des employés</h3>
          <span class="total-count">Total: {{ getTotalEmployees() }}</span>
        </div>
        
      </div>
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
      <div class="age-stats">
        <div class="stat-item">
          <span class="stat-label">Âge moyen</span>
          <span class="stat-value">{{ calculateAverageAge() }} ans</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Tranche majoritaire</span>
          <span class="stat-value">{{ getMajorityAgeGroup() }}</span>
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
      padding: $spacing-lg;
      gap: $spacing-md;
    }
    
    .widget-header {
      @include widget-header();
      align-items: flex-start;
    }

    .header-main {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
    }
    
    .widget-header h3 {
      font-size: 20px;
      font-weight: 600;
      color: #230046; // Adjusted to match original design intent
    }

    .total-count {
      margin-top : 10px;
      font-size: 14px;
      color: $text-secondary;
      padding: 0 $spacing-sm;
      background: $light-bg;
      border-radius: $border-radius-sm;
      display: inline-block;
    }

    .refresh-btn {
      @include button(#230046); // Adjusted to match original design intent
      padding: $spacing-sm;
      border-radius: $border-radius-sm;
      i {
        font-size: 16px;
      }
      
      &:hover {
        background: $light-bg;
      }
    }
    
    .chart-container {
      position: relative;
      height: 250px;
      width: 100%;
    }

    .age-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: $spacing-md;
      padding: $spacing-md;
      background: $light-bg;
      border-radius: $border-radius-md;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      padding: $spacing-md;
      background: $card-bg;
      border-radius: $border-radius-sm;
      transition: transform $transition-fast;
      
      &:hover {
        transform: translateY(-2px);
      }
    }

    .stat-label {
      font-size: 13px;
      color: $text-secondary;
    }

    .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: #230046; // Adjusted to match original design intent
    }
  `]
})
export class AgeGroupsComponent implements AfterViewInit, OnInit {
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart: any;
  ageGroups = {
    "18-25": 0,
    "26-35": 0,
    "36-45": 0,
    "46-55": 0,
    "56+": 0
  };

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadUserAges();
  }

  ngAfterViewInit(): void {
    this.createChart();
  }

  getTotalEmployees(): number {
    return Object.values(this.ageGroups).reduce((a, b) => a + b, 0);
  }

  calculateAverageAge(): number {
    const midpoints = {
      "18-25": 21.5,
      "26-35": 30.5,
      "36-45": 40.5,
      "46-55": 50.5,
      "56+": 60
    };
    
    let total = 0;
    let count = 0;
    
    Object.entries(this.ageGroups).forEach(([group, value]) => {
      total += midpoints[group as keyof typeof midpoints] * value;
      count += value;
    });
    
    return count > 0 ? Math.round(total / count) : 0;
  }

  getMajorityAgeGroup(): string {
    const entries = Object.entries(this.ageGroups);
    const maxEntry = entries.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    return maxEntry[0];
  }

  loadUserAges() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        Object.keys(this.ageGroups).forEach(key => {
          this.ageGroups[key as keyof typeof this.ageGroups] = 0;
        });

        users.forEach(user => {
          const age = user.age;
          if (age <= 25) {
            this.ageGroups["18-25"]++;
          } else if (age <= 35) {
            this.ageGroups["26-35"]++;
          } else if (age <= 45) {
            this.ageGroups["36-45"]++;
          } else if (age <= 55) {
            this.ageGroups["46-55"]++;
          } else {
            this.ageGroups["56+"]++;
          }
        });

        if (this.chart) {
          this.chart.data.datasets[0].data = Object.values(this.ageGroups);
          this.chart.update();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des âges:', error);
      }
    });
  }

  createChart(): void {
    Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

    const ctx = this.chartCanvas.nativeElement.getContext("2d");
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(this.ageGroups),
        datasets: [
          {
            data: Object.values(this.ageGroups),
            backgroundColor: [
              "#230046", // Primary
              "#FF6B00", // Accent
              "#ff00ea", // Secondary Accent
              "#E91E63", // Pink
              "#FFC107", // Amber
            ],
            borderWidth: 0,
            borderRadius: 8,
            barPercentage: 0.7,
            categoryPercentage: 0.8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: '#230046',
            titleFont: {
              size: 13,
              family: "'Roboto', sans-serif",
              weight: 600
            },
            bodyFont: {
              size: 12,
              family: "'Roboto', sans-serif"
            },
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => `${context.raw} employés`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: true,
              color: '#f5f5f5',
            },
            ticks: {
              stepSize: 5,
              font: {
                size: 12,
                family: "'Roboto', sans-serif"
              },
              color: '#666'
            },
          },
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
                family: "'Roboto', sans-serif"
              },
              color: '#666'
            }
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      },
    });
  }
}