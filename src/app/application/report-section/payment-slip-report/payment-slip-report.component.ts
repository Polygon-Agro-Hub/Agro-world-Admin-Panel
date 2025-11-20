import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { PaymentSlipReportService } from '../../../services/reports/payment-slip-report.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-slip-report',
  standalone: true,
  imports: [CommonModule, CalendarModule, NgxPaginationModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './payment-slip-report.component.html',
  styleUrl: './payment-slip-report.component.css',
})
export class PaymentSlipReportComponent {
  todayDate!: string;
  payments!: Payment[];
  officerId!: number;
  total!: number;
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  createdDate: Date = new Date(); 
  isTableVisible: boolean = true;
  hasData: boolean = true;
  searchNIC: string = '';

  firstName: string = '';
  lastName: string = '';
  QRcode: string = '';
  empId: string = '';

  constructor(
    private paymentSlipReportService: PaymentSlipReportService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.officerId = this.route.snapshot.params['id'];
    this.route.queryParams.subscribe((params) => {
      this.firstName = params['firstName'] ? params['firstName'] : '';
      this.lastName = params['lastName'] ? params['lastName'] : '';
      this.QRcode = params['QRcode'] ? params['QRcode'] : '';
      this.empId = params['empId'] ? params['empId'] : '';

    });
    this.loadPayments();
  }

  loadPayments(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.payments = []; 
    this.total = 0;
    this.isTableVisible = false;

    let formattedDate = '';
    if (this.createdDate) {
      formattedDate = this.convertToISO(this.createdDate);
    }

    this.paymentSlipReportService
      .getPaymentSlipReport(page, limit, this.officerId, formattedDate, this.searchNIC)
      .subscribe(
        (response) => {
          console.log(response);
          this.isLoading = false;
          this.payments = response.items;
          this.total = response.total;
          this.hasData = this.payments.length > 0;
        },
        (error) => {
          console.error('Error fetching payments:', error);
        }
      );


  }


  navigateToFamerListReport(id: number, userId: number, QRcode: string) {
    this.router.navigate(['/reports/farmer-list-report'], { queryParams: { id, userId, QRcode } });
  }

  onPageChange(event: number) {
    this.page = event;
    this.loadPayments(this.page, this.itemsPerPage);
  }

  onDateChange(): void {
    this.payments = [];
    this.total = 0;
    this.isTableVisible = false;
    setTimeout(() => {
      this.loadPayments();
    }, 1000);
  }



  searchPlantCareUsers() {
    this.searchNIC = this.searchNIC.trim(); 
    this.page = 1;
    this.loadPayments();
  }

  clearSearch(): void {
    this.searchNIC = '';
    this.loadPayments();
  }

  convertToISO(date: any): string {
    if (date instanceof Date) {
      // Create UTC date with the same year, month, and day
      const utcDate = new Date(Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      ));
      return utcDate.toISOString();
    } else if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        const utcDate = new Date(Date.UTC(
          parsedDate.getFullYear(),
          parsedDate.getMonth(),
          parsedDate.getDate()
        ));
        return utcDate.toISOString();
      }
    }
    return date;
  }


}

class Payment {
  id!: number;
  userId!: number;
  invNo!: string;
  firstName!: string;
  lastName!: string;
  NICnumber!: string;
  total!: string;
  officerFirstName!: string;
  officerLastName!: string;
  paymentDate!: string;
}