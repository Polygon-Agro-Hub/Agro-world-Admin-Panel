import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RectangleComponent, RectangleCardConfig } from '../govi-link-dashbord/compnents/rectangle-component/rectangle-component.component';
import { SquareComponentComponent, SquareCardConfig } from '../govi-link-dashbord/compnents/square-component/square-component.component';

@Component({
  selector: 'app-govi-link-dashbord',
  standalone: true,
  imports: [SquareComponentComponent, RectangleComponent, NgFor],
  templateUrl: './govi-link-dashbord.component.html',
  styleUrl: './govi-link-dashbord.component.css'
})
export class GoviLinkDashbordComponent {

  squareCards: SquareCardConfig[] = [
    {
      label: 'Chief Field Officers',
      count: 5,
      iconClass: 'fa-solid fa-layer-group',
      bgColor: '#2aaa96'
    },
    {
      label: 'Total Farmers',
      count: 120,
      iconClass: 'fa-solid fa-user-group',
      bgColor: '#3b82f6'
    },
    {
      label: 'Active Zones',
      count: 8,
      iconClass: 'fa-solid fa-map-location-dot',
      bgColor: '#f59e0b'
    },
    {
      label: 'Active Zones',
      count: 8,
      iconClass: 'fa-solid fa-map-location-dot',
      bgColor: '#B78C00'
    }
  ];

  rectangleCards: RectangleCardConfig[] = [
    {
      label: 'Individual Farmer Audits (Timely)',
      count: 200,
      dateLabel: 'This Month - May',
      iconBg: '#fef9e7',
      iconColor: '#f0c000',
      iconClass: 'fa-solid fa-magnifying-glass-location'
    },
    {
      label: 'Total Farm Visits',
      count: 84,
      dateLabel: 'This Week',
      iconBg: '#e8f5e9',
      iconColor: '#43a047',
      iconClass: 'fa-solid fa-tractor'
    },
    {
      label: 'Pending Reports',
      count: 12,
      dateLabel: 'This Month - May',
      iconBg: '#fce4ec',
      iconColor: '#e53935',
      iconClass: 'fa-solid fa-file-circle-exclamation'
    }
  ];

}