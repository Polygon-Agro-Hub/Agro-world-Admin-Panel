import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarModule } from 'primeng/calendar';
import { FarmerListReportService } from '../../../services/reports/farmer-list-report.service';
import { ActivatedRoute } from '@angular/router';
import { response } from 'express';

@Component({
  selector: 'app-farmer-list-report',
  standalone: true,
  imports: [CommonModule, CalendarModule],
  templateUrl: './farmer-list-report.component.html',
  styleUrl: './farmer-list-report.component.css',
})
export class FarmerListReportComponent {
  fullTotal: number = 0;
  todayDate!: string;
  famerID!: number;
  farmerList: FarmerList = new FarmerList();
  total!: number;

  constructor(
    private farmerListReportService: FarmerListReportService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
    this.famerID = this.route.snapshot.params['userId'];
    this.loadFarmerList();
  }

  loadFarmerList() {
    this.farmerListReportService.getFarmerListReport(this.famerID).subscribe(
      (response) => {
        console.log(response);

        this.farmerList = response.items;
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }
}

class FarmerList {
  farmerFirstName!: string;
  farmerLastName!: string;
  farmerNIC!: string;
  farmerPhoneNumber!: string;
  totalPaymentAmount!: string;
  officerFirstName!: string;
  officerLastName!: string;
  officerPhone1!: string;
  officerPhone2!: string;
  officerEmail!: string;
  cropName!: string;
  unitPriceA!: string;
  weightA!: string;
  paymentImage!: string;
  cropVariety!: string;
  weightB!: string;
  weightC!: string;
  unitPriceB!: string;
  unitPriceC!: string;
  qty!: string;
  paymentDate!: string;
  farmerBankAccountHolder!: string;
  farmerAccountNumber!: string;
  farmerBankName!: string;
  farmerBranchName!: string;
  farmerAddress!: string;
}
