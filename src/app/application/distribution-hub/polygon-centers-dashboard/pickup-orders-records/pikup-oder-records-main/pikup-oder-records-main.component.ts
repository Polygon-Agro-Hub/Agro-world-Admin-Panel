import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ProgressComponent } from '../../progress/progress.component';
import { AllPikupOdersComponent } from '../all-pikup-oders/all-pikup-oders.component';
import { ReadyToPikupComponent } from '../ready-to-pikup/ready-to-pikup.component';
import { PikupOdersComponent } from '../pikup-oders/pikup-oders.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-pikup-oder-records-main',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    AllPikupOdersComponent,
    ReadyToPikupComponent,
    PikupOdersComponent
  ],
  templateUrl: './pikup-oder-records-main.component.html',
  styleUrl: './pikup-oder-records-main.component.css',
})
export class PikupOderRecordsMainComponent implements OnInit {
  activeTab: string = 'All';
  centerObj: CenterDetails = {
    centerId: 0,
    centerName: '',
    centerRegCode: '',
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get route parameters and query parameters
    this.route.params.subscribe((params) => {
      this.centerObj.centerId = params['id'];
    });

    this.route.queryParams.subscribe((params) => {
      // Set tab based on query parameter
      const tab = params['tab'];
      if (tab && ['All', 'Ready to Pickup', 'Picked Up'].includes(tab)) {
        this.activeTab = tab;
      }

      // Set center details from query params
      this.centerObj.centerName = params['name'] || '';
      this.centerObj.centerRegCode = params['regCode'] || '';
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge',
    });
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}