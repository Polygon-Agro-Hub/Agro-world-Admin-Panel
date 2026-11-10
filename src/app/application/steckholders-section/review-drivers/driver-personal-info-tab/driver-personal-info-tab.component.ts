import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface IDriverPersonal {
  firstName: string;
  lastName: string;
  driverRole: string;
  languages: string[] | string;
  profileImage: string | null;
  mobile1: string;
  mobile2: string | null;
  nic: string;
  email: string;
}

@Component({
  selector: 'app-driver-personal-info-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './driver-personal-info-tab.component.html',
  styleUrl: './driver-personal-info-tab.component.css',
})
export class DriverPersonalInfoTabComponent {
  @Input() personalObj!: IDriverPersonal;

  isImageOpen: boolean = false;
  zoom: number = 1;

  get languagesText(): string {
    const l = this.personalObj?.languages;
    if (!l) return '----';
    return Array.isArray(l) ? l.join(' , ') : l;
  }

  show(value: string | null | undefined): string {
    return value && value.trim() ? value : '----';
  }

  openImage(): void {
    this.zoom = 1;
    this.isImageOpen = true;
  }

  closeImage(): void {
    this.isImageOpen = false;
  }

  zoomIn(): void {
    if (this.zoom < 3) this.zoom = +(this.zoom + 0.25).toFixed(2);
  }

  zoomOut(): void {
    if (this.zoom > 0.5) this.zoom = +(this.zoom - 0.25).toFixed(2);
  }
}