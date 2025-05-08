import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule
  ],
  templateUrl: './image-modal.component.html',
  styleUrls: ['./image-modal.component.scss']
})
export class ImageModalComponent {
  @Input() imageUrl!: string;
  @Output() close = new EventEmitter<void>();
  
  isLoading: boolean = true;
  isZoomed: boolean = false;
  
  @HostListener('document:keydown.escape', ['$event'])
  handleEscapeKey(event: KeyboardEvent): void {
    this.closeModal();
  }
  
  closeModal(): void {
    this.close.emit();
  }
  
  onImageLoad(): void {
    this.isLoading = false;
  }
  
  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
  }
  
  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}