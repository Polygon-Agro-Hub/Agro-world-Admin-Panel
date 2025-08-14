import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { DashPredefinePackagesComponent } from '../dash-dispatch-components/dash-predefine-packages/dash-predefine-packages.component';
import { SalesdashCustomePackageComponent } from '../dash-dispatch-components/salesdash-custome-package/salesdash-custome-package.component';



@Component({
  selector: 'app-salesdash-orders',
  standalone: true,
  imports: [
    CommonModule,
    DashPredefinePackagesComponent,
    SalesdashCustomePackageComponent
  ],
  templateUrl: './salesdash-orders.component.html',
  styleUrl: './salesdash-orders.component.css'
})
export class SalesdashOrdersComponent{

  isPremade = true;


  constructor(
    // private dispatchService: DispatchService,
    private router: Router,
    // public tokenService: TokenService,
    // public permissionService: PermissionService,
  ) { }


  togglePackageType(isPremade: boolean) {
    this.isPremade = isPremade;
  }

  back(): void {
    this.router.navigate(['/dispatch']);
  }


}



