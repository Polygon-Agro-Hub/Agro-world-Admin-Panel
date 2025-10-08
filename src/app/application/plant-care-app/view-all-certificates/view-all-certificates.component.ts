import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CertificateCompanyService } from '../../../services/plant-care/certificate-company.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
// import { Router } from '@angular/router';

@Component({
  selector: 'app-view-all-certificates',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    DropdownModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './view-all-certificates.component.html',
  styleUrl: './view-all-certificates.component.css'
})
export class ViewAllCertificatesComponent implements OnInit {
  certificateArr: CertificateData[] = [];
  companyArr: Company[] = [];

  isLoading: boolean = true;
  hasData: boolean = false;
  searchText: string = '';
  selectQaction: string = '';
  selectArea: string = '';
  selectCompany: any = '';

  QuactionFilter: any = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ]

  serviceAreasOptions = [
    { name: 'Ampara', value: 'Ampara' },
    { name: 'Anuradhapura', value: 'Anuradhapura' },
    { name: 'Badulla', value: 'Badulla' },
    { name: 'Batticaloa', value: 'Batticaloa' },
    { name: 'Colombo', value: 'Colombo' },
    { name: 'Galle', value: 'Galle' },
    { name: 'Gampaha', value: 'Gampaha' },
    { name: 'Hambantota', value: 'Hambantota' },
    { name: 'Jaffna', value: 'Jaffna' },
    { name: 'Kalutara', value: 'Kalutara' },
    { name: 'Kandy', value: 'Kandy' },
    { name: 'Kegalle', value: 'Kegalle' },
    { name: 'Kilinochchi', value: 'Kilinochchi' },
    { name: 'Kurunegala', value: 'Kurunegala' },
    { name: 'Mannar', value: 'Mannar' },
    { name: 'Matale', value: 'Matale' },
    { name: 'Matara', value: 'Matara' },
    { name: 'Monaragala', value: 'Monaragala' },
    { name: 'Mullaitivu', value: 'Mullaitivu' },
    { name: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { name: 'Polonnaruwa', value: 'Polonnaruwa' },
    { name: 'Puttalam', value: 'Puttalam' },
    { name: 'Rathnapura', value: 'Rathnapura' },
    { name: 'Trincomalee', value: 'Trincomalee' },
    { name: 'Vavuniya', value: 'Vavuniya' },
  ];

  constructor(
    private certificateSrv: CertificateCompanyService,
    // private router: Router,
    // private location: Location,
  ) { }

  ngOnInit(): void {
    this.fetchCompany();
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    console.log(this.selectQaction);
    
    this.searchText = this.searchText.trim();
    this.certificateSrv.getAllCertificates(this.selectQaction, this.selectArea, this.selectCompany, this.searchText).subscribe(
      (res) => {
        console.log(res);
        this.certificateArr = res.data;
        this.isLoading = false;
        this.hasData = this.certificateArr.length > 0;
      }
    )
  }

  fetchCompany() {
    this.certificateSrv.getAllCompaniesNamesOnly().subscribe(
      (res) => {
        this.companyArr = res;
      }
    )
  }

  onSearch() {
    this.fetchData();
  }

  offSearch() {
    this.searchText = '';
    this.fetchData();
  }

  applyFilters() {

  }

}


class CertificateData {
  id!: number;
  srtName!: string;
  srtNumber!: string;
  commission!: number;
  serviceAreas!: string;
  qCount!: number;
  modifiedByUser!: string;
  modifyDate!: string;
  companyName!: string;
}

class Company {
  id!: number;
  companyName!: string;
}