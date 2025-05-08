import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PublicationService, PublicationDTO } from "../../../../../../services/publication.service";

interface ProductiveUser {
  id: number;
  fullName: string;
  avatar: string;
  postCount: number;
  rank: number;
}

@Component({
  selector: "app-productivity",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Top Productivité</h3>
      </div>
      <div class="productivity-content">
        @for (user of productiveUsers; track user.id) {
          <div class="user-card" [class]="'rank-' + user.rank">
            <div class="rank-badge">{{ user.rank }}</div>
            <img [src]="user.avatar" [alt]="user.fullName" class="user-avatar">
            <div class="user-info">
              <div class="user-name">{{ user.fullName }}</div>
              <div class="post-count">{{ user.postCount }} publications</div>
            </div>
            <div class="trophy" *ngIf="user.rank === 1">🏆</div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .widget-container {
      background-color: #f5f5f5;
      border-radius: 15px;
      padding: 20px;
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
      }
    }

    .widget-header {
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: bold;
        color: #E91E63;
        position: relative;
        padding-bottom: 8px;
      }
    }

    .productivity-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .user-card {
      display: flex;
      align-items: center;
      padding: 15px;
      background: white;
      border-radius: 12px;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;

      &:hover {
        transform: scale(1.02);
      }

      &.rank-1 {
        background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%);
        .user-name, .post-count { color: #000; }
      }

      &.rank-2 {
        background: linear-gradient(135deg, #E0E0E0 0%, #BDBDBD 100%);
      }

      &.rank-3 {
        background: linear-gradient(135deg, #CD7F32 0%, #A0522D 100%);
        .user-name, .post-count { color: white; }
      }
    }

    .rank-badge {
      position: absolute;
      top: -2px;
      left: -2px;
      width: 25px;
      height: 25px;
      background: #E91E63;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .user-avatar {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .user-info {
      margin-left: 15px;
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
    }

    .post-count {
      font-size: 12px;
      color: #666;
    }

    .trophy {
      font-size: 24px;
      margin-left: 10px;
      animation: bounce 1s ease infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-5px); }
    }
  `]
})
export class ProductivityComponent implements OnInit {
  productiveUsers: ProductiveUser[] = [];

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.loadProductiveUsers();
  }

  private loadProductiveUsers(): void {
    this.publicationService.getAllPublications().subscribe({
      next: (publications: PublicationDTO[]) => {
        // Group publications by userId and count them
        const userPublicationCounts = publications.reduce((acc, pub) => {
          acc[pub.userId] = (acc[pub.userId] || 0) + 1;
          return acc;
        }, {} as { [key: number]: number });

        // Convert to array of users with counts
        const usersWithCounts = Object.keys(userPublicationCounts).map(userId => ({
          id: Number(userId),
          fullName: `${publications.find(p => p.userId === Number(userId))?.userPrenom || 'Unknown'} ${publications.find(p => p.userId === Number(userId))?.userNom || 'User'}`,
          avatar: this.getImageUrl(publications.find(p => p.userId === Number(userId))?.userPhoto), // Transform the userPhoto URL
          postCount: userPublicationCounts[Number(userId)],
          rank: 0 // Will be assigned later
        }));

        // Sort by postCount in descending order and take top 3
        const topUsers = usersWithCounts
          .sort((a, b) => b.postCount - a.postCount)
          .slice(0, 3);

        // Assign ranks
        topUsers.forEach((user, index) => {
          user.rank = index + 1;
        });

        this.productiveUsers = topUsers;
      },
      error: (err) => {
        console.error('Error loading publications:', err);
        // Fallback to static data if API fails
        this.productiveUsers = [
          { id: 1, fullName: "Sarah Connor", avatar: "assets/avatars/sarah.jpg", postCount: 156, rank: 1 },
          { id: 2, fullName: "John Smith", avatar: "assets/avatars/john.jpg", postCount: 143, rank: 2 },
          { id: 3, fullName: "Emma Davis", avatar: "assets/avatars/emma.jpg", postCount: 128, rank: 3 }
        ];
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