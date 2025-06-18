import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserService, BirthdayUser } from "../../../../../../services/users.service";
import { MatIconModule } from "@angular/material/icon";
import Swal from 'sweetalert2';

@Component({
  selector: "app-birthday",
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="widget-container">
      <div class="widget-header">
        <h3>Anniversaires</h3>
      </div>
      <div class="widget-content">
        @if (todaysBirthday) {
          <div class="featured-user" [class.animate]="animateFeatured">
            <div class="user-avatar-wrapper">
              <div class="celebration-badge">
                <mat-icon>cake</mat-icon>
              </div>
              <img [src]="todaysBirthday.avatar" [alt]="'Photo de ' + todaysBirthday.fullName" class="featured-avatar">
            </div>
            <div class="featured-info">
              <div class="user-name">{{ todaysBirthday.fullName }}</div>
              <div class="birthday-today">Anniversaire aujourd'hui</div>
              <button class="birthday-button" (click)="wishHappyBirthday(todaysBirthday.id)">
                <mat-icon>celebration</mat-icon>
                <span>Souhaitez un joyeux anniversaire</span>
              </button>
            </div>
          </div>
        }
        @if (upcomingBirthdays.length > 0) {
          <div class="section-title">Prochains anniversaires</div>
          <div class="upcoming-birthdays">
            @for (user of upcomingBirthdays; track user.id) {
              <div class="upcoming-user" [class.animate]="animateUpcoming">
                <img [src]="user.avatar" [alt]="'Photo de ' + user.fullName" class="upcoming-avatar">
                <div class="upcoming-info">
                  <div class="user-name">{{ user.fullName }}</div>
                  <div class="user-birthday">
                    <span class="days-badge">Anniversaire dans {{ user.daysUntilBirthday }} jours</span>
                  </div>
                </div>
              </div>
            }
          </div>
        }
        @if (!todaysBirthday && upcomingBirthdays.length === 0) {
          <div class="no-birthdays">
            <mat-icon>event_busy</mat-icon>
            <p>Aucun anniversaire à venir pour le moment.</p>
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
      gap: $spacing-md;
    }
    
    .featured-user {
      display: flex;
      padding: $spacing-md;
      background: linear-gradient(135deg, rgba(229, 0, 127, 0.05) 0%, rgba(63, 42, 130, 0.05) 100%);
      border-radius: $border-radius-sm;
      gap: $spacing-md;
      
      &.animate {
        animation: slideInUp 0.5s ease;
      }
    }
    
    .user-avatar-wrapper {
      position: relative;
    }
    
    .celebration-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background-color: $accent;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: $shadow-sm;
      animation: pulse 1.5s infinite;
      
      mat-icon {
        color: white;
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
    }
    
    .featured avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      border: 3px solid $accent;
      box-shadow: $shadow-md;
    }
    
    .featured-info {
      display: flex;
      flex-direction: column;
      gap: $spacing-sm;
      flex: 1;
    }
    
    .user-name {
      font-weight: 600;
      font-size: 16px;
      color: $text-primary;
    }
    
    .birthday-today {
      font-size: 14px;
      color: $secondary;
      font-weight: 500;
    }
    
    .birthday-button {
      @include button($secondary);
      margin-top: $spacing-sm;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: $spacing-xs;
      width: fit-content;
      
      mat-icon {
        font-size: 16px;
        height: 16px;
        width: 16px;
      }
    }
    
    .section-title {
      margin-top: 4px;
      font-size: 14px;
      font-weight: 600;
      color: $text-secondary;
      padding-bottom: $spacing-sm;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .upcoming-birthdays {
      display: flex;
      flex-direction: column;
      gap: $spacing-md;
      margin-top: $spacing-sm;
    }
    
    .upcoming-user {
      display: flex;
      align-items: center;
      gap: $spacing-md;
      padding: $spacing-sm;
      border-radius: $border-radius-sm;
      transition: background-color $transition-fast;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
      
      &.animate {
        animation: slideInUp 0.5s ease;
      }
    }
    
    .upcoming-avatar {
      @include avatar(50px);
      border: 2px solid rgba(245, 175, 6, 0.7);
    }
    
    .upcoming-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .days-badge {
      @include badge($primary);
      font-size: 11px;
    }
    
    .no-birthdays {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: $spacing-sm;
      color: $text-light;
      padding: $spacing-xl 0;
      
      mat-icon {
        font-size: 36px;
        height: 36px;
        width: 36px;
        opacity: 0.6;
      }
      
      p {
        margin: 0;
      }
    }
  `],
})
export class BirthdayComponent implements OnInit {
  todaysBirthday: BirthdayUser | null = null;
  upcomingBirthdays: BirthdayUser[] = [];
  animateFeatured = false;
  animateUpcoming = false;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadBirthdays();
    // Add animation after a brief delay for better UI experience
    setTimeout(() => {
      this.animateFeatured = true;
      setTimeout(() => {
        this.animateUpcoming = true;
      }, 300);
    }, 300);
  }

  loadBirthdays() {
    this.userService.getBirthdays().subscribe(users => {
      this.todaysBirthday = users.find(user => user.isTodayBirthday) || null;
      this.upcomingBirthdays = users.filter(user => !user.isTodayBirthday).slice(0, 3);
    });
  }
  
  wishHappyBirthday(userId: number) {
    this.userService.wishHappyBirthday(userId).subscribe(() => {
      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Votre message d\'anniversaire a été envoyé !',
        timer: 2000,
        showConfirmButton: false
      });
    });
  }
}