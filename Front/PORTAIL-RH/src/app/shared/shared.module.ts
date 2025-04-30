import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedSpaceComponent } from './shared.component';
import { SidebarComponent } from '../pages/collab-space/components/sidebar-collab/sidebar.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import {CUSTOM_ELEMENTS_SCHEMA,Input, AfterViewInit  } from '@angular/core';
import {CardSliderComponent} from './components/card-slider/card-slider.component'
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FeedComponent } from './components/feed/feed.component';
import { FormsModule } from '@angular/forms'; 

@NgModule({
  declarations: [],
  imports: [CommonModule,CarouselModule,
   
    SharedSpaceComponent,
    SidebarComponent,
    RightSidebarComponent ,
    CardSliderComponent,
    FeedComponent,
    FormsModule
  ],
  exports: [SharedSpaceComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class sharedSpaceModule {}
