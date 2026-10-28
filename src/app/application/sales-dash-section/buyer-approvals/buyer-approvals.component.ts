import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface BuyerApplication {
  cusId: string;
  name: string;
  onboarded: string;
  company: string;
  createdAt: Date;
  customerContact: string;
  companyContact: string;
  status: string;
  documentsUrl: string;
}

@Component({
  selector: 'app-buyer-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: './buyer-approvals.component.html',
  styleUrl: './buyer-approvals.component.css',
})
export class BuyerApprovalsComponent {
  isLoading = false;
  searchText = '';
  selectedOnboarded: string | null = null;

  onboardedOptions = [
    { label: 'Polygon', value: 'Polygon' },
    { label: 'SA0001', value: 'SA0001' },
  ];

  allApplications: BuyerApplication[] = [
    {
      cusId: 'CUS-00001',
      name: 'Alexander Vance',
      onboarded: 'Polygon',
      company: 'Apex Agro Imports Ltd',
      createdAt: new Date(2026, 10, 5, 13, 55),
      customerContact: '07845787866',
      companyContact: '07845787866',
      status: 'To Review',
      documentsUrl: '#',
    },
    {
      cusId: 'CUS-00002',
      name: 'Elena Rostova',
      onboarded: 'SA0001',
      company: 'Zenith Food Corp',
      createdAt: new Date(2026, 10, 5, 14, 55),
      customerContact: '07845787866',
      companyContact: '07845787866',
      status: 'To Review',
      documentsUrl: '#',
    },
    {
      cusId: 'CUS-00003',
      name: 'Marcus Brody',
      onboarded: 'SA0001',
      company: 'Golden Harvest Wholesale',
      createdAt: new Date(2026, 10, 5, 15, 55),
      customerContact: '07845787866',
      companyContact: '07845787866',
      status: 'To Review',
      documentsUrl: '#',
    },
    {
      cusId: 'CUS-00004',
      name: 'Farhan Malik',
      onboarded: 'SA0001',
      company: 'Ceylon Spice Traders',
      createdAt: new Date(2026, 10, 5, 16, 55),
      customerContact: '07845787866',
      companyContact: '07845787866',
      status: 'To Review',
      documentsUrl: '#',
    },
  ];

  applications: BuyerApplication[] = [...this.allApplications];

  constructor(private location: Location) {}

  get hasData(): boolean {
    return this.applications.length > 0;
  }

  get totalItems(): string {
    return this.applications.length.toString().padStart(2, '0');
  }

  Back() {
    this.location.back();
  }

  applyFilters() {
    const term = this.searchText.trim().toLowerCase();
    this.applications = this.allApplications.filter(
      (a) =>
        (!this.selectedOnboarded || a.onboarded === this.selectedOnboarded) &&
        (!term ||
          a.name.toLowerCase().includes(term) ||
          a.customerContact.includes(term) ||
          a.companyContact.includes(term)),
    );
  }

  onSearch() {
    this.applyFilters();
  }

  offSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  openDocuments(item: BuyerApplication) {
    window.open(item.documentsUrl, '_blank');
  }
}
