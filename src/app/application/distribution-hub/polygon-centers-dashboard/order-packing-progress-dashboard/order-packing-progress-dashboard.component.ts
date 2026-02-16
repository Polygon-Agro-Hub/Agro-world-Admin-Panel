import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressComponent } from '../progress/progress.component';
import { OutOfDeliveryComponent } from '../out-of-delivery/out-of-delivery.component';
// import { OfficersComponent } from '../officers/officers.component';
// import { OfficerTargetComponent } from "../officer-target/officer-target.component";
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-order-packing-progress-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    ProgressComponent,
    OutOfDeliveryComponent,
    // OfficersComponent,
    // OfficerTargetComponent
  ],
  templateUrl: './order-packing-progress-dashboard.component.html',
  styleUrl: './order-packing-progress-dashboard.component.css'
})
export class OrderPackingProgressDashboardComponent implements OnInit {
  activeTab: string = '';
  centerObj: CenterDetails = {
    centerId: 0,
    centerName: '',
    centerRegCode: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    // Get route parameters (removed query params for tab)
    this.route.params.subscribe(params => {
      this.centerObj.centerId = params['id'];
    });

    // Only get center details from query params if needed
    this.route.queryParams.subscribe(params => {
      // Set center details from query params (removed tab handling)
      this.centerObj.centerName = params['name'] || '';
      this.centerObj.centerRegCode = params['regCode'] || '';
    });

    // Set default tab based on permissions if you want
    // For example, show 'Progress' tab if user has permission, otherwise show 'Out for Delivery'
    this.initializeDefaultTab();
  }

  private initializeDefaultTab(): void {
    // Set default tab based on permissions
    if (this.permissionService.hasPermission('Polygon centres dashboard progress tab') || this.tokenService.getUserDetails().role === '1') {
      this.activeTab = 'Progress'
    } else if (this.permissionService.hasPermission('Polygon centres dashboard progress tab')) {
      this.activeTab = 'Out for Delivery'
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    // Removed URL update for tab
  }

  back() {
    window.history.back();
  }

}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}