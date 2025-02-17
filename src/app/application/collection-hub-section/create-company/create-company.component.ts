import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
import Swal from 'sweetalert2';
import { response } from 'express';
import { error } from 'console';

@Component({
  selector: 'app-create-company',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, FormsModule],
  templateUrl: './create-company.component.html',
  styleUrl: './create-company.component.css'
})
export class CreateCompanyComponent {
  companyData: Company = new Company();
  userForm: FormGroup;
  selectedPage: 'pageOne' | 'pageTwo' = 'pageOne';
  itemId: number | null = null;
  touchedFields: { [key in keyof Company]?: boolean } = {};


  constructor(
    private fb: FormBuilder,
    private collectionCenterSrv: CollectionCenterService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
  ) {
    this.userForm = this.fb.group({
      regNumber: ['', Validators.required],
      companyNameEnglish: ['', Validators.required],
      companyNameSinhala: ['', Validators.required],
      companyNameTamil: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      oicName: ['', Validators.required],
      oicEmail: ['', [Validators.required, Validators.email]],
      oicConCode1: ['', Validators.required],
      oicConNum1: ['', Validators.required],
      oicConCode2: [''],
      oicConNum2: [''],
      accHolderName: ['', Validators.required],
      accNumber: ['', Validators.required],
      bankName: ['', Validators.required],
      branchName: ['', Validators.required],
      foName: ['', Validators.required],
      foConCode: ['', Validators.required],
      foConNum: ['', Validators.required],
      foEmail: ['', [Validators.required]]
    });
  }


  ngOnInit() {
    // Subscribe to form value changes
    this.route.queryParams.subscribe((params)=>{
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    this.userForm.valueChanges.subscribe(formValues => {
      this.companyData = { ...this.companyData, ...formValues };
    });
    this.getCompanyData();
  }

  
getCompanyData() {
  if (this.itemId) {
    this.collectionCenterSrv.getCompanyById(this.itemId).subscribe(
      (response: any) => {
        console.log('Fetched company data:', response);

        this.companyData = response;
        console.log("--check--",this.companyData);
      },
      (error) => {
        console.error('Error fetching company data:', error);
        Swal.fire('Error', 'Failed to fetch company data. Please try again.', 'error');
      }
    );
  }
}


  saveCompanyData() {
    console.log(this.companyData);
      
      this.collectionCenterSrv.createCompany(this.companyData).subscribe(
        (response) => {
          console.log('Data saved successfully:', response);
          Swal.fire('Success', 'Company Created Successfully', 'success');
          this.router.navigate(['/admin/collection-hub/manage-company']);
        },
        (error) => {
          console.error('Error saving data:', error);
          Swal.fire('Error', error, 'error');
        }
      );
   
  }




  nextFormCreate(page: 'pageOne' | 'pageTwo') {
      if (page === 'pageTwo') {
        
        const missingFields: string[] = [];
  
        if (!this.companyData.regNumber) missingFields.push('Company Register Number');
        if (!this.companyData.companyNameEnglish) missingFields.push('Company Name (English)');
        if (!this.companyData.companyNameSinhala) missingFields.push('Company Name (Sinhala)');
        if (!this.companyData.companyNameTamil) missingFields.push('Company Name (Tamil)');
        if (!this.companyData.email) missingFields.push('Company Email');
        // if (!this.companyData.oicName) missingFields.push('Officer In Charge Name');
        // if (!this.companyData.oicEmail) missingFields.push('Officer In Charge Email');
        // if (!this.companyData.oicConCode1) missingFields.push('Phone Number 01 Code');
        // if (!this.companyData.oicConNum1) missingFields.push('Phone Number 02');

    
        if (missingFields.length > 0) {
          Swal.fire({
            icon: 'error',
            title: 'Please fill all fields',
            html: `The following fields are missing:<br><ul>${missingFields
              .map(field => `<li>${field}</li>`)
              .join('')}</ul>`
          });
          return;
        }
      }
  
      this.selectedPage = page;
    }

    updateCompanyData(){
      if(this.itemId){
        this.collectionCenterSrv.updateCompany(this.companyData, this.itemId).subscribe(
          (response)=>{
            console.log('Company updated successfully:', response);
            Swal.fire('Success', 'Company Updated Successfully', 'success');
            this.router.navigate(['/admin/collection-hub/manage-company']);
          },
          (error) =>{
            console.error('Error updating company:', error);
            Swal.fire('Error', 'Failed to update company. Please try again.', 'error');
          }
        );
      }else{
        Swal.fire('Error', 'No company ID found for update', 'error');
      }
    }





    onBlur(fieldName: keyof Company): void {
      this.touchedFields[fieldName] = true;
    }
  
    isFieldInvalid(fieldName: keyof Company): boolean {
      return !!this.touchedFields[fieldName] && !this.companyData[fieldName];
    }





}


class Company {
  id!:number;
  regNumber!: string;
  companyNameEnglish!: string;
  companyNameSinhala!: string;
  companyNameTamil!: string;
  email!: string;
  oicName!: string;
  oicEmail!: string;
  oicConCode1!: string;
  oicConNum1!: string;
  oicConCode2!: string;
  oicConNum2!: string;
  accHolderName!: string;
  accNumber!: string;
  bankName!: string;
  branchName!: string;
  foName!: string;
  foConCode!: string;
  foConNum!: string;
  foEmail!: string;
}
