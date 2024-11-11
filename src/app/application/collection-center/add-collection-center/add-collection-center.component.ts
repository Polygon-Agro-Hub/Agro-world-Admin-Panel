import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-collection-center',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-collection-center.component.html',
  styleUrls: ['./add-collection-center.component.css']
})
export class AddCollectionCenterComponent {
  collectionCenterForm: FormGroup;
  centerData: CollectionCenter = new CollectionCenter();

  constructor(private fb: FormBuilder, private collectionCenterService: CollectionCenterService,  private router: Router) {
    this.collectionCenterForm = this.fb.group({
      regCode: ['', Validators.required],
      centerName: ['', Validators.required],
      contact01: ['', Validators.required],
      contact01Code: ['+94', Validators.required],
      contact02: [''],
      contact02Code: ['+94'],
      buildingNumber: ['', Validators.required],
      street: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required]
    });
  }

  onSubmit() {
    this.centerData = { ...this.centerData, ...this.collectionCenterForm.value };

    this.collectionCenterService.createCollectionCenter(this.centerData).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire('Success', 'Collection Center Created Successfully', 'success');
        }
        this.router.navigate(['/collection-hub/view-collection-centers'])
      },
      (error) => {
        console.log("Error:", error);
      }
    );
  }
}

// Define CollectionCenter model
class CollectionCenter {
  regCode!: string;
  centerName!: string;
  contact01!: string;
  contact01Code!: string;
  contact02!: string;
  contact02Code!: string;
  buildingNumber!: string;
  street!: string;
  district!: string;
  province!: string;
}
