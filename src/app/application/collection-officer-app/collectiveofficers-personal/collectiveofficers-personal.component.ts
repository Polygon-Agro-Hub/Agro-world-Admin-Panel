import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';
@Component({
  selector: 'app-collectiveofficers-personal',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule],
  templateUrl: './collectiveofficers-personal.component.html',
  styleUrls: ['./collectiveofficers-personal.component.css'], // Fixed `styleUrls`
})
export class CollectiveofficersPersonalComponent implements OnInit {
  officerForm: FormGroup;
  officerId: number | null = null;
  selectedFile: File | null = null;
  languages:string[]=['Sinhala','English','Tamil'];
  selectedPage:'pageOne' | 'pageTwo' = 'pageOne'

  constructor(
    private collectionOfficerService: CollectionOfficerService,
    private fb: FormBuilder
  ) {
    this.officerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber01: ['', Validators.required],
      phoneNumber02: [''],
      nic: ['', Validators.required],
      email:['', Validators.required],
      houseNumber: ['', Validators.required],
      streetName: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required],
      country: ['', Validators.required],
      image: [''],
      languages: this.fb.array([]),
    });
  }

  onCheckboxChange(event: any){
    const languagesArray: FormArray = this.officerForm.get('languages')as FormArray;

    if(event.target.checked){
      languagesArray.push(new FormControl(event.target.value));
    }else{
      const index = languagesArray.controls.findIndex(x => x.value === event.target.value);
      languagesArray.removeAt(index);
    }
  }

  onSubmit() {
    const formValue = this.officerForm.value;
    if(formValue.languages && Array.isArray(formValue.languages)){
      formValue.languages = formValue.languages.join(',');
    }
    console.log(formValue);
    
    const formData = new FormData();
    if(this.officerForm.value){
      const officerData = this.officerForm.value
      for (const key in officerData){
        if(officerData.hasOwnProperty(key)){
          formData.append(key, officerData[key]);
        }
      }
      this.collectionOfficerService.createCollectiveOfficer(this.officerForm.value).subscribe(
        (res:any)=>{
          this.officerId = res.officerId;
          // Swal.fire({
          //   title: 'Success',
          //   text: "Collective Officer Created Successfully",
          //   icon: "success",
          // })
        },
        (error: any) => {
          // Swal.fire('Error', 'There was an error creating collective officer', 'error');
        }
      );
    }
  }

  nextForm(page: 'pageOne' | 'pageTwo') {
    this.selectedPage = page;
  }

  ngOnInit(): void {}
}

export class CreateOfficer {
  firstName: string = '';
  lastName: string = '';
  phoneNumber01: string = '';
  phoneNumber02: string = '';
  nic: string = '';
  email:string='';
  houseNumber: string = '';
  streetName: string = '';
  district: string = '';
  province: string = '';
  country: string = '';
}
