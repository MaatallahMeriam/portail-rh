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
        <h3>Tranches d'âges des employés</h3>
      </div>
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `,
  styles: [
    `
    .widget-container {
      background-color: #f5f5f5;
      border-radius: 15px;
      padding: 15px;
      height: 100%;
    }
    
    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .widget-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: bold;
      color: #E5007F;
    }
    
    .chart-container {
      position: relative;
      height: 200px;
      width: 100%;
    }
  `,
  ],
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

  loadUserAges() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        // Réinitialiser les compteurs
        Object.keys(this.ageGroups).forEach(key => {
          this.ageGroups[key as keyof typeof this.ageGroups] = 0;
        });

        // Compter les utilisateurs par tranche d'âge
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

        // Mettre à jour le graphique
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
              "#A095E5", // Light purple
              "#333333", // Black
              "#4527A0", // Deep purple
              "#E91E63", // Pink
              "#FFC107", // Amber
            ],
            borderWidth: 0,
            borderRadius: 5,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
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
            callbacks: {
              label: (context) => `${context.raw} employés`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false,
            },
            ticks: {
              stepSize: 5,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    });
  }
}