import { CommonModule } from '@angular/common';
import { Component, Input, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-land-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './land-info-tab.component.html',
  styleUrl: './land-info-tab.component.css',
})
export class LandInfoTabComponent {
  @Input() landlArr!: Question[];

  sortedLandArr: Question[] = [];
  showMapPopup = false;
  showImagePopup = false;
  selectedCoordinates = '';
  selectedImageInfo = '';
  popupTitle = '';
  
  // Image gallery properties
  currentImages: ImageItem[] = [];
  currentImageIndex = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['landlArr'] && this.landlArr) {
      this.sortedLandArr = [...this.landlArr].sort(
        (a, b) => a.qIndex - b.qIndex
      );

      this.sortedLandArr.forEach((question) => {
        if (question.qIndex === 4 && !question.ansType) {
          question.ansType = 'map';
        } else if (question.qIndex === 5 && !question.ansType) {
          question.ansType = 'image';
        }
      });
    }
  }

  formatIndex(index: number): string {
    return index < 10 ? `0${index}` : `${index}`;
  }

  openMapPopup(coordinates: string): void {
    this.selectedCoordinates = coordinates;
    this.popupTitle = 'Location Map';
    this.showMapPopup = true;
  }

  openImagePopup(imageInfo: string): void {
    this.selectedImageInfo = imageInfo;
    
    // Parse image data - assuming imageInfo contains image URLs or data
    // In real implementation, you would parse actual image data
    this.currentImages = this.parseImageData(imageInfo);
    this.currentImageIndex = 0;
    
    this.showImagePopup = true;
  }

  // Helper methods for image gallery
  parseImageData(imageInfo: string): ImageItem[] {
    // This is a sample implementation
    // In reality, you would parse actual image data from your backend
    if (!imageInfo) return [];

    // If imageInfo contains multiple URLs or data, parse them here
    // For demo purposes, creating sample images
    return [
      {
        url: 'https://via.placeholder.com/800x600/4CAF50/FFFFFF?text=Land+Photo+1',
        thumbnail: 'https://via.placeholder.com/150/4CAF50/FFFFFF?text=1',
        title: 'Land Overview',
        description: 'Main view of the property',
        uploadDate: '2024-01-15',
        size: '2.5 MB'
      },
      {
        url: 'https://via.placeholder.com/800x600/2196F3/FFFFFF?text=Land+Photo+2',
        thumbnail: 'https://via.placeholder.com/150/2196F3/FFFFFF?text=2',
        title: 'Boundary Marker',
        description: 'Showing the northeast boundary',
        uploadDate: '2024-01-15',
        size: '1.8 MB'
      },
      {
        url: 'https://via.placeholder.com/800x600/FF9800/FFFFFF?text=Land+Photo+3',
        thumbnail: 'https://via.placeholder.com/150/FF9800/FFFFFF?text=3',
        title: 'Soil Sample Area',
        description: 'Location where soil samples were taken',
        uploadDate: '2024-01-14',
        size: '3.1 MB'
      }
    ];
  }

  getImagesCount(): number {
    return this.currentImages.length;
  }

  getCurrentImage(): ImageItem {
    return this.currentImages[this.currentImageIndex] || {};
  }

  nextImage(): void {
    if (this.currentImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImages.length;
    }
  }

  previousImage(): void {
    if (this.currentImages.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.currentImages.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  selectImage(index: number): void {
    if (index >= 0 && index < this.currentImages.length) {
      this.currentImageIndex = index;
    }
  }

  getPlaceholderImage(): string {
    return 'https://via.placeholder.com/800x600/9E9E9E/FFFFFF?text=No+Image+Available';
  }

  getPlaceholderThumbnail(): string {
    return 'https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Thumbnail';
  }

  downloadImage(): void {
    const image = this.getCurrentImage();
    // Implement download logic here
    console.log('Downloading:', image.title);
    // In real implementation, trigger file download
  }

  shareImage(): void {
    const image = this.getCurrentImage();
    // Implement share logic here
    console.log('Sharing:', image.title);
    // In real implementation, use Web Share API or custom share dialog
  }

  closePopup(): void {
    this.showMapPopup = false;
    this.showImagePopup = false;
    this.selectedCoordinates = '';
    this.selectedImageInfo = '';
    this.popupTitle = '';
    this.currentImages = [];
    this.currentImageIndex = 0;
  }
}

interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
}

interface ImageItem {
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  uploadDate?: string;
  size?: string;
}