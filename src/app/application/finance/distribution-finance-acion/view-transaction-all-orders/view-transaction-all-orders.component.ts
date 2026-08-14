import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { FinanceService } from '../../../../services/finance/finance.service';

interface OrderItem {
  orderId: string;
  invNo: string;
  handOverPrice: number;
  officerId: number;
  subbmittedAt: string;
  totalHandOverPrice: number;
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

  id: string | null = null;
  submissionDate: string = '';
  totalToReceive: number = 0;

  orders: OrderItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private financeService: FinanceService,
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    this.loadOrders();
  }

  loadOrders(): void {
    if (!this.id) {
      this.hasData = false;
      return;
    }

    this.isLoading = true;

    this.financeService
      .getPickupHandOverSummary(Number(this.id))
      .subscribe({
        next: (res) => {
          this.orders = res.result || [];
          this.totalToReceive =
            this.orders.length > 0 ? this.orders[0].totalHandOverPrice : 0;
          this.submissionDate =
            this.orders.length > 0 ? this.orders[0].subbmittedAt : '';
          this.hasData = this.orders.length > 0;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error fetching pickup hand over summary', err);
          this.orders = [];
          this.totalToReceive = 0;
          this.hasData = false;
          this.isLoading = false;
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/finance/action/distribution-finance/view-transactions']);
  }
}
