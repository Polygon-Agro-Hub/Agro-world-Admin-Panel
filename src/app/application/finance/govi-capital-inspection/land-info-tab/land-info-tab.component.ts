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
  selectedCoordinatesObj: any = null;
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

      // Process answers for map and image types
      this.sortedLandArr.forEach((question) => {
        if (question.qIndex === 4) {
          question.ansType = 'map';
          // Format the answer for display in the button
          question.formattedAnswer = this.formatMapAnswer(question.answer);
        } else if (question.qIndex === 5) {
          question.ansType = 'image';
          // Format the answer for display in the button
          question.formattedAnswer = this.formatImageAnswer(question.answer);
        }
      });
    }
  }

  formatIndex(index: number): string {
    return index < 10 ? `0${index}` : `${index}`;
  }

  // Format map answer for display
  formatMapAnswer(answer: any): string {
    if (!answer) return '';
    
    if (typeof answer === 'string') {
      return answer;
    } else if (typeof answer === 'object') {
      if (answer.latitude && answer.longitude) {
        return `Lat: ${answer.latitude}, Lng: ${answer.longitude}`;
      } else if (answer.lat && answer.lng) {
        return `Lat: ${answer.lat}, Lng: ${answer.lng}`;
      } else if (answer.coordinates) {
        return answer.coordinates;
      }
    }
    return JSON.stringify(answer);
  }

  // Format image answer for display
  formatImageAnswer(answer: any): string {
    if (!answer) return '';
    
    if (typeof answer === 'string') {
      return answer;
    } else if (Array.isArray(answer)) {
      return `${answer.length} image(s)`;
    } else if (typeof answer === 'object') {
      return 'Image data';
    }
    return JSON.stringify(answer);
  }

  openMapPopup(answer: any): void {
    // Format the coordinates for display
    if (typeof answer === 'object' && answer.latitude && answer.longitude) {
      this.selectedCoordinates = `Latitude: ${answer.latitude}, Longitude: ${answer.longitude}`;
      // Store the coordinates object for potential map integration
      this.selectedCoordinatesObj = answer;
    } else if (typeof answer === 'string') {
      this.selectedCoordinates = answer;
      this.selectedCoordinatesObj = null;
    } else {
      this.selectedCoordinates = this.formatMapAnswer(answer);
      this.selectedCoordinatesObj = answer;
    }
    
    this.popupTitle = 'Location Map';
    this.showMapPopup = true;
  }

  openImagePopup(answer: any): void {
    this.selectedImageInfo = answer;
    
    // Parse image data from the answer
    this.currentImages = this.parseImageData(answer);
    this.currentImageIndex = 0;
    
    this.showImagePopup = true;
  }

  // Enhanced image data parser
  parseImageData(imageInfo: any): ImageItem[] {
    if (!imageInfo) return [];

    // If it's already an array of images
    if (Array.isArray(imageInfo)) {
      return imageInfo.map((img, index) => {
        if (typeof img === 'string') {
          // If it's a URL string
          return {
            url: img,
            thumbnail: img,
            title: `Image ${index + 1}`,
            description: 'Uploaded image',
            uploadDate: new Date().toISOString().split('T')[0]
          };
        } else if (typeof img === 'object') {
          // If it's an image object
          return {
            url: img.url || img.imageUrl || this.getPlaceholderImage(),
            thumbnail: img.thumbnail || img.url || img.imageUrl || this.getPlaceholderThumbnail(),
            title: img.title || `Image ${index + 1}`,
            description: img.description || 'Uploaded image',
            uploadDate: img.uploadDate || img.date || new Date().toISOString().split('T')[0],
            size: img.size || 'Unknown'
          };
        }
        return {
          url: this.getPlaceholderImage(),
          thumbnail: this.getPlaceholderThumbnail(),
          title: `Image ${index + 1}`,
          description: 'Invalid image data'
        };
      });
    }
    
    // If it's a string (could be comma-separated URLs)
    if (typeof imageInfo === 'string') {
      const urls = imageInfo.split(',').map(url => url.trim());
      return urls.map((url, index) => ({
        url: url,
        thumbnail: url,
        title: `Image ${index + 1}`,
        description: 'Uploaded image',
        uploadDate: new Date().toISOString().split('T')[0]
      }));
    }
    
    // If it's a single object
    if (typeof imageInfo === 'object') {
      return [{
        url: imageInfo.url || imageInfo.imageUrl || this.getPlaceholderImage(),
        thumbnail: imageInfo.thumbnail || imageInfo.url || imageInfo.imageUrl || this.getPlaceholderThumbnail(),
        title: imageInfo.title || 'Image',
        description: imageInfo.description || 'Uploaded image',
        uploadDate: imageInfo.uploadDate || imageInfo.date || new Date().toISOString().split('T')[0],
        size: imageInfo.size || 'Unknown'
      }];
    }

    // Fallback to sample images
    return this.getSampleImages();
  }

  // Helper method for sample images (for demo purposes)
  private getSampleImages(): ImageItem[] {
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

// Updated interfaces
interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
  formattedAnswer?: string; // For display purposes
}

interface ImageItem {
  url: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  uploadDate?: string;
  size?: string;
}

// For storing coordinates object
interface Coordinates {
  latitude?: string;
  longitude?: string;
  lat?: string;
  lng?: string;
  coordinates?: string;
}