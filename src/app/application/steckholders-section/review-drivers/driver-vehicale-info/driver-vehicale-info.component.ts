import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDriverVehicle {
  registrationNumber: string;
  vehicleType: string;
  capacity: string;
  frontImage: string | null;
  backImage: string | null;
  side1Image: string | null;
  side2Image: string | null;
}

interface Field {
  label: string;
  type: 'text' | 'image';
  value: string | number | null | undefined;
}

@Component({
  selector: 'app-driver-vehicale-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-vehicale-info.component.html',
  styleUrl: './driver-vehicale-info.component.css',
})
export class DriverVehicaleInfoComponent {
  @Input() vehicleObj!: IDriverVehicle;

  isImageOpen: boolean = false;
  selectedImage: string | null = null;
  imageTitle: string = '';
  zoom: number = 1;

  get fields(): Field[] {
    const d = this.vehicleObj;
    return [
      {
        label: 'Vehicle Registration Number',
        type: 'text',
        value: d?.registrationNumber,
      },
      { label: 'Vehicle Type', type: 'text', value: d?.vehicleType },
      { label: 'Vehicle Capacity', type: 'text', value: d?.capacity },
      { label: 'Vehicle’s Front Image', type: 'image', value: d?.frontImage },
      { label: 'Vehicle’s Back Image', type: 'image', value: d?.backImage },
      {
        label: 'Vehicle’s Side-1 (Left) Image',
        type: 'image',
        value: d?.side1Image,
      },
      {
        label: 'Vehicle’s Side-2 (Right) Image',
        type: 'image',
        value: d?.side2Image,
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
