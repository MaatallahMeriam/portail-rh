import { Component, ViewChild, type ElementRef, type AfterViewInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from "chart.js"

@Component({
  selector: "app-absence-rate",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
      </div>
      <div class="chart-container">
        <canvas #chartCanvas></canvas>
      </div>
      <div class="legend">
        <div class="legend-item">
          <span class="legend-color" style="background-color: #FFD700;"></span>
          <span>Employés en congés</span>
        </div>
        <div class="legend-item">
          <span class="legend-color" style="background-color: #E91E63;"></span>
          <span>Employés en travail</span>
        </div>
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
      color : #E5007F;

    }
    
    .menu-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }
    
    .chart-container {
      position: relative;
      height: 150px;
      width: 150px;
      margin: 0 auto;
    }
    
    .legend {
      margin-top: 15px;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
    }
    
    .legend-color {
      display: inline-block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      margin-right: 8px;
    }
  `,
  ],
})
export class AbsenceRateComponent implements AfterViewInit {
  @ViewChild("chartCanvas") chartCanvas!: ElementRef<HTMLCanvasElement>
  chart: any

  ngAfterViewInit(): void {
    this.createChart()
  }

  createChart(): void {
    Chart.register(DoughnutController, ArcElement, Tooltip, Legend)

    const ctx = this.chartCanvas.nativeElement.getContext("2d")
    if (!ctx) return

    this.chart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["Employés en travail", "Employés en congés"],
        datasets: [
          {
            data: [55, 45],
            backgroundColor: ["#E91E63", "#FFD700"],
            borderWidth: 0,
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
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}%`,
            },
          },
        },
      },
    })

    // Add center text
    const originalDraw = this.chart.draw
    this.chart.draw = function () {
      originalDraw.apply(this, arguments)

      if (ctx) {
        const width = this.width
        const height = this.height

        ctx.restore()
        ctx.font = "bold 24px Arial"
        ctx.textBaseline = "middle"
        ctx.textAlign = "center"

        // 55% text
        ctx.fillStyle = "#E91E63"
        ctx.fillText("55%", width / 2, height / 2 - 10)

        // 45% text
        ctx.fillStyle = "#FFD700"
        ctx.font = "bold 20px Arial"
        ctx.fillText("45%", width / 2, height / 2 + 20)

        ctx.save()
      }
    }

    this.chart.update()
  }
}

