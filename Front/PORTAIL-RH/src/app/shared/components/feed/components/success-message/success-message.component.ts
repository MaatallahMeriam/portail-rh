import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-success-message',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './success-message.component.html',
  styleUrls: ['./success-message.component.scss']
})
export class SuccessMessageComponent implements OnInit {
  @Input() message: string | null = null;
  showMessage: boolean = false;
  
  ngOnInit(): void {
    if (this.message) {
      this.showMessage = true;
      setTimeout(() => {
        this.showMessage = false;
      }, 3000);
    }
  }
}