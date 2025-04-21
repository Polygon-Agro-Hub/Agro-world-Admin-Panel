import { Component, Input } from '@angular/core';
import { TargetService } from '../../../services/target-service/target.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assign-center-target',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-center-target.component.html',
  styleUrl: './assign-center-target.component.css',
})
export class AssignCenterTargetComponent {
  @Input() centerDetails!: CenterDetails;
  assignCropsArr: AssignCrops[] = [];
  newTargetObj: NewTarget = new NewTarget();
  searchText: string = '';
  selectDate: string = new Date().toISOString().split('T')[0];
  isDateValid: boolean = true;
  countCrops: number = 0;
  isNew: boolean = true;
  companyCenterId!: number;
  isFormValid: boolean = false;
  hasData: boolean = false;

  constructor(private TargetSrv: TargetService) {}

  ngOnInit(): void {
    this.fetchSavedCenterCrops();
  }

  fetchSavedCenterCrops() {
    this.validateSelectDate();
    this.TargetSrv.getSavedCenterCrops(
      this.centerDetails.centerId,
      this.selectDate,
      this.searchText
    ).subscribe((res) => {
      console.log('res', res);

      this.assignCropsArr = res.result.data;
      this.countCrops = res.result.data.length;
      this.isNew = res.result.isNew;
      this.companyCenterId = res.companyCenterId;
      this.hasData = res.result.data.length > 0 ? true : false;
    });
  }

  validateSelectDate() {
    const selectedDate = new Date(this.selectDate);
    const today = new Date();

    // Reset time components to compare just dates
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      this.isDateValid = false;
    } else {
      this.isDateValid = true;
    }
  }

  onSearch() {
    this.fetchSavedCenterCrops();
  }
  offSearch() {
    this.searchText = '';
    this.fetchSavedCenterCrops();
  }

  saveGrade(grade: string, item: any, qty: number, editId: number | null) {
    let data = {
      id: editId,
      qty: qty,
      date: this.selectDate,
      companyCenterId: this.companyCenterId,
      grade: grade,
      varietyId: item.varietyId,
    };

    this.TargetSrv.updateTargetQty(data).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Grade saved successfully',
            timer: 2000,
            showConfirmButton: false,
          });
          this.fetchSavedCenterCrops();
          if (grade === 'A') item.editingA = false;
          if (grade === 'B') item.editingB = false;
          if (grade === 'C') item.editingC = false;
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save grade',
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while saving the grade',
        });
        console.error('Error saving grade:', error);
      }
    );
  }

  validateForm() {
    this.isFormValid = this.assignCropsArr.some(
      (crop) => crop.targetA > 0 || crop.targetB > 0 || crop.targetC > 0
    );
  }

  onCancel() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You want to discard your changes?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, discard changes!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.fetchSavedCenterCrops();
        Swal.fire('Discarded!', 'Your changes have been discarded.', 'success');
      }
    });
  }

  onSubmit() {
    this.newTargetObj.companyCenterId = this.companyCenterId;
    this.newTargetObj.date = this.selectDate;
    this.newTargetObj.crop = this.assignCropsArr;

    Swal.fire({
      title: 'Please wait...',
      html: 'Processing your request',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.TargetSrv.addNewCenterTarget(this.newTargetObj).subscribe(
      (res) => {
        Swal.close();
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: 'Target assigned successfully',
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            this.fetchSavedCenterCrops();
            // this.router.navigate(['/target/assign-center-target'])
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: res.message || 'Failed to assign target',
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'An error occurred while assigning target',
        });
        console.error('Error assigning target:', error);
      }
    );
  }
}

class CenterDetails {
  centerId!: number;
  centerName!: string;
  regCode!: string;
}

class AssignCrops {
  cropNameEnglish!: string;
  varietyNameEnglish!: string;
  targetA: number = 0.0;
  targetB: number = 0.0;
  targetC: number = 0.0;
  editingA: boolean = false;
  editingB: boolean = false;
  editingC: boolean = false;
  idA: number | null = null;
  idB: number | null = null;
  idC: number | null = null;
}

class NewTarget {
  companyCenterId!: number;
  date!: string;
  crop!: AssignCrops[];
}
