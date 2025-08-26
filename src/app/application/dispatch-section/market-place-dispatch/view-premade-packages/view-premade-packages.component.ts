import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';

@Component({
  selector: 'app-view-premade-packages',
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './view-premade-packages.component.html',
  styleUrl: './view-premade-packages.component.css'
})
export class ViewPremadePackagesComponent implements OnInit {
  packageObj!: Package;
  orderId!: number;
  invNo: string = '';
  hasData = false;
  isLoading: boolean = false;


  ngOnInit(): void {
    this.orderId = this.route.snapshot.params['id'];
    this.invNo = this.route.snapshot.params['inv'];
    this.fetchData();
  }

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute
  ) { }

  fetchData() {
    this.isLoading = true;
    this.dispatchService.getMarketPlacePreMadePackagesItems(this.orderId).subscribe(
      (res) => {
        this.packageObj = res
        this.isLoading = false
      }
    )
  }

  navigateDispatchItems(id: number, status: boolean = false, price: number, packageName: string) {
    this.router.navigate([`/dispatch/dispatch-package/${id}/${this.orderId}`], {
    queryParams: { status: status, price: price , invNo: this.invNo, packageName: packageName }
  })
  }

  navigateDispatchAdditionalItems(id: number, status:boolean) {
  this.router.navigate([`/dispatch/dispatch-additional-items/${id}`], {
    queryParams: { status: status }
  })
}

  checkPackageLastOrderStatus(id:number, arrayIndex: number = 0, price: number, packageName: string = '') {
    let allPackagesCompleted = true;
    let additionalItemsCompleted = true;

      // Filter out the package at arrayIndex and check all others
      allPackagesCompleted = this.packageObj.packageData
        .filter((pkg, index) => index !== arrayIndex) 
        .every(pkg => pkg.packStatus === 'Completed');
    

    if (this.packageObj.additionalData &&
      this.packageObj.additionalData.packStatus !== null ) {
      additionalItemsCompleted = (this.packageObj.additionalData.packStatus === 'Completed');
      console.log("additional hit->",additionalItemsCompleted);
      
    }

    const finalStatus = allPackagesCompleted && additionalItemsCompleted;

    console.log('All packages completed (excluding index', arrayIndex, '):', allPackagesCompleted);
    console.log('Additional items completed:', additionalItemsCompleted);
    console.log('Composite status:', finalStatus);

    this.navigateDispatchItems(id,finalStatus, price, packageName)
  }

  checkAdditionalLastOrderStatus(id:number) {
    let allPackagesCompleted = true;
    let additionalItemsCompleted = true;

      // Filter out the package at arrayIndex and check all others
      allPackagesCompleted = this.packageObj.packageData
        .every(pkg => pkg.packStatus === 'Completed');
    
    if (this.packageObj.additionalData &&
      this.packageObj.additionalData.packStatus !== null ) {
      additionalItemsCompleted = (this.packageObj.additionalData.packStatus === 'Completed');
      console.log("additional hit->",additionalItemsCompleted);
      
    }

    const finalStatus = allPackagesCompleted && additionalItemsCompleted;

    console.log('All packages completed (excluding index', '):', allPackagesCompleted);
    console.log('Additional items completed:', additionalItemsCompleted);
    console.log('Composite status:', finalStatus);

    this.navigateDispatchAdditionalItems(id,finalStatus)
  }

}

interface Items {
  orderId: number;
  name: string;
  price: number;
  packStatus: string;
  packageId: number;
}

interface Package {
  packageData: Items[];
  additionalData: Items;
}
