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

  navigateDispatchItems(id:number){
    this.router.navigate([`/dispatch/dispatch-package/${id}`])
  }


}

interface Items {
  orderId: number;
  name: string;
  price: number;
  packStatus: string;
  packageId:number;
}

interface Package {
  packageData: Items[];
  additionalData: Items;
}
