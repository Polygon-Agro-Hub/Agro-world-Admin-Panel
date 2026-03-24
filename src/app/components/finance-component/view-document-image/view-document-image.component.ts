import { Component, Input, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-document-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-document-image.component.html',
  styleUrl: './view-document-image.component.css',
})
export class ViewDocumentImageComponent {
  @Input() frontTitle: string = '';
  @Input() backTitle: string = '';
  @Input() frontImageUrl: string = '';
  @Input() backImageUrl: string = '';

  // Zoom and modal properties
  frontZoomLevel: number = 1;
  backZoomLevel: number = 1;
  isModalOpen: boolean = false;
  modalImageUrl: string = '';
  modalTitle: string = '';
  modalZoomLevel: number = 1;

  constructor(private elementRef: ElementRef) {}

  onImageError(event: Event, type: string): void {
    console.error(
      `Failed to load ${type} image:`,
      type === 'front' ? this.frontImageUrl : this.backImageUrl,
    );
    const target = event.target as HTMLImageElement;
    target.src = 'assets/placeholder-image.png';
  }

  // Zoom functions for inline images
  zoomIn(type: 'front' | 'back'): void {
    if (type === 'front') {
      this.frontZoomLevel = Math.min(this.frontZoomLevel + 0.2, 3);
    } else {
      this.backZoomLevel = Math.min(this.backZoomLevel + 0.2, 3);
    }
  }

  zoomOut(type: 'front' | 'back'): void {
    if (type === 'front') {
      this.frontZoomLevel = Math.max(this.frontZoomLevel - 0.2, 0.5);
    } else {
      this.backZoomLevel = Math.max(this.backZoomLevel - 0.2, 0.5);
    }
  }

  // Open image in modal
  openModal(imageUrl: string, title: string): void {
    this.modalImageUrl = imageUrl;
    this.modalTitle = title;
    this.isModalOpen = true;
    this.modalZoomLevel = 1;

    // Scroll to the component so the modal is visible
    setTimeout(() => {
      const element = this.elementRef.nativeElement;

      const yOffset = 50; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }, 100);
  }

  // Close modal
  closeModal(): void {
    this.isModalOpen = false;
    this.modalImageUrl = '';
    this.modalTitle = '';
    this.modalZoomLevel = 1;

    // Scroll to the top of the page
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Modal zoom functions
  modalZoomIn(): void {
    this.modalZoomLevel = Math.min(this.modalZoomLevel + 0.3, 5);
  }

  modalZoomOut(): void {
    this.modalZoomLevel = Math.max(this.modalZoomLevel - 0.3, 0.5);
  }

  resetModalZoom(): void {
    this.modalZoomLevel = 1;
  }
}
