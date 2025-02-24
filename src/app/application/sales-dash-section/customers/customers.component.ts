import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CustomersService } from '../../../services/dash/customers.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { response } from 'express';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface Customers {
  id: number;
  cusId: string;
  title: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  buildingType: string;
  salesAgentEmpId: number;
  salesAgentFirstName: string;
  salesAgentLastName: string;
  created_at: string;
  houseHouseNo: string;
  houseStreetName: string;
  houseCity: string;
  apartmentBuildingNo: string;
  apartmentBuildingName: string;
  apartmentUnitNo: string;
  apartmentFloorNo: string;
  apartmentHouseNo: string;
  apartmentStreetName: string;
  apartmentCity: string;
}

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './customers.component.html',
  styleUrl: './customers.component.css',
})
export class CustomersComponent {
  customers: Customers[] = [];
  isLoading = true;
  hasData: boolean = true;
  isPopupOpen = false;
  selectedCustomer: any = null;

  constructor(
    private customerService: CustomersService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchAllCustomers();
  }

  openPopup(customer: any) {
    this.selectedCustomer = customer;
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
    this.selectedCustomer = null;
  }

  copyToClipboard(value: string | undefined) {
    if (!value) return; // Prevent copying if value is undefined

    navigator.clipboard
      .writeText(value)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Copied!',
          text: `${value} has been copied to clipboard.`,
          showConfirmButton: false,
          timer: 1500,
        });
      })
      .catch((err) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops!',
          text: 'Failed to copy. Please try again.',
        });
        console.error('Failed to copy:', err);
      });
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
