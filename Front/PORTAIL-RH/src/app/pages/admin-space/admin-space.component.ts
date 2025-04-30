import { Component } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FeedComponent } from '../../shared/components/feed/feed.component';
import { SidebarAdminComponent } from './component/sidebar-admin/sidebar-admin.component';
import {CardSliderComponent} from '../../shared/components/card-slider/card-slider.component';
import {RightSidebarComponent } from '../../shared/components/right-sidebar/right-sidebar.component';
import {HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-admin-space',
  standalone: true,
 imports: [HeaderComponent,SidebarAdminComponent,
        RightSidebarComponent,
        CardSliderComponent,
        FeedComponent],  templateUrl: './admin-space.component.html',
  styleUrl: './admin-space.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class AdminSpaceComponent {

}
