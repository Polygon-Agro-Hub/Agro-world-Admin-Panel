import { Component, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RectangleComponent, RectangleCardConfig } from '../govi-link-dashbord/compnents/rectangle-component/rectangle-component.component';
import { SquareComponentComponent, SquareCardConfig } from '../govi-link-dashbord/compnents/square-component/square-component.component';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';

@Component({
  selector: 'app-govi-link-dashbord',
  standalone: true,
  imports: [SquareComponentComponent, RectangleComponent, NgFor],
  templateUrl: './govi-link-dashbord.component.html',
  styleUrl: './govi-link-dashbord.component.css'
})
export class GoviLinkDashbordComponent implements OnInit {

  private roleConfig: { [key: string]: { iconClass: string; bgColor: string; order: number } } = {
    'Chief Field Officer': { iconClass: 'fa-solid fa-layer-group',     bgColor: '#0D9488', order: 1 },
    'Field Officer':       { iconClass: 'fa-solid fa-layer-group',     bgColor: '#FB923C', order: 2 },
    'Zone Officer':        { iconClass: 'fa-solid fa-map-location-dot',bgColor: '#f59e0b', order: 3 },
    'default':             { iconClass: 'fa-solid fa-user',            bgColor: '#B78C00', order: 99 }
  };

  squareCards: SquareCardConfig[] = [];

  rectangleCards: RectangleCardConfig[] = [
    {
      label: 'Services Done Today',
      count: 0,
      dateLabel: 'Today',
      iconBg: '#fef9e7',
      iconColor: '#f0c000',
      iconClass: 'fa-solid fa-magnifying-glass-location'
    },
    {
      label: 'Field Audits Completed Today',
      count: 0,
      dateLabel: 'Today',
      iconBg: '#e8f5e9',
      iconColor: '#43a047',
      iconClass: 'fa-solid fa-tractor'
    }
  ];

  constructor(private goviLinkService: GoviLinkService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.goviLinkService.getDashboardData().subscribe({
      next: (res) => {
        if (res.success) {

          // Officer cards sorted by defined order
          const officerCards: SquareCardConfig[] = res.officerCount
            .map((item: any) => {
              const config = this.roleConfig[item.JobRole] ?? this.roleConfig['default'];
              return {
                label: item.JobRole,
                count: item.count,
                iconClass: config.iconClass,
                bgColor: config.bgColor,
                order: config.order
              };
            })
            .sort((a: any, b: any) => a.order - b.order);

          // Extra cards — Field Audits and Field Visits (order: 3, 4)
          const extraCards: SquareCardConfig[] = [
            {
              label: 'Field Audits Today',
              count: res.auditCount.count ?? 0,
              iconClass: 'fa-solid fa-layer-group',
              bgColor: '#3b82f6'
            },
            {
              label: 'Field Visits Today',
              count: res.serviceCount.total_count ?? 0,
              iconClass: 'fa-solid fa-layer-group',
              bgColor: '#B78C00'
            }
          ];

          // Final order: Chief Field Officers, Field Officers, Field Audits Today, Field Visits Today
          this.squareCards = [...officerCards, ...extraCards];
        }
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
      }
    });
  }
}