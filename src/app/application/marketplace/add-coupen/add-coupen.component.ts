import { CommonModule, Location } from '@angular/common';
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
  minDate: Date = new Date();

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private location: Location
  ) { }



  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // this.router.navigate(['market/action']);
        this.location.back();
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // this.router.navigate(['market/action']);
        this.location.back();

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
    this.clearValidationMessages();


    const missingFields: string[] = [];

    if (!this.coupenObj.code) missingFields.push('Code is Required');
    if (!this.coupenObj.startDate) missingFields.push('Start Date is Required');
    if (!this.coupenObj.endDate) missingFields.push('Expire Date is Required');
    if (!this.coupenObj.type) missingFields.push('Type is Required');


    if (this.coupenObj.type === 'Percentage') {
      if (this.coupenObj.percentage === null || isNaN(this.coupenObj.percentage)) {
        missingFields.push('Discount Percentage is Required');
        this.checkPrecentageValueMessage = 'Discount Percentage is required';
      }
    } else if (this.coupenObj.type === 'Fixed Amount') {
      if (this.coupenObj.fixDiscount === null || isNaN(this.coupenObj.fixDiscount)) {
        missingFields.push('Discount Amount is Required');
        this.checkfixAmountValueMessage = 'Discount Amount is required';
      }
    }

    console.log(!this.coupenObj.priceLimit,"djdjdjjd");
    
    if (this.coupenObj.checkLimit && !this.coupenObj.priceLimit) {
      if(this.coupenObj.priceLimit === 0) missingFields.push('Price limit must be greater than 0');
      else missingFields.push('Price Limit is Required');
    }

    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
      missingFields.forEach((field) => {
        errorMessage += `<li>${field}</li>`;
      });
      errorMessage += '</ul></div>';

      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Information',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to create this coupon?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create it!',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.coupenObj.startDate = this.formatDateForAPI(this.DateConverter(this.coupenObj.startDate));
        this.coupenObj.endDate = this.formatDateForAPI(this.DateConverter(this.coupenObj.endDate));
        this.marketSrv.createCoupen(this.coupenObj).subscribe({
          next: (res) => {
            if (res.status) {
              Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'The coupon was created successfully!',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              }).then(() => {
                this.coupenObj = new Coupen();
                this.router.navigate(['market/action/view-coupen']);
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Submission Failed',
                text: res.error || 'Failed to create coupon',
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
            }
          },
          error: (err) => {
            let errorMessage = 'An unexpected error occurred.';

            if (err.error && err.error.error) {
              errorMessage = err.error.error;
            } else if (err.status === 400) {
              errorMessage = 'Invalid data. Please check your inputs.';
            } else if (err.status === 401) {
              errorMessage = 'Unauthorized. Please log in again.';
            } else if (err.status === 409) {
              errorMessage = 'A coupon with this code already exists.';
            } else if (err.status === 500) {
              errorMessage = 'Server error. Please try again later.';
            }else{
              errorMessage = `${err.error}`;
            }

            this.checkPrecentageValueMessage = '';
            this.checkfixAmountValueMessage = '';

            Swal.fire({
              icon: 'error',
              title: 'Submission Failed',
              text: errorMessage,
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        });
      }
    });
  }


  validateDecimalInput(event: Event, field: 'priceLimit' | 'fixDiscount' | 'percentage') {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    const regex = /^\d+(\.\d{0,2})?$/;

    if (value === '') {
      this.coupenObj[field] = null!;
      return;
    }

    if (!regex.test(value)) {
      while (value.length > 0 && !regex.test(value)) {
        value = value.slice(0, -1);
      }
      input.value = value;
    }

    this.coupenObj[field] = value ? parseFloat(value) : null!;
  }


  checkPrecentageValue(num: number) {
    if (num === null || isNaN(num)) {
      this.checkPrecentageValueMessage = 'Percentage value is required';
      return;
    }

    if (num < 0) {
      // this.coupenObj.percentage = 0;
      this.checkPrecentageValueMessage = 'Cannot be negative number';
    } else if (num > 100 || num === 0) {
      // this.coupenObj.percentage = 100;
      this.checkPrecentageValueMessage = 'Enter a value between 1 and 100';
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
    if (e.key === '-' || e.key === ',') {
      e.preventDefault();
    }


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

  DateConverter(date: any): Date {
    if (!date) {
      return new Date();
    }

    // Handle if date is already a Date object
    if (date instanceof Date) {
      return date;
    }

    // Convert string to Date
    return new Date(date);
  }

  private formatDateForAPI(date: Date | null): string {
    if (!date) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`; 
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