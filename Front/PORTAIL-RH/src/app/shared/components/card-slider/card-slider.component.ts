import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'ngx-owl-carousel-o';

@Component({
  selector: 'app-card-slider',
  standalone: true,
  templateUrl: './card-slider.component.html',
  styleUrls: ['./card-slider.component.scss'],
  imports: [CommonModule, CarouselModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CardSliderComponent {
  images = [
    'assets/images/news1.png',
    'assets/images/news1.png',
    'assets/images/news3.png',
  ];

  
  imageDetails = [
    { title: 'NEWS 1', description: 'Description 1' },
    { title: 'NEWS 2', description: 'Description 2' },
    { title: 'NEWS 3', description: 'Description 3' },
  ];

  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 3000,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    stagePadding: 20, 
    margin: 15, 
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 }
    },
    nav: true
  };
}
