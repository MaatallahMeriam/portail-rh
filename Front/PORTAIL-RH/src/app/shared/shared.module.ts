import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedSpaceComponent } from './shared.component';
import { SidebarComponent } from '../pages/collab-space/components/sidebar-collab/sidebar.component';
import { RightSidebarComponent } from './components/right-sidebar/right-sidebar.component';
import {CUSTOM_ELEMENTS_SCHEMA,Input, AfterViewInit  } from '@angular/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FeedComponent } from './components/feed/feed.component';
import { FormsModule } from '@angular/forms'; 

@NgModule({
  declarations: [],
  imports: [CommonModule,CarouselModule,
   
  ],
  exports: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class sharedSpaceModule {}
