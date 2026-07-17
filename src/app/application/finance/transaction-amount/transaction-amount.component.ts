import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FinanceService } from '../../../services/finance/finance.service';

interface Order {
  id: number;
  invNo: string;
  amount: number;
  toReceive: number;
  submittedAt: Date;
}

@Component({
  selector: 'app-transaction-amount',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-amount.component.html',
  styleUrl: './transaction-amount.component.css',
})
export class TransactionAmountComponent implements OnInit {
  id!: number;
  orders: Order[] = [];
  totalItems: number = 0;
  total: number = 0;

  isLoading = true;
  hasData = false;

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private financeSrv: FinanceService,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('id', this.id)

    this.getTransactionOrders();
  }

  getTransactionOrders() {
    this.isLoading = true;
    this.financeSrv
      .fetchTransactionOrders(this.id)
      .subscribe(
        (response) => {
          this.isLoading = false;
          this.total = response.total
          this.orders = response.orders;
          this.hasData = this.orders.length > 0;
          this.totalItems = this.orders.length;
        },
        (error) => {
          if (error.status === 401) {
          }
        },
      );
  }


  back(): void {
    this.location.back();
  }
}
