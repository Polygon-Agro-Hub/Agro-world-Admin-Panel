import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { response } from 'express';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

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

  deleteCompany(id: number) {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this company? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.companyService.deleteCompany(id)
          .subscribe(
            (data: any) => {
              console.log('Company deleted successfully');
              Swal.fire(
                'Deleted!',
                'The company has been deleted.',
                'success'
              );
              this.fetchAllCompanys(); // Refresh the company list
            },
            (error) => {
              console.error('Error deleting company:', error);
              Swal.fire(
                'Error!',
                'There was an error deleting the company.',
                'error'
              );
            }
          );
      }
    });
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
