import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-land-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './land-info-tab.component.html',
  styleUrl: './land-info-tab.component.css',
})
export class LandInfoTabComponent {
  @Input() landlObj!: ILand;
  
  showMapPopup = false;
  showImagePopup = false;
  
  currentImages: string[] = [];
  currentImageIndex = 0;

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
    
    if (typeof this.landlObj.images === 'string') {
      const cleanString = this.landlObj.images.replace(/[\[\]"]/g, '');
      const images = cleanString.split(',').map(img => img.trim()).filter(img => img.length > 0);
      return images.length > 0;
    }
    
    return false;
  }

  // Add this getter to convert 1/0 to Yes/No
  get ownershipDisplay(): string {
    if (!this.landlObj?.isOwnByFarmer) return 'Not provided';
    
    const value = this.landlObj.isOwnByFarmer.toString().trim();
    
    if (value === '1') return 'Yes';
    if (value === '0') return 'No';
    
    // If it's already "Yes"/"No" or some other value, return as is
    return this.landlObj.isOwnByFarmer;
  }

  openMapPopup(): void {
    this.showMapPopup = true;
  }

  openImagePopup(): void {
    if (this.landlObj?.images && typeof this.landlObj.images === 'string') {
      const cleanString = this.landlObj.images.replace(/[\[\]"]/g, '');
      this.currentImages = cleanString.split(',').map(img => img.trim()).filter(img => img.length > 0);
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
  }
}

// Interface
interface ILand {
  isOwnByFarmer: string | null;
  ownershipStatus: string;
  landDiscription: string;
  longitude: string;
  latitude: string;
  images: string | null;
  createdAt: string;
}