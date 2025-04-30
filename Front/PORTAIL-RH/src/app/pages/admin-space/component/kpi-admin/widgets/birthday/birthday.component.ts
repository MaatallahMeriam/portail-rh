import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { UserService, BirthdayUser } from "../../../../../../services/users.service";

import Swal from 'sweetalert2';

@Component({
  selector: "app-birthday",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="widget-container">
  <div class="widget-header">
    <h3>Anniversaire :</h3>
    <button class="menu-button">⋮</button>
  </div>
  <div class="birthday-content">
    @if (todaysBirthday) {
      <div class="featured-user">
        <img [src]="todaysBirthday.avatar" [alt]="'Photo de ' + todaysBirthday.fullName" class="featured-avatar">
        <div class="featured-info">
          <div class="user-name">{{ todaysBirthday.fullName }}</div>
          <button class="birthday-button" (click)="wishHappyBirthday(todaysBirthday.id)">
            Souhaitez lui un joyeux anniversaire !
          </button>
        </div>
      </div>
    }
    @if (upcomingBirthdays.length > 0) {
      <div class="upcoming-birthdays">
        @for (user of upcomingBirthdays; track user.id) {
          <div class="upcoming-user">
            <img [src]="user.avatar" [alt]="'Photo de ' + user.fullName" class="upcoming-avatar">
            <div class="upcoming-info">
              <div class="user-name">{{ user.fullName }}</div>
              <div class="user-birthdate">date d'anniversaire : {{ user.birthdate }}</div>
            </div>
          </div>
        }
      </div>
    }
    @if (!todaysBirthday && upcomingBirthdays.length === 0) {
      <div class="no-birthdays">
        Aucun anniversaire à venir pour le moment.
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
      font-weight: 600;
      color: #56142F;
    }
    
    .menu-button {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
    }
    
    .birthday-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .featured-user {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .featured-avatar {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .featured-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .user-name {
      font-weight: 500;
    }
    
    .birthday-button {
      background-color: #E91E63;
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 15px;
      font-size: 12px;
      cursor: pointer;
    }
    
    .upcoming-birthdays {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .upcoming-user {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .upcoming-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      object-fit: cover;
    }
    
    .upcoming-info {
      display: flex;
      flex-direction: column;
      font-size: 12px;
    }
    
    .user-birthdate {
      color: #666;
    }

          .todays-birthdays {
        display: flex;
        flex-direction: column;
        gap: 15px;
        margin-bottom: 15px;
      }
  `],
})
export class BirthdayComponent implements OnInit {
  todaysBirthday: BirthdayUser | null = null;
  upcomingBirthdays: BirthdayUser[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.loadBirthdays();
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