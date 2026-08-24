import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';

interface CropGroupDetails {
  id: number;
  cropNameEnglish: string;
  cropNameSinhala: string;
  cropNameTamil: string;
  category: string;
  costFeild: string;
  incomeFeild: string;
  bgColor: string;
  image: string;
  seedRate: string;
  rowSpace: string;
  plantSpace: string;
  AvgYield: string;
  nitrogen: string;
  phosphorus: string;
  potassium: string;
}

@Component({
  selector: 'app-view-crop-group-details',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './view-crop-group-details.component.html',
  styleUrl: './view-crop-group-details.component.css',
})
export class ViewCropGroupDetailsComponent implements OnInit {
  isLoading = false;
  itemId: number | null = null;
  cropGroup: CropGroupDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private cropCalendarService: CropCalendarService,
    private location: Location,
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;

      if (this.itemId) {
        this.isLoading = true;
        this.cropCalendarService.getCropGroupById(this.itemId).subscribe({
          next: (response: any) => {
            this.cropGroup = response.groups[0] ?? null;
            this.isLoading = false;
          },
          error: () => {
            this.isLoading = false;
          },
        });
      }
    });
  }

  formatExactValue(value: any): string {
    if (value === null || value === undefined || value === '' || value === 'N/A') {
      return '—';
    }

    const num = parseFloat(value);
    if (isNaN(num)) {
      return '—';
    }

    return num.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 10, 
    });
  }

  goBack(): void {
    this.location.back();
  }
}