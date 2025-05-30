import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar-collab/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FeedComponent } from '../../shared/components/feed/feed.component';
import { RightSidebarComponent } from '../../shared/components/right-sidebar/right-sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-collab-space',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    RightSidebarComponent,
    FeedComponent
  ],
  templateUrl: './collab-space.component.html',
  styleUrl: './collab-space.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CollabSpaceComponent {
  isSidebarCollapsed = false; 

  onSidebarStateChange(isCollapsed: boolean) {
    this.isSidebarCollapsed = isCollapsed;
  }
}