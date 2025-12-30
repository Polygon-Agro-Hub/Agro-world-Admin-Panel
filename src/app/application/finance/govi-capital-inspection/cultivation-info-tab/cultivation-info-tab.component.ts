import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-cultivation-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cultivation-info-tab.component.html',
  styleUrl: './cultivation-info-tab.component.css',
})
export class CultivationInfoTabComponent implements OnDestroy {
  @Input() cultivationData!: ICultivation;

  showImageModal = false;
  currentImageIndex = 0;
  currentImages: string[] = [];
  
  imageLoaded = false;
  private imageTimeout: any;

  ngOnInit() {
    if (this.cultivationData) {
      console.log(this.cultivationData);
    }
  }

  ngOnDestroy(): void {
    if (this.imageTimeout) {
      clearTimeout(this.imageTimeout);
    }
  }

  getYesNo(value: number | undefined): string {
    if (value === undefined) return 'Not provided';
    return value === 1 ? 'Yes' : 'No';
  }

  getClimaticValue(value: number | undefined): boolean {
    return value === 1;
  }

  getFormattedPh(): string {
    if (!this.cultivationData || this.cultivationData.ph === undefined) {
      return 'Not provided';
    }
    return parseFloat(this.cultivationData.ph.toString()).toString();
  }

  get formattedWaterSources(): string {
    if (
      !this.cultivationData?.waterSources ||
      this.cultivationData.waterSources.length === 0
    ) {
      return 'Not provided';
    }
    return this.cultivationData.waterSources.join(', ');
  }

  get hasWaterImages(): boolean {
    if (!this.cultivationData?.waterImage) return false;
    
    if (Array.isArray(this.cultivationData.waterImage)) {
      return this.cultivationData.waterImage.length > 0;
    } else if (typeof this.cultivationData.waterImage === 'string') {
      const cleanString = this.cultivationData.waterImage.replace(/[\[\]"]/g, '');
      const images = cleanString.split(',').map(img => img.trim()).filter(img => img.length > 0);
      return images.length > 0;
    }
    
    return false;
  }

  openImageModal(): void {
    if (this.hasWaterImages) {
      this.imageLoaded = false;
      
      if (Array.isArray(this.cultivationData.waterImage)) {
        this.currentImages = this.cultivationData.waterImage;
      } else if (typeof this.cultivationData.waterImage === 'string') {
        const cleanString = this.cultivationData.waterImage.replace(/[\[\]"]/g, '');
        this.currentImages = cleanString.split(',').map(img => img.trim()).filter(img => img.length > 0);
      } else {
        this.currentImages = [];
      }
      
      this.currentImageIndex = 0;
      this.showImageModal = true;
      
      this.imageTimeout = setTimeout(() => {
        this.imageLoaded = true;
      }, 300);
    }
  }

  closeImageModal(): void {
    this.showImageModal = false;
    this.currentImageIndex = 0;
    this.currentImages = [];
    this.imageLoaded = false;
    
    if (this.imageTimeout) {
      clearTimeout(this.imageTimeout);
    }
  }

  nextImage(): void {
    if (this.currentImages.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.currentImages.length;
    }
  }

  prevImage(): void {
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
}

export interface ICultivation {
  temperature: number;
  rainfall: number;
  sunShine: number;
  humidity: number;
  windVelocity: number;
  windDirection: number;
  zone: number;
  isCropSuitale: number;
  ph: number;
  soilType: string;
  soilfertility: string;
  waterSources: string[];
  waterImage: string[] | string;
  isRecevieRainFall: number;
  isRainFallSuitableCrop: number;
  isRainFallSuitableCultivation: number;
  isElectrocityAvailable: number;
  ispumpOrirrigation: number;
}