import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="avatar-container" [class.large]="size === 'large'">
      <img [src]="photoUrl || defaultImage" 
          [alt]="altText" 
          class="avatar-image"
          (error)="onImageError($event)">
    </div>
  `,
  styles: [`
    .avatar-container {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      border: 2px solid #fff;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      
      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      }
      
      &.large {
        width: 56px;
        height: 56px;
      }
    }
    
    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `]
})
export class UserAvatarComponent implements OnInit {
  @Input() photoUrl: string | null = null;
  @Input() altText: string = 'User';
  @Input() size: 'normal' | 'large' = 'normal';
  
  defaultImage: string = 'assets/icons/user-login-icon-14.png';
  
  ngOnInit(): void {
    // If URL is null or not valid, use default
    if (!this.photoUrl) {
      this.photoUrl = this.defaultImage;
    }
  }
  
  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = this.defaultImage;
  }
}