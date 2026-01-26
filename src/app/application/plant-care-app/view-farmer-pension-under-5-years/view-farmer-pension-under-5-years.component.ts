import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-farmer-pension-under-5-years',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './view-farmer-pension-under-5-years.component.html',
  styleUrl: './view-farmer-pension-under-5-years.component.css',
})
export class ViewFarmerPensionUnder5YearsComponent {
  searchText: string = '';
  isLoading = false;
  showDetailsModal = false;
  dataObject: Farmer | null = null;

  farmers: Farmer[] = [
    {
      no: '001',
      name: 'Kasun',
      nic: '917500010V',
      amount: 120000,
      daysMore: '1 Year 1 Month',
      approvedBy: 'Hashini',
      approvedDate: '11:00PM June 01, 2026',
    },
    {
      no: '002',
      name: 'Gihan',
      nic: '927500010V',
      amount: 120000,
      daysMore: '1 Year',
      approvedBy: 'Hashini',
      approvedDate: '11:00PM June 01, 2026',
    },
    {
      no: '003',
      name: 'Thilanka',
      nic: '937500010V',
      amount: 120000,
      daysMore: '2 Months',
      approvedBy: 'Hashini',
      approvedDate: '11:00PM June 01, 2026',
    },
  ];

  get filteredFarmers() {
    return this.farmers.filter(
      (f) =>
        f.name.toLowerCase().includes(this.searchText.toLowerCase()) ||
        f.nic.toLowerCase().includes(this.searchText.toLowerCase()),
    );
  }

  viewDetails(farmer: Farmer) {
    this.dataObject = farmer;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
  }

  back() {
    window.history.back();
  }
}

interface Farmer {
  no: string;
  name: string;
  nic: string;
  amount: number;
  daysMore: string;
  approvedBy: string;
  approvedDate: string;
}
