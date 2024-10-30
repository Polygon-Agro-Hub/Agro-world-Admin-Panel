import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-payment-slip-report',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './payment-slip-report.component.html',
  styleUrl: './payment-slip-report.component.css'
})
export class PaymentSlipReportComponent {

}
