import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Order {
  id: number;
  orderId: string;
  orderValue: number;
  toReceive: number;
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
  submittedAt: Date = new Date('2026-07-01');


  //dummy data
  orders: Order[] = [
    { id: 1, orderId: '2606010001', orderValue: 4000, toReceive: 3750 },
    { id: 2, orderId: '2606010002', orderValue: 3000, toReceive: 2750 },
    { id: 3, orderId: '2606010003', orderValue: 2000, toReceive: 1750 },
    { id: 4, orderId: '2606010004', orderValue: 1000, toReceive: 750 },
  ];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
  }

  get totalToReceive(): number {
    return this.orders.reduce((sum, order) => sum + order.toReceive, 0);
  }

  get submittedAtLabel(): string {
    const day = this.submittedAt.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? 'st'
        : day % 10 === 2 && day !== 12
          ? 'nd'
          : day % 10 === 3 && day !== 13
            ? 'rd'
            : 'th';
    const month = this.submittedAt.toLocaleString('en-US', { month: 'long' });
    return `${day}${suffix} ${month}, ${this.submittedAt.getFullYear()}`;
  }

  back(): void {
    this.location.back();
  }
}
