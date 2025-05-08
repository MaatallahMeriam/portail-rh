import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PublicationService, PublicationDTO } from "../../../../../../services/publication.service";

interface TopUser {
  id: number;
  fullName: string;
  avatar: string;
  averageRate: number;
}

@Component({
  selector: "app-top-users-with-reviews",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Top 3 utilisateurs avec les meilleures évaluations</h3>
      </div>
      <div class="top-users-content">
        @if (topUsers.length > 0) {
          <div class="top-users-list">
            @for (user of topUsers; track user.id) {
              <div class="top-user">
                <img [src]="user.avatar" [alt]="'Photo de ' + user.fullName" class="user-avatar">
                <div class="user-info">
                  <div class="user-name">{{ user.fullName }}</div>
                  <div class="user-rate">Note moyenne : {{ user.averageRate }}/5</div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="no-users">
            Aucune donnée disponible pour le moment.
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
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

    .menu-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }

    .top-users-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .top-users-list {
      margin-top : 30px;
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .top-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid #F5AF06;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      display: flex;
      flex-direction: column;
      font-size: 12px;
    }

    .user-name {
      font-weight: 600;
    }

    .user-rate {
      color: #666;
    }

    .no-users {
      text-align: center;
      color: #666;
      font-size: 14px;
    }
  `]
})
export class TopUsersWithReviewsComponent implements OnInit {
  topUsers: TopUser[] = [];

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.loadTopUsers();
  }

  private loadTopUsers(): void {
    this.publicationService.getAllPublications().subscribe({
      next: (publications: PublicationDTO[]) => {
        // Filter publications with valid averageRate
        const ratedPublications = publications.filter(pub => pub.averageRate !== null && pub.averageRate !== undefined);

        if (ratedPublications.length === 0) {
          this.topUsers = [];
          return;
        }

        // Group by userId and calculate average rate
        const userRatings = ratedPublications.reduce((acc, pub) => {
          if (!acc[pub.userId]) {
            acc[pub.userId] = { count: 0, totalRate: 0 };
          }
          acc[pub.userId].count += 1;
          acc[pub.userId].totalRate += pub.averageRate as number; // Assert as number since we filtered null/undefined
          return acc;
        }, {} as { [key: number]: { count: number; totalRate: number } });

        // Calculate average rate per user
        const usersWithAvgRate = Object.keys(userRatings).map(userId => {
          const avgRate = userRatings[Number(userId)].totalRate / userRatings[Number(userId)].count;
          const firstPub = ratedPublications.find(p => p.userId === Number(userId));
          return {
            id: Number(userId),
            fullName: `${firstPub?.userPrenom || 'Unknown'} ${firstPub?.userNom || 'User'}`,
            avatar: this.getImageUrl(firstPub?.userPhoto),
            averageRate: Number(avgRate.toFixed(1)) // Round to 1 decimal place
          };
        });

        // Sort by averageRate in descending order and take top 3
        this.topUsers = usersWithAvgRate
          .sort((a, b) => b.averageRate - a.averageRate)
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Error loading publications:', err);
        this.topUsers = []; // Clear data on error to show "Aucune donnée disponible"
      }
    });
  }

  // Transform the userPhoto path into a fully qualified URL
  private getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return 'assets/icons/user-login-icon-14.png'; // Default image if userPhoto is null or undefined
    }

    if (imagePath.startsWith('http://localhost:8080/')) {
      return imagePath; // Already a full URL, no need to modify
    }

    // Prepend the backend base URL and normalize the path
    return `http://localhost:8080/${imagePath.replace(/\\/g, '/')}`;
  }
}