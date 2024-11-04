import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { PaymentSlipReportService } from '../../../services/reports/payment-slip-report.service';
import { response } from 'express';
import { ActivatedRoute } from '@angular/router';
import { subscribe } from 'diagnostics_channel';

@Component({
  selector: 'app-payment-slip-report',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './payment-slip-report.component.html',
  styleUrl: './payment-slip-report.component.css',
})
export class PaymentSlipReportComponent {
  todayDate!: string;
  payments: Payment = new Payment();
  officerId!: number;
  total!: number;

  constructor(
    private paymentSlipReportService: PaymentSlipReportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.officerId = this.route.snapshot.params['id']
    this.loadPayments()
  }

  loadPayments(){
    this.paymentSlipReportService
      .getPaymentSlipReport(this.officerId)
      .subscribe(
        (response) => {
          console.log(response);
          
          this.payments = response.items;
          this.total = response.total;
        },
        (error) => {
          console.error('Error fetching payments:', error);
        }
      );
  }
}

class Payment {
  farmerFirstName!: string;
  farmerLastName!: string;
  farmerNIC!: string;
  paymentTotal!: string;
  officerFirstName!: string;
  officerLastName!: string;
  paymentDate!: string;
}
