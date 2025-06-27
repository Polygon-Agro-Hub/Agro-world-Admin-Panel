import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { Router, ActivatedRoute } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { DispatchService } from '../../../services/dispatch/dispatch.service';
import Swal from 'sweetalert2';
import { CountDownComponent } from '../../../components/count-down/count-down.component';

@Component({
  selector: 'app-custom-additional-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
    CountDownComponent,
  ],
  templateUrl: './custom-additional-items.component.html',
  styleUrl: './custom-additional-items.component.css'
})
export class CustomAdditionalItemsComponent {

  id!: number | null;
  invNo!: string | null;
  total!: number;
  name!: string;
  fullTotal!: number;
  customAdditionalItemsArr: CustomAdditionalItems[] = [];
  // productItemsArr: ProductItems[] = [];
  totalCustomAdditionalItems!: number;

  selectedProductId: number | null = null;
  quantity: number | null = null;
  unitPrice: number | null = null;
  totalPrice: number | null = null;

  previousProductId!: number;
  previousDisplayName!: string;
  previousQuantity!: number;
  previousPrice!: number;

  productIdsArr: number[] = [];


  validationFailedMessage: string = '';
  validationSuccessMessage: string = '';
  packedAll: boolean = false;

  isLoading: boolean = false;
  isPopupOpen: boolean = false;

  showCountdown: boolean = false;
  // timeLeft: number = 0;
  

  constructor(
    private dispatchService: DispatchService,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'] ? +params['id'] : null;
      this.invNo = params['invNo'] || null;
      this.total = params['total'] ? +params['total'] : 0;
      this.fullTotal = params['fullTotal'] ? +params['fullTotal'] : 0;
      console.log(this.id);
    });

    this.getCustomAdditionalItemData(this.id!);
    // this.getAllProducts();

  }

  getCustomAdditionalItemData(id: number) {
    this.isLoading = true;

    this.dispatchService.getCustomAdditionalItems(id).subscribe(
      (response) => {
        console.log(response);

        this.packedAll = response.items.every((item: CustomAdditionalItems) => item.packedStatus === 1);
        console.log('All Packed:', this.packedAll);

        // Map the full item objects
        this.customAdditionalItemsArr = response.items.map((item: CustomAdditionalItems) => {
          return {
            ...item,
            quantity: item.quantity,
            price: item.price
          };
        });

        this.totalCustomAdditionalItems = response.total;

        if (!this.packedAll) {
          this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
          this.validationSuccessMessage = ''
        } else {
          this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
          this.validationFailedMessage = ''
        }

        this.isLoading = false;

        console.log('Array:', this.customAdditionalItemsArr);
      },
      (error) => {
        console.error('Error fetching package items:', error);
        if (error.status === 401) {
          // Handle unauthorized error if needed
        }
        this.isLoading = false;
      }
    );
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
        this.isPopupOpen = false;
        this.router.navigate(['/dispatch/salesdash-orders']);
      }
    })
  };

  onCheckboxChange(item: CustomAdditionalItems, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.packedStatus = isChecked ? 1 : 0;

    const allPacked = this.customAdditionalItemsArr.every(i => i.packedStatus === 1);

    if (!allPacked) {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    } else {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    }
    console.log(this.customAdditionalItemsArr);
  }

  saveCheckedItems() {
    this.showCountdown = true;
  }
  
  // Called when countdown finishes or user clicks "Mark as Completed"
  onTimerCompleted() {
    this.showCountdown = false;
    this.executeApiCall(); // Perform the API call
  }
  
  // Called when user clicks "Go Back to Edit"
  onTimerCancelled() {
    this.showCountdown = false;
    // Optionally: reset form or show editing state again
  }
  
  private executeApiCall() {
    this.isLoading = true;
  
    const updatedData = this.customAdditionalItemsArr.map(item => ({
      productId: item.productId,
      packedStatus: item.packedStatus,
    }));
  
    this.dispatchService.updateCustomAdditionalItemData(updatedData, this.id!).subscribe(
      (res) => {
        this.isLoading = false;
        Swal.fire('Success', 'Product Updated Successfully', 'success');
        this.router.navigate(['/dispatch/salesdash-orders']);
      },
      (err) => {
        this.isLoading = false;
        Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
      }
    );
  }

}

class CustomAdditionalItems {
  processOrderId!: number;
  orderId!: number;
  invNo!: string;
  quantity!: number;
  price!: number;
  productId!: number;
  isPacking!: number;
  productName!: string;
  unitType!: string;
  total!: number;
  discountedPrice!: number;
  packedStatus!: number;
}