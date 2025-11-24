import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-investment-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './investment-requests.component.html',
  styleUrl: './investment-requests.component.css',
})
export class InvestmentRequestsComponent {
  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/finance/action']);
  }
}
