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
  showDetailsPopup = false;
  selectedCoordinates = '';
  selectedImageInfo = '';
  selectedDetails = '';
  popupTitle = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['landlArr'] && this.landlArr) {
      this.sortedLandArr = [...this.landlArr].sort(
        (a, b) => a.qIndex - b.qIndex
      );

      // Optional: Ensure qIndex 4 and 5 have appropriate ansType if not set
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
    this.showImagePopup = true;
  }

  openDetailsPopup(type: string, details: string): void {
    this.selectedDetails = details;

    switch (type) {
      case 'ownership':
        this.popupTitle = 'Ownership Details';
        break;
      case 'legal':
        this.popupTitle = 'Legal Status Details';
        break;
      default:
        this.popupTitle = 'Additional Details';
    }

    this.showDetailsPopup = true;
  }

  closePopup(): void {
    this.showMapPopup = false;
    this.showImagePopup = false;
    this.showDetailsPopup = false;
    this.selectedCoordinates = '';
    this.selectedImageInfo = '';
    this.selectedDetails = '';
    this.popupTitle = '';
  }
}

interface Question {
  answer: any;
  qIndex: number;
  ansType: string;
  quaction: string;
}
