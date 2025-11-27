import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressComponent } from '../progress/progress.component';
import { OutOfDeliveryComponent } from '../out-of-delivery/out-of-delivery.component';
import { OfficersComponent } from '../officers/officers.component';
import { OfficerTargetComponent } from "../officer-target/officer-target.component";
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-main-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ProgressComponent,
    OutOfDeliveryComponent,
    OfficersComponent,
    OfficerTargetComponent
  ],
  templateUrl: './main-dashboard-layout.component.html',
  styleUrl: './main-dashboard-layout.component.css',
})
export class MainDashboardLayoutComponent implements OnInit {
  activeTab: string = 'Progress';
  centerObj: CenterDetails = {
    centerId: 0,
    centerName: '',
    centerRegCode: ''
  };

  constructor(private router: Router, private route: ActivatedRoute, public tokenService: TokenService,
      public permissionService: PermissionService) { }

  ngOnInit(): void {
    // Get route parameters and query parameters
    this.route.params.subscribe(params => {
      this.centerObj.centerId = params['id'];
    });

    this.route.queryParams.subscribe(params => {
      // Set tab based on query parameter
      const tab = params['tab'];
      if (tab && ['Progress', 'Out for Delivery', 'Officers', 'Officer Target'].includes(tab)) {
        this.activeTab = tab;
      }
      
      // Set center details from query params
      this.centerObj.centerName = params['name'] || '';
      this.centerObj.centerRegCode = params['regCode'] || '';
    });

  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    
    // Update URL with tab query parameter without reloading
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab },
      queryParamsHandling: 'merge'
    });
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}