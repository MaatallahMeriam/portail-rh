import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-image-viewer',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="image-modal" @modalAnimation (click)="onBackdropClick($event)">
      <div class="modal-content" [class.zoomed]="isZoomed">
        <button class="close-button" (click)="onClose($event)">
          <mat-icon>close</mat-icon>
        </button>
        
        <div class="image-controls">
          <button class="control-button" (click)="toggleZoom($event)">
            <mat-icon>{{ isZoomed ? 'zoom_out' : 'zoom_in' }}</mat-icon>
          </button>
        </div>
        
        <img 
          [src]="imageUrl" 
          alt="Image en plein écran" 
          class="modal-image"
          (click)="onImageClick($event)" />
      </div>
    </div>
  `,
  styles: [`
    .image-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.85);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(3px);
    }
    
    .modal-content {
      position: relative;
      max-width: 90%;
      max-height: 90%;
      border-radius: 4px;
      overflow: hidden;
      transition: all 0.3s ease;
      
      &.zoomed {
        max-width: none;
        max-height: none;
        transform: scale(1.5);
        cursor: zoom-out;
        overflow: auto;
      }
    }
    
    .modal-image {
      display: block;
      max-width: 100%;
      max-height: 90vh;
      object-fit: contain;
      cursor: zoom-in;
      
      .zoomed & {
        cursor: zoom-out;
      }
    }
    
    .close-button {
      position: absolute;
      top: -12px;
      right: 16px;
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      z-index: 10;
      transition: background-color 0.2s ease, transform 0.2s ease;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.9);
        transform: scale(1.1);
      }
      
      mat-icon {
        font-size: 24px;
      }
    }
    
    .image-controls {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
    }
    
    .control-button {
      background-color: rgba(0, 0, 0, 0.7);
      color: white;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s ease, transform 0.2s ease;
      
      &:hover {
        background-color: rgba(0, 0, 0, 0.9);
        transform: scale(1.1);
      }
      
      mat-icon {
        font-size: 24px;
      }
    }
    
    @media screen and (max-width: 768px) {
      .modal-content {
        max-width: 95%;
        
        &.zoomed {
          transform: scale(1.2);
        }
      }
      
      .close-button, 
      .control-button {
        width: 36px;
        height: 36px;
        
        mat-icon {
          font-size: 20px;
        }
      }
    }
  `],
  animations: [
    trigger('modalAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class ImageViewerComponent {
  @Input() imageUrl: string = '';
  @Output() close = new EventEmitter<void>();
  
  isZoomed: boolean = false;
  
  @HostListener('document:keydown.escape')
  onEscapePress(): void {
    this.close.emit();
  }
  
  onClose(event: MouseEvent): void {
    event.stopPropagation();
    this.close.emit();
  }
  
  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
  
  onImageClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggleZoom(event);
  }
  
  toggleZoom(event: MouseEvent): void {
    event.stopPropagation();
    this.isZoomed = !this.isZoomed;
  }
}