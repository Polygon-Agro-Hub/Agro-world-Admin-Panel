import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface RectangleCardConfig {
  label: string;
  count: number;
  dateLabel: string;
  iconBg: string;
  iconColor: string;
  iconClass: string;
}

@Component({
  selector: 'app-rectangle-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rectangle-component.component.html',
  styleUrl: './rectangle-component.component.css'
})
export class RectangleComponent {
  @Input() config: RectangleCardConfig = {
    label: 'Individual Farmer Audits (Timely)',
    count: 200,
    dateLabel: 'This Month - May',
    iconBg: '#fef9e7',
    iconColor: '#f0c000',
    iconClass: 'fa-solid fa-magnifying-glass-location'
  };
}