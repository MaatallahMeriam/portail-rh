import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
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
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Top évaluations</h3>
      </div>
      <div class="widget-content">
        @if (topUsers.length > 0) {
          <div class="users-list">
            @for (user of topUsers; track user.id; let i = $index) {
              <div class="user-card" [class.animate]="animate" [style.animation-delay]="i * 0.15 + 's'">
                <div class="user-position">{{ i + 1 }}</div>
                <img [src]="user.avatar" [alt]="'Photo de ' + user.fullName" class="user-avatar">
                <div class="user-info">
                  <div class="user-name">{{ user.fullName }}</div>
                  <div class="user-rating">
                    <div class="stars">
                      @for (star of getStars(user.averageRate); track $index) {
                        <mat-icon class="star-icon" [class.filled]="star.filled" [class.half]="star.half">
                          {{ star.half ? 'star_half' : (star.filled ? 'star' : 'star_border') }}
                        </mat-icon>
                      }
                    </div>
                    <div class="rating-value">{{ user.averageRate.toFixed(1) }}/5</div>
                  </div>
                </div>
              </div>
            }
          </div>
        } @else {
          <div class="no-data">
            <mat-icon>assessment</mat-icon>
            <p>Aucune donnée disponible pour le moment.</p>
          </div>
        }
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
    }
    
    .users-list {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      width: 100%;
    }
    
    .user-card {
      display: flex;
      align-items: center;
      padding: $spacing-md;
      background-color: white;
      border-radius: $border-radius-sm;
      box-shadow: $shadow-sm;
      position: relative;
      transition: all $transition-normal;
      
      &.animate {
        animation: slideInUp 0.5s ease both;
      }
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: $shadow-md;
      }
    }
    
    .user-position {
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      font-size: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        border-style: solid;
        border-width: 30px 30px 0 0;
        border-color: $primary transparent transparent transparent;
        z-index: -1;
      }
    }
    
    .user-avatar {
      @include avatar(50px);
      margin-right: $spacing-md;
      border: 2px solid $accent;
    }
    
    .user-info {
      flex: 1;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: $spacing-xs;
      color: $text-primary;
    }
    
    .user-rating {
      display: flex;
      align-items: center;
      gap: $spacing-md;
    }
    
    .stars {
      display: flex;
      align-items: center;
    }
    
    .star-icon {
      color: #bdbdbd;
      font-size: 16px;
      height: 16px;
      width: 16px;
      
      &.filled {
        color: $accent;
      }
      
      &.half {
        color: $accent;
      }
    }
    
    .rating-value {
      font-weight: 600;
      color: $primary;
      font-size: 14px;
    }
    
    .no-data {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: $spacing-xl 0;
      gap: $spacing-md;
      color: $text-light;
      
      mat-icon {
        font-size: 36px;
        height: 36px;
        width: 36px;
        opacity: 0.6;
      }
      
      p {
        margin: 0;
        text-align: center;
      }
    }
  `]
})
export class TopUsersWithReviewsComponent implements OnInit {
  topUsers: TopUser[] = [];
  animate = false;

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.loadTopUsers();
    
    // Add animation after a brief delay
    setTimeout(() => {
      this.animate = true;
    }, 300);
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
        this.topUsers = []; // Clear data on error to show "No data available"
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
  
  // Convert rating to star display objects
  getStars(rating: number): { filled: boolean, half: boolean }[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push({ filled: true, half: false });
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push({ filled: false, half: true });
      } else {
        stars.push({ filled: false, half: false });
      }
    }
    
    return stars;
  }
}