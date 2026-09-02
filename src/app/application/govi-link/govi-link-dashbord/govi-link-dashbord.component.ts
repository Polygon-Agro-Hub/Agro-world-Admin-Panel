import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  RectangleComponent,
  RectangleCardConfig,
} from '../govi-link-dashbord/compnents/rectangle-component/rectangle-component.component';
import {
  SquareComponentComponent,
  SquareCardConfig,
} from '../govi-link-dashbord/compnents/square-component/square-component.component';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';

@Component({
  selector: 'app-govi-link-dashbord',
  standalone: true,
  imports: [CommonModule, SquareComponentComponent, RectangleComponent],
  templateUrl: './govi-link-dashbord.component.html',
  styleUrl: './govi-link-dashbord.component.css',
})

export class GoviLinkDashbordComponent implements OnInit {
  private roleConfig: {
    [key: string]: { iconClass: string; bgColor: string; order: number };
  } = {
      'Chief Field Officer': {
        iconClass: 'fa-solid fa-layer-group',
        bgColor: '#0D9488',
        order: 1,
      },
      'Field Officer': {
        iconClass: 'fa-solid fa-layer-group',
        bgColor: '#FB923C',
        order: 2,
      },
      'Zone Officer': {
        iconClass: 'fa-solid fa-map-location-dot',
        bgColor: '#f59e0b',
        order: 3,
      },
      default: { iconClass: 'fa-solid fa-user', bgColor: '#B78C00', order: 99 },
    };

  squareCards: SquareCardConfig[] = [];
  timelyCards: RectangleCardConfig[] = [];
  lateCards: RectangleCardConfig[] = [];

  constructor(private goviLinkService: GoviLinkService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.goviLinkService.getDashboardData().subscribe({
      next: (res) => {

        if (res.success) {
          // Square cards — officer counts sorted by role order
          const officerCards: SquareCardConfig[] = res.officerCount
            .map((item: any) => {
              const config =
                this.roleConfig[item.JobRole] ?? this.roleConfig['default'];
              return {
                label: item.JobRole,
                count: item.count,
                iconClass: config.iconClass,
                bgColor: config.bgColor,
                order: config.order,
              };
            })
            .sort((a: any, b: any) => a.order - b.order);

          // Extra square cards — audits and visits today
          const extraCards: SquareCardConfig[] = [
            {
              label: 'Field Audits Today',
              count: res.auditCount.count ?? 0,
              iconClass: 'fa-solid fa-layer-group',
              bgColor: '#3b82f6',
            },
            {
              label: 'Field Visits Today',
              count: res.serviceCount.total_count ?? 0,
              iconClass: 'fa-solid fa-layer-group',
              bgColor: '#B78C00',
            },
          ];

          this.squareCards = [...officerCards, ...extraCards];

          // Current month label
          const monthName = new Date().toLocaleString('default', {
            month: 'long',
          });
          const dateLabel = `This Month - ${monthName}`;

          // Timely rectangle cards
          this.timelyCards = [
            {
              label: 'Individual Farmer Audits (Timely)',
              count: res.auditSummery.individual_same_day ?? 0, 
              dateLabel,
              iconBg: '#fef9e7',
              iconColor: '#f0c000',
              iconClass: 'fa-solid fa-magnifying-glass-location',
            },
            {
              label: 'Cluster Audits (Timely)',
              count: res.auditSummery.cluster_same_day ?? 0, 
              dateLabel,
              iconBg: '#fef9e7',
              iconColor: '#f0c000',
              iconClass: 'fa-solid fa-magnifying-glass-location',
            },
            {
              label: 'Service Visits (Timely)',
              count: res.serviceSummery.same_day ?? 0, 
              dateLabel,
              iconBg: '#fef9e7',
              iconColor: '#f0c000',
              iconClass: 'fa-solid fa-circle-question',
            },
          ];

          // Late rectangle cards
          this.lateCards = [
            {
              label: 'Individual Farmer Audits (Late)',
              count: res.auditSummery.individual_diff_day ?? 0, 
              dateLabel,
              iconBg: '#fce4ec',
              iconColor: '#e91e8c',
              iconClass: 'fa-solid fa-magnifying-glass-location',
            },
            {
              label: 'Cluster Audits (Late)',
              count: res.auditSummery.cluster_diff_day ?? 0, 
              dateLabel,
              iconBg: '#fce4ec',
              iconColor: '#e91e8c',
              iconClass: 'fa-solid fa-magnifying-glass-location',
            },
            {
              label: 'Service Visits (Late)',
              count: res.serviceSummery.diff_day ?? 0, 
              dateLabel,
              iconBg: '#fce4ec',
              iconColor: '#e91e8c',
              iconClass: 'fa-solid fa-circle-question',
            },
          ];
        }
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
      },
    });
  }
}
