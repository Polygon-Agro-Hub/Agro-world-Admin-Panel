import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { response } from 'express';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-company',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './manage-company.component.html',
  styleUrl: './manage-company.component.css',
})
export class ManageCompanyComponent {
  companies: CompanyDetails[] = [];

  constructor(private companyService: CollectionCenterService) {}

  ngOnInit(){
    this.fetchAllCompanys();
  }

  fetchAllCompanys() {
    this.companyService.getAllCompanyDetails().subscribe(
      (response: any) => {
        console.log(response);
        
        this.companies = response.results;
      },
      (error) => {
        console.error(error);
      }
    );
  }
}

class CompanyDetails {
  companyNameEnglish!: string;
  email!: string;
  status!:number;
  oicName!: string;
  oicEmail!: string;
  oicConCode1!: number;
  oicConNum1!: number;
  oicConCode2!: number;
  oicConNum2!: number;
  jobRole!:string;
  jobRoleCount!:number;
}
