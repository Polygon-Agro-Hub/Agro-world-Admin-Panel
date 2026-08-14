import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';

interface OrderItem {
  orderId: string;
  handOverPrice: number;
}

@Component({
  selector: 'app-view-transaction-all-orders',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './view-transaction-all-orders.component.html',
  styleUrl: './view-transaction-all-orders.component.css',
})
export class ViewTransactionAllOrdersComponent implements OnInit {
  isLoading = false;
  hasData = true;

  officerId: string | null = null;
  submissionDate: string = '2026-07-01';
  totalToReceive: number = 0;

  orders: OrderItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.officerId = this.route.snapshot.paramMap.get('id');
    this.loadDummyData();
  }

  loadDummyData(): void {
    // Dummy data — replace with financeService API call
    this.orders = [
      { orderId: '2606010001', handOverPrice: 4000.0 },
      { orderId: '2606010002', handOverPrice: 3000.0 },
      { orderId: '2606010003', handOverPrice: 2000.0 },
      { orderId: '2606010004', handOverPrice: 1000.0 },
    ];

    this.totalToReceive = this.orders.reduce(
      (sum, item) => sum + item.handOverPrice,
      0,
    );
    this.hasData = this.orders.length > 0;
  }

  goBack(): void {
    this.router.navigate(['/finance/action/distribution-finance']);
  }
}
