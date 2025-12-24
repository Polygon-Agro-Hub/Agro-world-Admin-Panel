import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-cultivation-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cultivation-info-tab.component.html',
  styleUrl: './cultivation-info-tab.component.css'
})
export class CultivationInfoTabComponent {
  // Question data for the form
  questions = [
    { id: 'q1', label: 'Is the crop / cropping system suitable for overall climatic parameters?', type: 'climatic', value: '' },
    { id: 'q2', label: 'Is the crop / cropping system suitable for local soil type?', type: 'text', value: 'Yes' },
    { id: 'q3', label: 'pH', type: 'text', value: '3' },
    { id: 'q4', label: 'Soil Type', type: 'map', value: 'Tight' },
    { id: 'q5', label: 'Overall Soil Fertility', type: 'image', value: 'Excellent' },
    { id: 'q6', label: 'Water Sources', type: 'text', value: 'Tanks, Wells, Other : "Lake"' },
    { id: 'q7', label: 'Images of the water source', type: 'image', value: 'View Photos' },
    { id: 'q8', label: 'Does this land receive adequate rainfall?', type: 'text', value: 'Yes' },
    { id: 'q9', label: 'Is the distribution of rainfall suitable to grow identified crops?', type: 'text', value: 'Yes' },
    { id: 'q10', label: 'Is the water quality suitable for cultivation?', type: 'text', value: 'Yes' },
    { id: 'q11', label: 'Is electricity available for lifting the water?', type: 'text', value: 'Yes' },
    { id: 'q12', label: 'Is there pump sets, micro irrigation systems?', type: 'text', value: 'Yes' }
  ];

  // Climatic factors data
  climaticFactors = [
    { name: 'Temperature', yes: true, no: true },
    { name: 'Rainfall', yes: true, no: true },
    { name: 'Sunshine hours', yes: true, no: true },
    { name: 'Relative humidity', yes: true, no: true },
    { name: 'Wind velocity', yes: true, no: true },
    { name: 'Wind direction', yes: true, no: true },
    { name: 'Seasons and agro-ecological zone', yes: true, no: true }
  ];

  // Modal states
  showMapModal = false;
  showImageModal = false;

  // Image gallery data
  images = [
    { id: 1, src: 'assets/images/water-source-1.jpg', alt: 'Water Source Image 1' },
    { id: 2, src: 'assets/images/water-source-2.jpg', alt: 'Water Source Image 2' },
    { id: 3, src: 'assets/images/water-source-3.jpg', alt: 'Water Source Image 3' }
  ];

  currentImageIndex = 0;

  // Methods to handle modals
  openMapModal() {
    this.showMapModal = true;
  }

  closeMapModal() {
    this.showMapModal = false;
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
  }

  // Image gallery methods
  nextImage() {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
  }

  prevImage() {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
  }

  // Get current image
  get currentImage() {
    return this.images[this.currentImageIndex];
  }

  // Get image counter text
  get imageCounter() {
    return `Image ${this.currentImageIndex + 1} of ${this.images.length}`;
  }
}