import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';

interface VegetableVariety {
  imageUrl: string;
  nameEn: string;
  descriptionEn: string;
  nameSi: string;
  descriptionSi: string;
  nameTa: string;
  descriptionTa: string;
  bgColor: string;
}

@Component({
  selector: 'app-view-crop-variety',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-crop-variety.component.html',
  styleUrl: './view-crop-variety.component.css'
})
export class ViewCropVarietyComponent implements OnInit {

  itemId: number | null = null;
  CropPassId: number | null = null;
  isLoading: boolean = false;
  selectedImage: string = '';
  selectedFileName: string = '';

  variety: VegetableVariety = {
    imageUrl: '',
    nameEn: '',
    descriptionEn: '',
    nameSi: '',
    descriptionSi: '',
    nameTa: '',
    descriptionTa: '',
    bgColor: '',
  };

  constructor(
    private cropCalendarService: CropCalendarService,
    private route: ActivatedRoute,   // ← inject ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.CropPassId = params['cid'] ? +params['cid'] : null;

      if (this.itemId) {
        this.getCropVarietyById(this.itemId);
      }
    });
  }

  getCropVarietyById(itemId: number): void {
    this.isLoading = true;
    this.cropCalendarService.getCropVarietyById(itemId).subscribe({
      next: (response: any) => {
        const data = response.groups[0];   // ← first record from API

        // Map API fields → variety object
        this.variety = {
          imageUrl: data.image || 'assets/images/broccoli.png',
          nameEn:        data.varietyNameEnglish  || '',
          descriptionEn: data.descriptionEnglish  || '',
          nameSi:        data.varietyNameSinhala  || '',
          descriptionSi: data.descriptionSinhala  || '',
          nameTa:        data.varietyNameTamil    || '',
          descriptionTa: data.descriptionTamil    || '',
          bgColor:       data.bgColor           || '',
        };

        if (data.image) {
          this.selectedImage = data.image;
          this.selectedFileName = 'Existing Image';
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  goBack(): void {
    window.history.back();
  }

  onCancel(): void {
    console.log('Cancelled');
  }

  onSave(): void {
    console.log('Saved:', this.variety);
  }
}