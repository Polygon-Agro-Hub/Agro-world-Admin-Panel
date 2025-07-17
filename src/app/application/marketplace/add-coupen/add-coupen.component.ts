import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-coupen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-coupen.component.html',
  styleUrls: ['./add-coupen.component.css'],
})
export class AddCoupenComponent {
  coupenObj: Coupen = new Coupen();
  today: string = this.getTodayDate();
  isValid: boolean = true;
  checkPrecentageValueMessage: string = '';
  checkfixAmountValueMessage: string = '';

  constructor(private marketSrv: MarketPlaceService, private router: Router) { }

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

    this.marketSrv.createCoupen(this.coupenObj).subscribe((res) => {
      if (res.status) {
        Swal.fire({
          icon: 'success',
          title: 'Coupen Created',
          text: 'The coupen created successfull!',
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

  checkPrecentageValue(num: number) {
    if (num < 0) {
      this.isValid = true
      this.checkPrecentageValueMessage = 'Can not be negative number';
    } else if (num > 100) {
      this.isValid = true
      this.checkPrecentageValueMessage = 'Can not be greater than 100';
    } else {
      this.isValid = false
      this.checkPrecentageValueMessage = 'Precentage value is required';
    }
  }


  checkFixAmountValue(num: number) {
    if (num < 0) {
      this.isValid = true
      this.checkfixAmountValueMessage = 'Can not be negative number';
    } else {
      this.isValid = false
      this.checkfixAmountValueMessage = 'Fix amount value is required';
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
