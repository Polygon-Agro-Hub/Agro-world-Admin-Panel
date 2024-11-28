import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { PaymentSlipReportService } from '../../../services/reports/payment-slip-report.service';
import { NgxPaginationModule } from 'ngx-pagination';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";

@Component({
  selector: 'app-payment-slip-report',
  standalone: true,
  imports: [CommonModule, CalendarModule, NgxPaginationModule, LoadingSpinnerComponent],
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

  constructor(
    private paymentSlipReportService: PaymentSlipReportService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.officerId = this.route.snapshot.params['id'];
    this.loadPayments();
  }

  loadPayments(page: number = 1, limit: number = this.itemsPerPage) {
    this.isLoading = true;
    this.paymentSlipReportService
      .getPaymentSlipReport(page, limit ,this.officerId)
      .subscribe(
        (response) => {
          console.log(response);
          this.isLoading = false;

          this.payments = response.items;
          this.total = response.total;
        },
        (error) => {
          console.error('Error fetching payments:', error);
        }
      );
  }
  // navigateToFamerListReport(id: number) {
  //   this.router.navigate([`/reports/farmer-list-report/${id}`]);
  // }

  navigateToFamerListReport(id: number, userId: number) {
    this.router.navigate(['/reports/farmer-list-report'], { queryParams: { id, userId } });
  }

  onPageChange(event: number) {
    this.page = event;
    this.loadPayments(this.page, this.itemsPerPage); // Include itemsPerPage
  }
}

class Payment {
  id!: number;
  userId!: number;
  firstName!: string;
  lastName!: string;
  NICnumber!: string;
  total!: string;
  officerFirstName!: string;
  officerLastName!: string;
  paymentDate!: string;
}
