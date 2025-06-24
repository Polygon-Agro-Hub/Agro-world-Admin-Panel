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


@Component({
  selector: 'app-additional-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    DropdownModule,
    NgxPaginationModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './additional-items.component.html',
  styleUrl: './additional-items.component.css'
})
export class AdditionalItemsComponent implements OnInit {

  id!: number | null;
  invNo!: string | null;
  total!: number;
  name!: string;
  fullTotal!: number;
  additionalItemsArr: AdditionalItems[] = [];
  // productItemsArr: ProductItems[] = [];
  totalAdditionalItems!: number;

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
      this.name = params['name'] || '';
      this.fullTotal = params['fullTotal'] ? +params['fullTotal'] : 0;
      console.log(this.id);
    });

    this.getAdditionalItemData(this.id!);
    // this.getAllProducts();

  }

  getAdditionalItemData(id: number) {
    this.isLoading = true;
  
    this.dispatchService.getAdditionalItems(id).subscribe(
      (response) => {
        console.log(response);
  
        // Extract product IDs
        // this.productIdsArr = response.items.map((item: packageItems) => item.productId);
        // console.log('productIDs', this.productIdsArr)

        this.packedAll = response.items.every((item: AdditionalItems) => item.packedStatus === 1);
        console.log('All Packed:', this.packedAll);

        // Map the full item objects
        this.additionalItemsArr = response.items.map((item: AdditionalItems) => {
          return {
            ...item,
            quantity: item.quantity,
            price: item.price
          };
        });
  
        this.totalAdditionalItems = response.total;

        if (!this.packedAll) {
          this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
          this.validationSuccessMessage = ''
        } else {
          this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
          this.validationFailedMessage = ''
        }

        this.isLoading = false;

        console.log('Array:', this.additionalItemsArr);
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

  onCheckboxChange(item: AdditionalItems, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    item.packedStatus = isChecked ? 1 : 0;

    const allPacked = this.additionalItemsArr.every(i => i.packedStatus === 1);

    if (!allPacked) {
      this.validationFailedMessage = "Unchecked items remain. Saving now keeps the order in 'Opened' Status.";
      this.validationSuccessMessage = '';
    } else {
      this.validationSuccessMessage = "All checked. Order will move to 'Completed' on save.";
      this.validationFailedMessage = '';
    }
    console.log(this.additionalItemsArr);
  }

  saveCheckedItems() {
    this.isLoading = true;

    const updatedData = this.additionalItemsArr.map(item => ({

      productId: item.productId,
      packedStatus: item.packedStatus,

    }));

    console.log('data', updatedData )
    this.dispatchService.updateAdditionalItemData(updatedData, this.id!).subscribe(
      (res) => {
        this.isLoading = false;
        console.log('Updated successfully:', res);
        Swal.fire('Success', 'Product Updated Successfully', 'success');
        this.router.navigate(['/dispatch/salesdash-orders']);
      },
      (err) => {
        console.error('Update failed:', err);
        Swal.fire('Error', 'Product Update Unsuccessfull', 'error');
      }
    );
  }

}

class AdditionalItems {
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
