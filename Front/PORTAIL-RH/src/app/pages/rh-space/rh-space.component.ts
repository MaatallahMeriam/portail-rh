import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar-RH/sidebar.component';
import { CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FeedComponent } from '../../shared/components/feed/feed.component';

import {CardSliderComponent} from '../../shared/components/card-slider/card-slider.component';
import {RightSidebarComponent } from '../../shared/components/right-sidebar/right-sidebar.component';
import {HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-rh-space',
  standalone: true,
  imports: [HeaderComponent,SidebarComponent,
        RightSidebarComponent,
        CardSliderComponent,
        FeedComponent],
  templateUrl: './rh-space.component.html',
  styleUrl: './rh-space.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RhSpaceComponent {

}
