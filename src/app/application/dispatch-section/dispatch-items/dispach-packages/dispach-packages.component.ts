import { Component, OnInit } from '@angular/core';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { CommonModule, Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CountDownComponent } from '../../../../components/count-down/count-down.component';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dispach-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, CountDownComponent, LoadingSpinnerComponent],
  templateUrl: './dispach-packages.component.html',
  styleUrl: './dispach-packages.component.css'
})
export class DispachPackagesComponent implements OnInit {
  packageArr: PakageItem[] = [];
  productArr: MarketPlaceItems[] = [];
  selectProduct!: PakageItem;
  newProductObj!: MarketPlaceItems;
  packageId!: number;
  orderId!: number;

  isLoading: boolean = true;
  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';

  showCountdown: boolean = false;

  isPopupOpen: boolean = false;


  ngOnInit(): void {
    this.packageId = this.route.snapshot.params['id']
    this.orderId = this.route.snapshot.params['orderId']
    this.fetchData();
  }

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute,
    private location: Location,

  ) { }


  fetchData() {
    this.isLoading = true;
    this.dispatchService.getPackageItemsForDispatch(this.packageId, this.orderId).subscribe(
      (res) => {
        // this.packageObj = res
        this.packageArr = res.packageData;
        this.productArr = res.marketplaceItems
        this.isLoading = false
      }
    )
  }
  onCancel() {

  }

  saveCheckedItems() {
    this.showCountdown = true;
  }

  onTimerCompleted() {
    this.showCountdown = false;
    this.executeApiCall(); // Perform the API call
  }

  onTimerCancelled() {
    this.showCountdown = false;
  }

  private executeApiCall() {
    this.isLoading = true;

    const updatedData = this.packageArr.map(item => ({

      id: item.id,
      isPacked: item.isPacked,
      qty: item.qty,
      price: item.price,

    }));
    this.dispatchService.dispatchPackageItemData(updatedData).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.status) {
          console.log('Updated successfully:', res);
          Swal.fire('Success', 'Order dispatched successfully!', 'success');
          // this.router.navigate(['/dispatch/salesdash-orders']);
          this.location.back();
        } else {
          Swal.fire('Error', 'Order dispatched Faild!', 'error');

        }

      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
      }
    );
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

  openPopUp(item: PakageItem) {
    this.isPopupOpen = true;
    this.selectProduct = item;
    // this.newProductObj.displayName = item.displayName;
    // this.newProductObj.id = item.
  }
  onCancelPopup() {
    this.isPopupOpen = false;
  }

  replaceProduct() {

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

interface MarketPlaceItems {
  id: number
  varietyId: number
  displayName: string
  normalPrice: number
  discountedPrice: number
  discount: number
  unitType: number
  startValue: number
  changeby: number
  isExcluded: Boolean
}
