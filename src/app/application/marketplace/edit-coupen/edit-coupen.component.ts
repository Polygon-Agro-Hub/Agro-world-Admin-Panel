import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-edit-coupen',
  standalone: true,
  imports: [CommonModule, FormsModule, CalendarModule],
  templateUrl: './edit-coupen.component.html',
  styleUrl: './edit-coupen.component.css',
})
export class EditCoupenComponent {
  coupenObj: Coupen = new Coupen();
  today: Date = new Date();
  isValid: boolean = true;
  checkPrecentageValueMessage: string = '';
  checkfixAmountValueMessage: string = '';
  coupenId: number | null = null;
  isLoading: boolean = false;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Set time to 00:00:00 for accurate date comparison
    this.today.setHours(0, 0, 0, 0);
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.coupenId = idParam !== null ? Number(idParam) : null;
    console.log('Coupon ID:', this.coupenId);

    if (this.coupenId) {
      this.fetchCoupen(this.coupenId);
    }
  }

  fetchCoupen(coupenId: number): void {
    this.isLoading = true;
    this.marketSrv
      .getCoupen(coupenId)
      .subscribe(
        (res) => {
          console.log(res);
          if (res.status) {
            const data = res.result[0];

            // Convert string dates to Date objects
            if (data.startDate) {
              data.startDate = new Date(data.startDate);
              // Normalize time to midnight for comparison
              data.startDate.setHours(0, 0, 0, 0);
            }

            if (data.endDate) {
              data.endDate = new Date(data.endDate);
              // Normalize time to midnight for comparison
              data.endDate.setHours(0, 0, 0, 0);
            }

            this.coupenObj = data;
            console.log('coupenObj', this.coupenObj);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: res.message || 'Failed to fetch coupon details.',
            });
            this.router.navigate(['/market/action/view-coupen']);
          }
        },
        (error) => {
          console.error('Error fetching coupon:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch coupon details.',
          });
          this.router.navigate(['/market/action/view-coupen']);
        }
      )
      .add(() => {
        this.isLoading = false;
      });
  }

  back(): void {
    this.router.navigate(['market/action/view-coupen']);
  }

  checkExpireDate() {
    if (!this.coupenObj.startDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Start Date Required',
        text: 'Please select a Start Date before setting an Expiration Date.',
        confirmButtonText: 'OK',
      }).then(() => {
        this.coupenObj.endDate = null;
      });
    } else if (
      this.coupenObj.endDate &&
      this.coupenObj.endDate < this.coupenObj.startDate
    ) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Expire Date',
        text: 'Expire Date cannot be earlier than Start Date!',
        confirmButtonText: 'OK',
      }).then(() => {
        this.coupenObj.endDate = null;
      });
    }
  }

  checkStartDate() {
    if (this.coupenObj.startDate && this.coupenObj.startDate < this.today) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Start Date',
        text: 'Start Date cannot be a past date!',
        confirmButtonText: 'OK',
      }).then(() => {
        this.coupenObj.startDate = null;
      });
    }
  }

  onSubmit() {
  // Reset validation messages
  this.checkPrecentageValueMessage = '';
  this.checkfixAmountValueMessage = '';
 const missingFields = [];
  // Validate required fields
  if (!this.coupenObj.code) missingFields.push('Code');
  if (!this.coupenObj.startDate) missingFields.push('Start Date');
  if (!this.coupenObj.endDate) missingFields.push('End Date');
  if (!this.coupenObj.type) missingFields.push('Type');

  if (missingFields.length > 0) {
    Swal.fire(
      'Warning',
      `Please fill in the following required field(s): ${missingFields.join(', ')}`,
      'warning'
    );
    return;
  }

  // Validate type-specific fields
  if (this.coupenObj.type === 'Percentage') {
    if (this.coupenObj.percentage == null || isNaN(this.coupenObj.percentage)) {
      this.checkPrecentageValueMessage = 'Percentage value is required';
      Swal.fire('Warning', 'Please fill Discount Percentage field', 'warning');
      return;
    } else if (this.coupenObj.percentage < 0 || this.coupenObj.percentage > 100) {
      this.checkPrecentageValue(this.coupenObj.percentage);
      Swal.fire('Warning', 'Please enter a valid percentage (0-100)', 'warning');
      return;
    }
  }

  if (this.coupenObj.type === 'Fixed Amount') {
    if (this.coupenObj.fixDiscount == null || isNaN(this.coupenObj.fixDiscount)) {
      this.checkfixAmountValueMessage = 'Fix amount value is required';
      Swal.fire('Warning', 'Please fill Discount Amount field', 'warning');
      return;
    } else if (this.coupenObj.fixDiscount < 0) {
      this.checkFixAmountValue(this.coupenObj.fixDiscount);
      Swal.fire('Warning', 'Please enter a valid discount amount', 'warning');
      return;
    }
  }

  if (this.coupenObj.checkLimit && !this.coupenObj.priceLimit) {
    Swal.fire('Warning', 'Please fill Price Limit field', 'warning');
    return;
  }

  // Prepare the data for API call
  const payload = {
    ...this.coupenObj,
    startDate: this.formatDateForAPI(this.coupenObj.startDate),
    endDate: this.formatDateForAPI(this.coupenObj.endDate),
  };

  this.isLoading = true;
  this.marketSrv
    .updateCoupen(payload)
    .subscribe({
      next: (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Coupon Updated',
            text: 'The coupon was updated successfully!',
            confirmButtonText: 'OK',
          }).then(() => {
            this.router.navigate(['market/action/view-coupen']);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message || 'Failed to update coupon.',
          });
        }
      },
      error: (error) => {
        console.error('Error updating coupon:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update coupon.',
        });
      },
    })
    .add(() => {
      this.isLoading = false;
    });
}



  private formatDateForAPI(date: Date | null): string | null {
    if (!date) return null;
    return date.toISOString().split('T')[0];
  }

  onCancel() {
    this.coupenObj = new Coupen();
  }

  checkPrecentageValue(num: number) {
  if (num == null || isNaN(num)) {
    this.checkPrecentageValueMessage = 'Percentage value is required';
  } else if (num < 0) {
    this.checkPrecentageValueMessage = 'Cannot be a negative number';
  } else if (num > 100) {
    this.checkPrecentageValueMessage = 'Cannot be greater than 100';
  } else {
    this.checkPrecentageValueMessage = '';
  }
}


  checkFixAmountValue(num: number) {
  if (num == null || isNaN(num)) {
    this.checkfixAmountValueMessage = 'Fix amount value is required';
  } else if (num < 0) {
    this.checkfixAmountValueMessage = 'Cannot be negative number';
  } else {
    this.checkfixAmountValueMessage = '';
  }
}

validateDecimalInput(event: Event, field: 'priceLimit' | 'fixDiscount' | 'percentage') {
  const input = event.target as HTMLInputElement;
  let value = input.value;

  // Regex to match numbers with up to 2 decimal places
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



  onCodeInput(event: any): void {
    const input = event.target;
    const originalValue = input.value;
    const trimmedValue = originalValue.trimStart(); // Remove only leading spaces

    if (originalValue !== trimmedValue) {
      // Update the model and input field
      this.coupenObj.code = trimmedValue;
      input.value = trimmedValue;

      // Maintain cursor position after trimming
      const cursorPosition =
        input.selectionStart - (originalValue.length - trimmedValue.length);
      setTimeout(() => {
        input.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    } else {
      this.coupenObj.code = trimmedValue;
    }
  }
}

class Coupen {
  id!: number;
  code!: string;
  type: string = 'Percentage';
  percentage!: number;
  status: string = 'Disabled';
  startDate: Date | null = null;
  endDate: Date | null = null;
  checkLimit: boolean = false;
  priceLimit!: number;
  fixDiscount!: number;

  constructor() {
    // Initialize with default values if needed
    this.status = 'Disabled';
    this.type = 'Percentage';
    this.checkLimit = false;
  }
}
