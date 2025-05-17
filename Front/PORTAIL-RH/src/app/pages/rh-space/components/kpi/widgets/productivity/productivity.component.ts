import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { MatIconModule } from "@angular/material/icon";
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
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Top Productivité</h3>
      </div>
      <div class="widget-content">
        <div class="productivity-content">
          @for (user of productiveUsers; track user.id; let i = $index) {
            <div class="user-card" [class]="'rank-' + user.rank" [class.animate]="animate" [style.animation-delay]="i * 0.15 + 's'">
              <div class="rank-badge">{{ user.rank }}</div>
              <div class="user-avatar-wrapper">
                <img [src]="user.avatar" [alt]="user.fullName" class="user-avatar">
                @if (user.rank === 1) {
                  <div class="crown-badge">
                    <mat-icon>emoji_events</mat-icon>
                  </div>
                }
              </div>
              <div class="user-info">
                <div class="user-name">{{ user.fullName }}</div>
                <div class="post-count">
                  <span class="count-number">{{ user.postCount }}</span> publications
                </div>
              </div>
              <div class="rank-indicator" [style.height.%]="getPercentHeight(user)"></div>
            </div>
          }
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
    }
    
    .productivity-content {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      width: 100%;
    }

    .user-card {
      display: flex;
      align-items: center;
      padding: $spacing-md;
      border-radius: $border-radius-sm;
      position: relative;
      overflow: hidden;
      transition: all $transition-normal;
      background-color: white;
      box-shadow: $shadow-sm;
      
      &.animate {
        animation: slideInUp 0.5s ease both;
      }

      &:hover {
        transform: translateX(5px);
      }

      &.rank-1 {
        background-color: white;
        border: 1px solid rgba(245, 175, 6, 0.3);
      }

      &.rank-2 {
        background-color: white;
        border: 1px solid rgba(192, 192, 192, 0.3);
      }

      &.rank-3 {
        background-color: white;
        border: 1px solid rgba(205, 127, 50, 0.3);
      }
    }

    .rank-badge {
      position: absolute;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
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
      }
      
      .rank-1 & {
        &::before {
          border-color: $accent transparent transparent transparent;
        }
      }
      
      .rank-2 & {
        &::before {
          border-color: #C0C0C0 transparent transparent transparent;
        }
      }
      
      .rank-3 & {
        &::before {
          border-color: #CD7F32 transparent transparent transparent;
        }
      }
    }

    .user-avatar-wrapper {
      position: relative;
      margin-right: $spacing-md;
    }

    .user-avatar {
      @include avatar(45px);
      
      .rank-1 & {
        border: 2px solid $accent;
      }
      
      .rank-2 & {
        border: 2px solid #C0C0C0;
      }
      
      .rank-3 & {
        border: 2px solid #CD7F32;
      }
    }

    .crown-badge {
      position: absolute;
      top: -10px;
      right: -5px;
      background-color: $accent;
      border-radius: 50%;
      width: 22px;
      height: 22px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: bounce 1.5s infinite;
      box-shadow: $shadow-sm;
      
      mat-icon {
        color: white;
        font-size: 14px;
        height: 14px;
        width: 14px;
      }
    }

    .user-info {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 14px;
      margin-bottom: 2px;
      color: $text-primary;
    }

    .post-count {
      font-size: 12px;
      color: $text-secondary;
    }

    .count-number {
      font-weight: 600;
      color: $primary;
    }

    .rank-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 4px;
      background: linear-gradient(to top, $primary, $secondary);
      border-radius: 4px 4px 0 0;
    }
  `]
})
export class ProductivityComponent implements OnInit {
  productiveUsers: ProductiveUser[] = [];
  animate = false;
  maxPosts = 0;

  constructor(private publicationService: PublicationService) {}

  ngOnInit(): void {
    this.loadProductiveUsers();
    
    // Add animation after a brief delay
    setTimeout(() => {
      this.animate = true;
    }, 300);
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

        // Get max posts for visualization
        this.maxPosts = topUsers.length > 0 ? topUsers[0].postCount : 0;

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
        this.maxPosts = 156;
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
  
  // Calculate height percentage for visual bar indicator
  getPercentHeight(user: ProductiveUser): number {
    if (this.maxPosts === 0) return 0;
    return (user.postCount / this.maxPosts) * 100;
  }
}