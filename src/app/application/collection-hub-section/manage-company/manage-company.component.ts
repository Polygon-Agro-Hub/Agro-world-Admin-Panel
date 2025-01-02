import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { response } from 'express';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-company',
  standalone: true,
  imports: [LoadingSpinnerComponent, CommonModule],
  templateUrl: './manage-company.component.html',
  styleUrl: './manage-company.component.css',
})
export class ManageCompanyComponent {
  companies: CompanyDetails[] = [];

  constructor(private companyService: CollectionCenterService, private router: Router,) {}

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

  editCompany(id: number) {
    this.router.navigate(['/collection-hub/create-company'], { queryParams: { id } });
  }
}

class CompanyDetails {
  id!:number;
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
