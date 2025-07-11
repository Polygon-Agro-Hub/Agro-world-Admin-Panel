import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-coupen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-coupen.component.html',
  styleUrl: './edit-coupen.component.css'
})
export class EditCoupenComponent {

  coupenObj: Coupen = new Coupen();
  today: string = this.getTodayDate();
  isValid: boolean = true;
  checkPrecentageValueMessage: string = '';
  checkfixAmountValueMessage: string = '';
  coupenId: number | null = null;
  isLoading: boolean = false;

  constructor(private marketSrv: MarketPlaceService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.coupenId = idParam !== null ? Number(idParam) : null;
    console.log('Coupon ID:', this.coupenId);

    this.fetchCoupen(this.coupenId!);
  }


  fetchCoupen(coupenId: number): void {
    this.isLoading = true;
    this.marketSrv.getCoupen(this.coupenId!).subscribe(
      (res) => {
        console.log(res);
        if (res.status) {
          const data = res.result[0];
  
          // Format dates to YYYY-MM-DD
          if (data.startDate) {
            data.startDate = new Date(data.startDate).toISOString().split('T')[0];
          }
  
          if (data.endDate) {
            data.endDate = new Date(data.endDate).toISOString().split('T')[0];
          }
  
          this.coupenObj = data;
  
          console.log('coupenObj', this.coupenObj);
          this.isLoading = false;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Failed to fetch product type details.',
          });
          this.isLoading = false;
          this.router.navigate(['/market/action/view-product-types']);
        }
      }
    );
  }
  

  // next: (response) => {
  //   console.log('coupens fetched fetched:', response);

  //   if (response.success ) {
  //     this.coupenObj = response.result
  //     console.log('coupen obj', this.coupenObj)
  //   }
  //   this.isLoading = false;
  // },
  // error: (error) => {
  //   console.error('Error fetching companies:', error);
  //   this.isLoading = false;
  //   Swal.fire({
  //     icon: 'error',
  //     title: 'Error',
  //     text: 'Failed to load companies',
  //   });
  // },

  back(): void {
    this.router.navigate(['market/action']);
  }
  
  getTodayDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  checkExpireDate() {
    console.log('enddata', this.coupenObj.startDate)
    if (!this.coupenObj.startDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Start Date Required',
        text: 'Please select a Start Date before setting an Expiration Date.',
        confirmButtonText: 'OK',
      }).then(() => {
        this.coupenObj.endDate = '';
      });
    } else {
      if (this.coupenObj.endDate < this.coupenObj.startDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Expire Date',
          text: 'Expire Date cannot be earlier than Start Date!',
          confirmButtonText: 'OK',
        }).then(() => {
          this.coupenObj.endDate = '';
        });
      }
    }
  }

  checkStartDate() {
    if (this.coupenObj.startDate < this.today) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Start Date',
        text: 'Start Date cannot be a past date!',
        confirmButtonText: 'OK',
      }).then(() => {
        this.coupenObj.startDate = '';
      });
    }
  }

  onSubmit() {
    if(this.isValid){
      this.checkPrecentageValueMessage = 'Precentage value is required';
      this.checkfixAmountValueMessage = 'Fix amount value is required';
      return;
    }
    if (
      !this.coupenObj.code ||
      !this.coupenObj.endDate ||
      !this.coupenObj.startDate ||
      !this.coupenObj.type
    ) {
      Swal.fire('Warning', 'Please fill in all the required fields', 'warning');
      return;
    }

    if (this.coupenObj.type === 'Percentage' && !this.coupenObj.percentage) {
      Swal.fire('Warning', 'Please fill Discount Persentage fields', 'warning');
      return;
    }

    if (this.coupenObj.type === 'Fixed Amount' && !this.coupenObj.fixDiscount) {
      Swal.fire('Warning', 'Please fill Discount Amount fields', 'warning');
      return;
    }

    if (this.coupenObj.checkLimit && !this.coupenObj.priceLimit) {
      Swal.fire('Warning', 'Please fill Price Limit fields', 'warning');
      return;
    }

    console.log('coupen obj', this.coupenObj)

    this.marketSrv.updateCoupen(this.coupenObj).subscribe((res) => {
      if (res.status) {
        Swal.fire({
          icon: 'success',
          title: 'Coupen Updated',
          text: 'The coupen Updated successfull!',
          confirmButtonText: 'OK',
        }).then(() => {
          this.coupenObj = new Coupen();
          this.router.navigate(['market/action/view-coupen']);
        });
      }
    });
  }

  onCancel() {
    this.coupenObj = new Coupen();
  }

  navigateDashboard(id: number) {
    this.router.navigate([`market/action/edit-coupen/${id}`]);
  }

  checkPrecentageValue(num: number) {
    console.log('percentage', this.coupenObj.percentage);
  
    if (num == null || isNaN(num)) {
      this.isValid = true;
      this.checkPrecentageValueMessage = 'Percentage value is required';
    } else if (num < 0) {
      this.isValid = true;
      this.checkPrecentageValueMessage = 'Cannot be a negative number';
    } else if (num > 100) {
      this.isValid = true;
      this.checkPrecentageValueMessage = 'Cannot be greater than 100';
    } else {
      this.isValid = false; 
      this.checkPrecentageValueMessage = '';
    }
  }
  


  checkFixAmountValue(num: number) {
    if (num == null || isNaN(num)) {
      this.isValid = true;
      this.checkfixAmountValueMessage = 'Fix amount value is required';
    } else if (num < 0) {
      this.isValid = true
      this.checkfixAmountValueMessage = 'Can not be negative number';
    } else {
      this.isValid = false
      this.checkfixAmountValueMessage = '';
    }

  }

}

class Coupen {
  id!: number;
  code!: string;
  type: string = 'Percentage';
  percentage!: number;
  status: string = 'Disabled';
  startDate!: string;
  endDate!: string;
  checkLimit: boolean = false;
  priceLimit!: number;
  fixDiscount!: number;
}
