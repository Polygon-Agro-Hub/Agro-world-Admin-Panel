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
    if (this.isValid) {
      this.checkPrecentageValueMessage = 'Percentage Value is required';
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
      Swal.fire('Warning', 'Please fill Discount Percentage field', 'warning');
      return;
    }

    if (this.coupenObj.type === 'Fixed Amount' && !this.coupenObj.fixDiscount) {
      Swal.fire('Warning', 'Please fill Discount Amount field', 'warning');
      return;
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
      this.isValid = true;
      this.checkfixAmountValueMessage = 'Cannot be negative number';
    } else {
      this.isValid = false;
      this.checkfixAmountValueMessage = '';
    }
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
