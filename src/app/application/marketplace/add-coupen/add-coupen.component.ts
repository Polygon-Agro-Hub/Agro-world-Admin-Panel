import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';

@Component({
  selector: 'app-add-coupen',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-coupen.component.html',
  styleUrls: ['./add-coupen.component.css']
})
export class AddCoupenComponent {
  coupenObj: Coupen = new Coupen();
  today: string = this.getTodayDate();

  constructor(private marketSrv: MarketPlaceService) { }

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
        confirmButtonText: 'OK'
      }).then(() => {
        this.coupenObj.endDate = '';
      });
    } else {
      if (this.coupenObj.endDate < this.coupenObj.startDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Expire Date',
          text: 'Expire Date cannot be earlier than Start Date!',
          confirmButtonText: 'OK'
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
        confirmButtonText: 'OK'
      }).then(() => {
        this.coupenObj.startDate = '';
      });
    }
  }

  onSubmit() {
    if (!this.coupenObj.code || !this.coupenObj.endDate || !this.coupenObj.startDate || !this.coupenObj.type) {
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


    this.marketSrv.createCoupen(this.coupenObj).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Coupen Created',
            text: 'The coupen created successfull!',
            confirmButtonText: 'OK'
          }).then(() => {
            this.coupenObj = new Coupen()
          });
        }
      }
    )


  }

  onCancel() {
    this.coupenObj = new Coupen();
  }


}

class Coupen {
  code!: string;
  type: string = 'Percentage'
  percentage!: string;
  status: string = 'Disabled';
  startDate!: string;
  endDate!: string;
  checkLimit: boolean = false;
  priceLimit!: number
  fixDiscount!: number
}
