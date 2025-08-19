import { Component, OnInit } from '@angular/core';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dispach-packages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dispach-packages.component.html',
  styleUrl: './dispach-packages.component.css'
})
export class DispachPackagesComponent implements OnInit {
  packageArr: PakageItem[] = [];
  packageId!: number;
  isLoading: boolean = true;
  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';

  ngOnInit(): void {
    this.packageId = this.route.snapshot.params['id']
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
    this.dispatchService.getPackageItemsForDispatch(this.packageId).subscribe(
      (res) => {
        // this.packageObj = res
        this.packageArr = res;
        this.isLoading = false
      }
    )
  }
  onCancel() {

  }

  saveCheckedItems() {

  }



  onCheckboxChange(item: PakageItem, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.isPacked = isChecked ? 1 : 0;

    const allPacked = this.packageArr.every(i => i.isPacked === 1);

    if (!allPacked) {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    } else {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    }
    // console.log(this.packageItemsArr);
  }

}

interface PakageItem {
  id: number;
  qty: number;
  isPacked: number;
  price: number;
  discountedPrice: number;
  displayName: string;
}
