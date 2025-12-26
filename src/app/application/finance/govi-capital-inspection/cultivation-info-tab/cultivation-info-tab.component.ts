import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-cultivation-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cultivation-info-tab.component.html',
  styleUrl: './cultivation-info-tab.component.css',
})
export class CultivationInfoTabComponent implements OnInit {
  @Input() cultivationData!: ICultivation;

  showImageModal = false;
  currentImageIndex = 0;

  ngOnInit() {
    if (this.cultivationData) {
      console.log(this.cultivationData);
    }
  }

  getYesNo(value: number | undefined): string {
    return value === 1 ? 'Yes' : 'No';
  }

  getClimaticValue(value: number | undefined): boolean {
    return value === 1;
  }

  getFormattedPh(): string {
    if (!this.cultivationData || this.cultivationData.ph === undefined) {
      return '-';
    }
    return parseFloat(this.cultivationData.ph.toString()).toString();
  }

  get formattedWaterSources(): string {
    if (
      !this.cultivationData?.waterSources ||
      this.cultivationData.waterSources.length === 0
    ) {
      return 'No water sources';
    }
    return this.cultivationData.waterSources.join(', ');
  }

  get hasWaterImages(): boolean {
    return (
      this.cultivationData?.waterImage &&
      this.cultivationData.waterImage.length > 0
    );
  }

  get images() {
    if (!this.hasWaterImages) {
      return [];
    }
    return this.cultivationData.waterImage.map((src, index) => ({
      id: index + 1,
      src: src,
      alt: `Water Source Image ${index + 1}`,
    }));
  }

  openImageModal() {
    if (this.hasWaterImages) {
      this.showImageModal = true;
      this.currentImageIndex = 0;
    }
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  nextImage() {
    if (this.images.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex + 1) % this.images.length;
    }
  }

  prevImage() {
    if (this.images.length > 0) {
      this.currentImageIndex =
        (this.currentImageIndex - 1 + this.images.length) % this.images.length;
    }
  }

  get currentImage() {
    return this.images[this.currentImageIndex];
  }

  get imageCounter() {
    return `Image ${this.currentImageIndex + 1} of ${this.images.length}`;
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
  waterImage: string[];
  isRecevieRainFall: number;
  isRainFallSuitableCrop: number;
  isRainFallSuitableCultivation: number;
  isElectrocityAvailable: number;
  ispumpOrirrigation: number;
}
