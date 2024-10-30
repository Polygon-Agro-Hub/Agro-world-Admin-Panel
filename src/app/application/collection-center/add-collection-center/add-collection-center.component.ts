import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { response } from 'express';
import { error } from 'console';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-collection-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-collection-center.component.html',
  styleUrl: './add-collection-center.component.css'
})
export class AddCollectionCenterComponent {
  collectionCenterForm!: FormGroup;

  constructor(private fb:FormBuilder, private collectionCenterService: CollectionCenterService){
    this.collectionCenterForm = this.fb.group({
      regCode:['', Validators.required],
      centerName:['', Validators.required],
      contact01:['', Validators.required],
      contact02:['', Validators.required],
      buildingNumber:['', Validators.required],
      street:['', Validators.required],
      district:['', Validators.required],
      province:['', Validators.required]
    });
  }

  onSubmit(){
    if(this.collectionCenterForm.valid){
      const formData = this.collectionCenterForm.value;
      this.collectionCenterService.createCollectionCenter(formData).subscribe(
        (response)=>{
          console.log('Collection Center added successfully', response);
        },
        (error) =>{
          console.error('Error adding collection center', error);
        }
      );
    }else{
      console.log('Form is invalid');
    }
  }
}
