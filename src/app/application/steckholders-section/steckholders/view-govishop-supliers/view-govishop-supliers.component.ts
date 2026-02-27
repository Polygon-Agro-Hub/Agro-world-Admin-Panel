import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';

export interface Supplier {
  shopName: string;
  ownerName: string;
  nic: string;
  phone: string;
  pricePlan: 'Free' | 'Premium' | 'Expired';
  joinedOn: string;
}

@Component({
  selector: 'app-view-govishop-supliers',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule, FormsModule, DropdownModule],
  templateUrl: './view-govishop-supliers.component.html',
  styleUrl: './view-govishop-supliers.component.css',
})
export class ViewGovishopSupliersComponent implements OnInit {
  isLoading = false;
  searchTerm = '';
  selectedPlan: string | null = null;

  showDeleteModal = false;
  supplierToDelete: Supplier | null = null;

  planOptions = [
    { label: 'All', value: null },
    { label: 'Free', value: 'Free' },
    { label: 'Premium', value: 'Premium' },
    { label: 'Expired', value: 'Expired' },
  ];

  suppliers: Supplier[] = [
    {
      shopName: 'Agri Shop',
      ownerName: 'J.K. Pieris',
      nic: '917500030V',
      phone: '0772828600',
      pricePlan: 'Free',
      joinedOn: 'June 3, 2026',
    },
    {
      shopName: 'HelaGoviyo',
      ownerName: 'Ravin Kaluhennadi',
      nic: '907500030V',
      phone: '0772828600',
      pricePlan: 'Premium',
      joinedOn: 'June 2, 2026',
    },
    {
      shopName: 'Saviya',
      ownerName: 'Samitha Herath',
      nic: '917500031V',
      phone: '0772828600',
      pricePlan: 'Expired',
      joinedOn: 'June 2, 2026',
    },
    {
      shopName: 'SK Products',
      ownerName: 'Chalana Prabhashwara',
      nic: '907500030V',
      phone: '0772828600',
      pricePlan: 'Premium',
      joinedOn: 'June 2, 2026',
    },
  ];

  get filteredSuppliers(): Supplier[] {
    return this.suppliers.filter((s) => {
      const matchesSearch =
        !this.searchTerm ||
        s.shopName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.nic.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        s.phone.includes(this.searchTerm);

      const matchesPlan =
        !this.selectedPlan || s.pricePlan === this.selectedPlan;

      return matchesSearch && matchesPlan;
    });
  }

  constructor(private router: Router) {}

  ngOnInit(): void {}

  back(): void {
    this.router.navigate(['steckholders/action']);
  }

  openDeleteModal(supplier: Supplier): void {
    this.supplierToDelete = supplier;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.supplierToDelete = null;
  }

  confirmDelete(): void {
    if (this.supplierToDelete) {
      this.suppliers = this.suppliers.filter((s) => s !== this.supplierToDelete);
    }
    this.showDeleteModal = false;
    this.supplierToDelete = null;
  }
}