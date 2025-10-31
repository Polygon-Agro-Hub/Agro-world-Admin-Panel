import { Component, OnInit } from '@angular/core';
import { DispatchService } from '../../../../services/dispatch/dispatch.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../../services/token/services/token.service';
import { PermissionService } from '../../../../services/roles-permission/permission.service';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CountDownComponent } from '../../../../components/count-down/count-down.component';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-dispatch-additional-items',
  standalone: true,
  imports: [CommonModule, FormsModule, CountDownComponent, LoadingSpinnerComponent],
  templateUrl: './dispatch-additional-items.component.html',
  styleUrl: './dispatch-additional-items.component.css'
})
export class DispatchAdditionalItemsComponent implements OnInit {
  packageArr: PakageItem[] = [];
  orderDetails!: OrderDetails;
  selectProduct!: PakageItem;

  packageId!: number;
  isLoading: boolean = false;
  isPopupOpen: boolean = false;
  showCountdown: boolean = false;
  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';

  isLastOrder: boolean = false;
  isAllPacked: boolean = false;
  isShouldAllblock:boolean = true;


  ngOnInit(): void {
    this.packageId = this.route.snapshot.params['id'];
    this.isLastOrder = this.route.snapshot.queryParams['status'] === 'true' ? true : false;

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
    this.dispatchService.getAdditionalItemsForDispatch(this.packageId).subscribe(
      (res) => {
        this.packageArr = res.packageData;
        this.orderDetails = res.orderDetails
        this.isShouldAllblock = res.packageData.every((i:any) => i.isPacked === 1);
        this.isLoading = false
      }
    )
  }


  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  saveCheckedItems() {
    if (this.isLastOrder && this.isAllPacked) {
      this.showCountdown = true;
    } else {
      this.executeApiCall();
    }
  }

  onTimerCompleted() {
    this.showCountdown = false;
    this.executeApiCall(); 
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
    this.dispatchService.dispatchAdditionalItemData(updatedData, this.packageId, this.isLastOrder).subscribe(
      (res) => {
        this.isLoading = false;
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Packaging status has been changed successfully.',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.location.back();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Packaging status has been changed faild!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }

      },
      (err) => {
        console.error('Update failed:', err);
         Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Packaging status has been changed faild!',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
      }
    );
  }


  onCheckboxChange(item: PakageItem, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.isPacked = isChecked ? 1 : 0;

    const allPacked = this.packageArr.every(i => i.isPacked === 1);
    this.isAllPacked = allPacked;

    if (!allPacked) {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    } else {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    }
    
  }

}


interface PakageItem {
  id: number;
  qty: number;
  isPacked: number;
  price: number;
  discountedPrice: number;
  displayName: string;
  unit: string;
}

interface OrderDetails {
  invNo: number;
  orderId: number;
  additionalPrice: number;
}