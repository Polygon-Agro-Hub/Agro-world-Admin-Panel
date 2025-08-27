import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressComponent } from '../progress/progress.component';

@Component({
  selector: 'app-main-dashboard-layout',
  standalone: true,
  imports: [CommonModule, HttpClientModule, ProgressComponent],
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
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
}
