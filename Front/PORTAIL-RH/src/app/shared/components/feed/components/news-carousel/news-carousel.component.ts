import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule, OwlOptions } from 'ngx-owl-carousel-o';
import { NewsDTO } from '../../../../../services/news.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-news-carousel',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    MatIconModule
  ],
  templateUrl: './news-carousel.component.html',
  styleUrls: ['./news-carousel.component.scss']
})
export class NewsCarouselComponent implements OnInit {
  @Input() news: NewsDTO[] = [];
  
  customOptions: OwlOptions = {
    loop: true,
    autoplay: true,
    autoplayTimeout: 5000,
    autoplayHoverPause: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: true,
    dots: true,
    navSpeed: 700,
    navText: ['<', '>'],
    responsive: {
      0: { items: 1 },
      600: { items: 2 },
      900: { items: 3 }
    },
    nav: true,
    margin: 20
  };

  expandedNews: { [key: number]: boolean } = {};

  constructor() { }

  ngOnInit(): void {
    // Log the news items to debug image URLs
    console.log('News items:', this.news);
  }

  getImageUrl(imagePath: string | undefined): string {
    const defaultImage = 'assets/images/news-placeholder.jpg';

    if (!imagePath) {
      console.warn('Image path is undefined or null');
      return defaultImage;
    }

    // If the imagePath is already a full URL, use it directly
    if (imagePath.startsWith('http://localhost:8080/')) {
      return imagePath;
    }

    // Construct the full URL assuming the path is relative
    const fullUrl = `http://localhost:8080/Uploads/news/${imagePath.replace(/\\/g, '/')}`;
    console.log('Constructed image URL:', fullUrl);

    // Test if the image can be loaded
    const img = new Image();
    img.onload = () => {
      console.log('Image loaded successfully:', fullUrl);
    };
    img.onerror = () => {
      console.error('Failed to load image:', fullUrl);
    };
    img.src = fullUrl;

    return fullUrl;
  }

  toggleDescription(newsId: number): void {
    this.expandedNews[newsId] = !this.expandedNews[newsId];
  }
}