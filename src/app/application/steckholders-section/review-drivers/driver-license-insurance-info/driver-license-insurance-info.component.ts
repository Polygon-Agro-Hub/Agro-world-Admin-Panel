import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDriverLicenseInsurance {
  licenseId: string;
  licenseFrontImage: string | null;
  licenseBackImage: string | null;
  insuranceNumber: string;
  insuranceExpiryDate: Date | string | null;
  insuranceFrontImage: string | null;
  insuranceBackImage: string | null;
}

interface Field {
  label: string;
  type: 'text' | 'date' | 'image';
  value: any;
}

@Component({
  selector: 'app-driver-license-insurance-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-license-insurance-info.component.html',
  styleUrl: './driver-license-insurance-info.component.css',
})
export class DriverLicenseInsuranceInfoComponent {
  @Input() licenseInsuranceObj!: IDriverLicenseInsurance;

  isImageOpen: boolean = false;
  selectedImage: string | null = null;
  imageTitle: string = '';
  zoom: number = 1;

  fields: Field[] = [];

  ngOnChanges(): void {
    this.fields = this.buildFields();
  }

  private buildFields(): Field[] {
    const d = this.licenseInsuranceObj;
    return [
      { label: 'Driving License ID', type: 'text', value: d?.licenseId },
      {
        label: 'Driving License ID - Front Image',
        type: 'image',
        value: d?.licenseFrontImage,
      },
      {
        label: 'Driving License ID - Back Image',
        type: 'image',
        value: d?.licenseBackImage,
      },
      {
        label: 'Vehicle Insurance Number',
        type: 'text',
        value: d?.insuranceNumber,
      },
      {
        label: 'Insurance Expiry Date',
        type: 'date',
        value: d?.insuranceExpiryDate,
      },
      {
        label: 'Insurance Certificate - Front Image',
        type: 'image',
        value: d?.insuranceFrontImage,
      },
      {
        label: 'Insurance Certificate - Back Image',
        type: 'image',
        value: d?.insuranceBackImage,
      },
    ];
  }

  show(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '----';
    const text = String(value).trim();
    return text ? text : '----';
  }

  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  getOrdinal(date: Date | string): string {
    const d = new Date(date).getDate();
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  openImage(url: string, label: string): void {
    this.selectedImage = url;
    this.imageTitle = label;
    this.zoom = 1;
    this.isImageOpen = true;
  }

  closeImage(): void {
    this.isImageOpen = false;
    this.selectedImage = null;
  }

  zoomIn(): void {
    if (this.zoom < 3) this.zoom = +(this.zoom + 0.25).toFixed(2);
  }

  zoomOut(): void {
    if (this.zoom > 0.5) this.zoom = +(this.zoom - 0.25).toFixed(2);
  }
}
