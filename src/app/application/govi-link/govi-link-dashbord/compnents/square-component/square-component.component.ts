import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SquareCardConfig {
  label: string;
  count: number;
  iconClass: string;
  bgColor: string;
}

@Component({
  selector: 'app-square-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './square-component.component.html',
  styleUrl: './square-component.component.css'
})
export class SquareComponentComponent {
  @Input() config: SquareCardConfig = {
    label: 'Chief Field Officers',
    count: 5,
    iconClass: 'fa-solid fa-layer-group',
    bgColor: '#2aaa96'
  };
}