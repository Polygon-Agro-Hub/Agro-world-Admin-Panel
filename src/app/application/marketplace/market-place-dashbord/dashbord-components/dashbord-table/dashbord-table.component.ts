import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashbord-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashbord-table.component.html',
  styleUrl: './dashbord-table.component.css'
})
export class DashbordTableComponent implements OnInit{
  orderObj:Order[] = []
  ngOnInit(): void {
    this.orderObj = sampleOrder
  }

}

class Order{
  invoiceNo!:string
  time!:string
  cname!:string
  method!:string
  amount!:string
  status!:string
}


const sampleOrder = [
  {
    "invoiceNo": "INV1001",
    "time": "2024-11-10 14:30",
    "cname": "Alice Johnson",
    "method": "Credit Card",
    "amount": "$120.50",
    "status": "Delivered"
  },
  {
    "invoiceNo": "INV1002",
    "time": "2024-11-10 15:00",
    "cname": "Bob Smith",
    "method": "PayPal",
    "amount": "$85.00",
    "status": "Processing"
  },
  {
    "invoiceNo": "INV1003",
    "time": "2024-11-10 15:30",
    "cname": "Carol Williams",
    "method": "Bank Transfer",
    "amount": "$200.00",
    "status": "Assigned"
  },
  {
    "invoiceNo": "INV1004",
    "time": "2024-11-10 16:00",
    "cname": "David Brown",
    "method": "Credit Card",
    "amount": "$45.75",
    "status": "Delivered"
  },
  {
    "invoiceNo": "INV1005",
    "time": "2024-11-10 16:30",
    "cname": "Evelyn Davis",
    "method": "Cash",
    "amount": "$60.00",
    "status": "Processing"
  }
]
