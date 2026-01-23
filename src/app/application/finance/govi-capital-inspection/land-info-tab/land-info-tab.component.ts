import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-land-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './land-info-tab.component.html',
  styleUrl: './land-info-tab.component.css',
})
export class LandInfoTabComponent implements OnDestroy {
  @Input() landlObj!: ILand;
  @Input() currentPage: number = 4;
  @Input() totalPages: number = 11;
  @Output() nextPage = new EventEmitter<void>();
  @Output() previousPage = new EventEmitter<void>();
  
  showMapPopup = false;
  showImagePopup = false;
  
  currentImages: string[] = [];
  currentImageIndex = 0;
  
  // OpenStreetMap properties
  mapUrl: SafeResourceUrl = '';
  mapIframeLoaded = false;
  private mapTimeout: any;

  constructor(private sanitizer: DomSanitizer) {}

  onNextPage(): void {
    this.nextPage.emit();
  }

  onPreviousPage(): void {
    this.previousPage.emit();
  }

  ngOnDestroy(): void {
    if (this.mapTimeout) {
      clearTimeout(this.mapTimeout);
    }
  }

  get hasCoordinates(): boolean {
    return !!(this.landlObj?.latitude && this.landlObj?.longitude);
  }

  get coordinatesText(): string {
    if (this.hasCoordinates) {
      return `Lat: ${this.landlObj.latitude}, Lng: ${this.landlObj.longitude}`;
    }
    return 'No coordinates available';
  }

  get hasImages(): boolean {
    if (!this.landlObj?.images) return false;
    
    // Handle array of images
    if (Array.isArray(this.landlObj.images)) {
      return this.landlObj.images.length > 0 && 
             this.landlObj.images.some(img => img && img.trim().length > 0);
    }
    
    // Handle string format (legacy support)
    if (typeof this.landlObj.images === 'string') {
      const cleanString = this.landlObj.images.replace(/[\[\]"]/g, '');
      const images = cleanString.split(',').map(img => img.trim()).filter(img => img.length > 0);
      return images.length > 0;
    }
    
    return false;
  }

  get ownershipDisplay(): string {
    if (!this.landlObj?.isOwnByFarmer) return 'Not provided';
    
    const value = this.landlObj.isOwnByFarmer.toString().trim();
    
    if (value === '1') return 'Yes';
    if (value === '0') return 'No';
    
    return this.landlObj.isOwnByFarmer;
  }

  openMapPopup(): void {
    this.showMapPopup = true;
    this.mapIframeLoaded = false;
    
    // Generate map URL
    this.generateMapUrl();
    
    // Reset loading after a short delay
    this.mapTimeout = setTimeout(() => {
      this.mapIframeLoaded = true;
    }, 500);
  }

  private generateMapUrl(): void {
    if (this.hasCoordinates) {
      const lat = this.landlObj.latitude;
      const lng = this.landlObj.longitude;
      
      // OpenStreetMap with marker - using openstreetmap.org
      const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng}%2C${lat}%2C${lng}%2C${lat}&layer=mapnik&marker=${lat}%2C${lng}`;
      
      this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
  }

  openInExternalMap(): void {
    if (this.hasCoordinates) {
      const lat = this.landlObj.latitude;
      const lng = this.landlObj.longitude;
      
      // Open in OpenStreetMap
      const url = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=16`;
      window.open(url, '_blank');
    }
  }

  openImagePopup(): void {
    if (!this.landlObj?.images) {
      this.currentImages = [];
    } else if (Array.isArray(this.landlObj.images)) {
      // Handle array format
      this.currentImages = this.landlObj.images
        .filter(img => img && typeof img === 'string' && img.trim().length > 0)
        .map(img => img.trim());
    } else if (typeof this.landlObj.images === 'string') {
      // Handle legacy string format
      const cleanString = this.landlObj.images.replace(/[\[\]"]/g, '');
      this.currentImages = cleanString.split(',')
        .map(img => img.trim())
        .filter(img => img.length > 0);
    } else {
      this.currentImages = [];
    }
    
    this.currentImageIndex = 0;
    this.showImagePopup = true;
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

  closePopup(): void {
    this.showMapPopup = false;
    this.showImagePopup = false;
    this.currentImageIndex = 0;
    this.currentImages = [];
    this.mapIframeLoaded = false;
    
    if (this.mapTimeout) {
      clearTimeout(this.mapTimeout);
    }
  }

  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/800x600/9E9E9E/FFFFFF?text=Image+Not+Available';
    imgElement.classList.add('p-4');
  }

  handleThumbnailError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'https://via.placeholder.com/150/9E9E9E/FFFFFF?text=Image';
  }
}

// Interface - Updated to support both array and string formats
interface ILand {
  isOwnByFarmer: string | null;
  ownershipStatus: string;
  landDiscription: string;
  longitude: string;
  latitude: string;
  images: string[] | string | null; // Changed to support array
  createdAt: string;
}