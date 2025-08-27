import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressComponent } from '../progress/progress.component';
import { OutOfDeliveryComponent } from '../out-of-delivery/out-of-delivery.component';
import { OfficersComponent } from '../officers/officers.component';

@Component({
  selector: 'app-main-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ProgressComponent,
    OutOfDeliveryComponent,
    OfficersComponent,
  ],
  templateUrl: './main-dashboard-layout.component.html',
  styleUrl: './main-dashboard-layout.component.css',
})
export class MainDashboardLayoutComponent implements OnInit {
  activeTab: string = 'Progress';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const tab = params['tab'];
      if (tab === 'Progress') {
        this.activeTab = 'Progress';
      } else if (tab === 'Out for Delivery') {
        this.activeTab = 'Out for Delivery';
      } else if (tab === 'Officers') {
        this.activeTab = 'Officers';
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
