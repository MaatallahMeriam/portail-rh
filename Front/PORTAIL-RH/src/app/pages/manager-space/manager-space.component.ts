import { Component } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FeedComponent } from '../../shared/components/feed/feed.component';
import { SideBarManagerComponent } from './components/side-bar-manager/side-bar-manager.component';
import {HeaderComponent } from '../../shared/components/header/header.component';
import { RightSideManagerComponent } from './components/right-side-manager/right-side-manager.component';
@Component({
  selector: 'app-manager-space',
  standalone: true,
imports: [HeaderComponent, SideBarManagerComponent,
  RightSideManagerComponent,
        FeedComponent], 
  templateUrl: './manager-space.component.html',
        
  styleUrl: './manager-space.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class ManagerSpaceComponent {
  isSidebarCollapsed = false;

  onSidebarStateChange(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

}
