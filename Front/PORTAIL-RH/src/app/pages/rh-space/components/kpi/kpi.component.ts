import { Component, HostListener } from "@angular/core";
import { CommonModule } from "@angular/common";
import { SidebarComponent } from "../sidebar-RH/sidebar.component";
import { HeaderComponent } from "../../../../shared/components/header/header.component";
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbsenceRateComponent } from "./widgets/absence-rate/absence-rate.component";
import { OnsiteWorkComponent } from "./widgets/onsite-work/onsite-work.component";
import { BirthdayComponent } from "./widgets/birthday/birthday.component";
import { AgeGroupsComponent } from "./widgets/age-groups/age-groups.component";
import { TurnoverComponent } from "./widgets/turnover/turnover.component";
import { TopUsersWithReviewsComponent } from "./widgets/reviews/top-users-with-reviews.component";
import { ProductivityComponent } from "./widgets/productivity/productivity.component";
import { trigger, transition, style, animate, query, stagger, sequence } from '@angular/animations';

@Component({
  selector: 'app-kpi',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    AbsenceRateComponent,
    OnsiteWorkComponent,
    TopUsersWithReviewsComponent,
    BirthdayComponent,
    AgeGroupsComponent,
    TurnoverComponent,
    ProductivityComponent,
    SidebarComponent
  ],
  templateUrl: './kpi.component.html',
  styleUrls: ['./kpi.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerFadeIn', [
      transition(':enter', [
        query('.dashboard-widget', [
          style({ opacity: 0, transform: 'translateY(30px)' }),
          stagger(100, [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)',
              style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ])
      ])
    ])
  ]
})
export class KPIComponent {
  isSidebarCollapsed = false;
  isHeaderVisible = true;
  lastScrollPosition = 0;

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    const currentScrollPos = (event.target as Element).scrollTop;
    this.isHeaderVisible = currentScrollPos < this.lastScrollPosition || currentScrollPos < 50;
    this.lastScrollPosition = currentScrollPos;
  }
}