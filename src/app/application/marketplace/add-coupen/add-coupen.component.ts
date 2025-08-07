import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-add-coupen',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './add-coupen.component.html',
  styleUrls: ['./add-coupen.component.css'],
})
export class AddCoupenComponent {
  coupenObj: Coupen = new Coupen();
  today: string = this.getTodayDate();
  checkPrecentageValueMessage: string = '';
  checkfixAmountValueMessage: string = '';

  constructor(private marketSrv: MarketPlaceService, private router: Router) {}



  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
  }).then((result) => {
    if (result.isConfirmed) {
      this.router.navigate(['market/action']);
    }
  });
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
      this.router.navigate(['market/action']);
    }
  });
}


  clearValidationMessages(): void {
    this.checkPrecentageValueMessage = '';
    this.checkfixAmountValueMessage = '';
  }

  getTodayDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  checkExpireDate() {
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
  // Reset messages
  this.clearValidationMessages();

  // Check required fields for all types
  if (
    !this.coupenObj.code ||
    !this.coupenObj.endDate ||
    !this.coupenObj.startDate ||
    !this.coupenObj.type
  ) {
    Swal.fire('Warning', 'Please fill in all the required fields', 'warning');
    return;
  }

  // Type-specific validations
  if (this.coupenObj.type === 'Percentage') {
    if (this.coupenObj.percentage === null || isNaN(this.coupenObj.percentage)) {
      this.checkPrecentageValueMessage = 'Percentage value is required';
      Swal.fire('Warning', 'Please fill Discount Percentage field', 'warning');
      return;
    }
  } else if (this.coupenObj.type === 'Fixed Amount') {
    if (this.coupenObj.fixDiscount === null || isNaN(this.coupenObj.fixDiscount)) {
      this.checkfixAmountValueMessage = 'Fix amount value is required';
      Swal.fire('Warning', 'Please fill Discount Amount field', 'warning');
      return;
    }
  }

  // Price limit validation if checkbox is checked
  if (this.coupenObj.checkLimit && !this.coupenObj.priceLimit) {
    Swal.fire('Warning', 'Please fill Price Limit field', 'warning');
    return;
  }

  // If all validations pass, save the coupon
  this.marketSrv.createCoupen(this.coupenObj).subscribe({
    next: (res) => {
      if (res.status) {
        Swal.fire({
          icon: 'success',
          title: 'Coupon Created',
          text: 'The coupon was created successfully!',
          confirmButtonText: 'OK',
        }).then(() => {
          this.coupenObj = new Coupen();
          this.router.navigate(['market/action/view-coupen']);
        });
      }
    },
    error: (err) => {
      if (err.error && err.error.error === 'Coupon with this code already exists') {
        // Show validation message under the code input
        this.checkPrecentageValueMessage = ''; // Clear other messages
        this.checkfixAmountValueMessage = ''; // Clear other messages
        Swal.fire('Error', 'Coupon with this code already exists', 'error');
      } else {
        Swal.fire('Error', err.error?.error || 'Coupon with this code already exists', 'error');
      }
    }
  });
}

  checkPrecentageValue(num: number) {
    if (num === null || isNaN(num)) {
      this.checkPrecentageValueMessage = 'Percentage value is required';
      return;
    }

    if (num < 0) {
      this.coupenObj.percentage = 0;
      this.checkPrecentageValueMessage = 'Cannot be negative number';
    } else if (num > 100) {
      this.coupenObj.percentage = 100;
      this.checkPrecentageValueMessage = 'Cannot be greater than 100';
    } else {
      this.checkPrecentageValueMessage = '';
    }
  }

  checkFixAmountValue(num: number) {
    if (num === null || isNaN(num)) {
      this.checkfixAmountValueMessage = 'Fix amount value is required';
      return;
    }

    if (num < 0) {
      this.coupenObj.fixDiscount = 0;
      this.checkfixAmountValueMessage = 'Cannot be negative number';
    } else {
      this.checkfixAmountValueMessage = '';
    }
  }

  preventNegative(e: KeyboardEvent) {
    // Prevent minus key, comma, and period (for negative numbers in some locales)
    if (e.key === '-' || e.key === ',' || e.key === '.') {
      e.preventDefault();
    }

    // Prevent pasting negative numbers
    if (e.ctrlKey && e.key === 'v') {
      setTimeout(() => {
        if (this.coupenObj.percentage < 0) {
          this.coupenObj.percentage = 0;
        }
      }, 0);
    }
  }

  onCodeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const trimmedValue = input.value.trimStart();
    
    if (input.value !== trimmedValue) {
      input.value = trimmedValue;
      this.coupenObj.code = trimmedValue;
    }
  }
}

class Coupen {
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