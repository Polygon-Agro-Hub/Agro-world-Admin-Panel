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
  createdAt: Date;
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
    let l: any = this.personalObj?.languages;
    if (!l) return '----';
    if (typeof l === 'string' && l.trim().startsWith('[')) {
      try {
        l = JSON.parse(l);
      } catch {
        /* keep as string */
      }
    }
    return Array.isArray(l) ? l.join(' , ') : String(l);
  }

  show(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '----';
    const text = String(value).trim();
    return text ? text : '----';
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
