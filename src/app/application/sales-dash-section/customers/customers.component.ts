import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CustomersService } from '../../../services/dash/customers.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { response } from 'express';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface Customers {
  id: number;
  cusId: string;
  title: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  buildingType: string;
  salesAgent: number;
  created_at: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule,LoadingSpinnerComponent],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent {
  customers: Customers[] = [];
  isLoading = true;
  hasData: boolean = true; 

  constructor(
    private customerService: CustomersService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchAllCustomers();
  }

  fetchAllCustomers() {
    this.customerService.getCustomers().subscribe(
      (response: any) => {
        console.log(response);
        this.isLoading = false;
        this.customers = response;
      },
      (error) => {
        console.error('Error fetching customers', error);
        this.isLoading = false;
      }
    );
  }
}
