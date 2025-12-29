import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
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
  
  showMapPopup = false;
  showImagePopup = false;
  
  currentImages: string[] = [];
  currentImageIndex = 0;
  
  // OpenStreetMap properties
  mapUrl: SafeResourceUrl = '';
  mapIframeLoaded = false;
  private mapTimeout: any;

  constructor(private sanitizer: DomSanitizer) {}

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
      
      // Alternative: Using Leaflet via openstreetmap.fr (nicer interface)
      // const url = `https://www.openstreetmap.fr/?mlat=${lat}&mlon=${lng}&zoom=16&layers=M`;
      
      // Alternative 2: Using mapy.cz (good satellite imagery)
      // const url = `https://mapy.cz/zakladni?x=${lng}&y=${lat}&z=16`;
      
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
      
      // Alternative: Open in Google Maps (still works without API key for viewing)
      // const url = `https://www.google.com/maps?q=${lat},${lng}`;
      // window.open(url, '_blank');
    }
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
    this.mapIframeLoaded = false;
    
    if (this.mapTimeout) {
      clearTimeout(this.mapTimeout);
    }
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