import { Component, Input } from '@angular/core';
import { TargetService } from '../../../services/target-service/target.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Calendar, CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'app-assign-center-target',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, CalendarModule],
  templateUrl: './assign-center-target.component.html',
  styleUrl: './assign-center-target.component.css',
})
export class AssignCenterTargetComponent {
  @Input() centerDetails!: CenterDetails;
  assignCropsArr: AssignCrops[] = [];
  newTargetObj: NewTarget = new NewTarget();
  searchText: string = '';
  // selectDate: string = new Date().toISOString().split('T')[0];
  isDateValid: boolean = true;
  countCrops: number = 0;
  isNew: boolean = true;
  companyCenterId!: number;
  isFormValid: boolean = false;
  hasData: boolean = false;
  isLoading = false;

dateError: boolean = false;
  selectDate: Date | null = new Date();

  constructor(private TargetSrv: TargetService) {}

  ngOnInit(): void {
    this.fetchSavedCenterCrops();
  }

onDateChange(event: any) {
  if (!event) {
    this.selectDate = null; // Clear the date
    this.dateError = true;
  } else {
    this.dateError = false;
    this.fetchSavedCenterCrops();
    // your existing logic for fetching data
  }
}


checkDateSelection() {
  if (!this.selectDate) {
    this.dateError = true;
  } else {
    this.dateError = false;
  }
}
  fetchSavedCenterCrops() {
    this.isLoading = true;
  
    if (!this.selectDate || !this.validateSelectDate(this.selectDate)) {
      this.isDateValid = false;
      console.log('isDateValid', this.isDateValid)
      this.isLoading = false;
      return;
    }
  
    this.isDateValid = true;
    const formattedDate = this.formatDate(this.selectDate);
    console.log('formatDate', formattedDate)
  
    this.TargetSrv.getSavedCenterCrops(
      this.centerDetails.centerId,
      formattedDate,     // send string to service
      this.searchText
    ).subscribe((res) => {
      this.isLoading = false;
  
      this.assignCropsArr = res.result.data;
      this.countCrops = res.result.data.length;
      this.isNew = res.result.isNew;
      this.companyCenterId = res.companyCenterId;
      this.hasData = res.result.data.length > 0;
      console.log('hasData', this.hasData)
    });
  }
  

  validateSelectDate(date: Date): boolean {
    const selectedDate = new Date(date);
    const today = new Date();
  
    // Reset time portion for comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
  
    return selectedDate >= today;
  }
  

  private formatDate(date: Date | null | undefined): string {
    if (!date) {
      return '';
    }
  
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // months are 0-based
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  

  onSearch() {
    if (this.searchText) {
      this.searchText = this.searchText.trimStart();
    }
    this.fetchSavedCenterCrops();
  }

  offSearch() {
    this.searchText = '';
    this.fetchSavedCenterCrops();
  }

  saveGrade(grade: string, item: any, qty: number, editId: number | null) {
    this.isLoading = true;
    if (grade === 'A') {
      if (item.targetA < item.preValueA) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          html: 'Updated target cannot be less than the initially added target',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
            title: 'font-semibold text-lg',
            htmlContainer: 'text-left',
          },
        });
        return;
      }
      

    } else if (grade === 'B') {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        html: 'Updated target cannot be less than the initially added target',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });
      return;
    } else {
      if (item.targetC < item.preValueC) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          html: 'Updated target cannot be less than the initially added target',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
            title: 'font-semibold text-lg',
            htmlContainer: 'text-left',
          },
        });
        return;
      }
    }

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
          this.isLoading = false;
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

  allowOnlyDigits(event: KeyboardEvent): void {
    const charCode = event.key.charCodeAt(0);
  
    // Allow only 0-9
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
  
  removeLeadingZeros(item: any): void {
    if (item.targetB) {
      item.targetB = item.targetB.replace(/^0+/, ''); // remove leading zeros
    }
  }

  validateForm() {
    this.isFormValid = this.assignCropsArr.some(
      (crop) => crop.targetA > 0 || crop.targetB > 0 || crop.targetC > 0
    );
  }

  pressEditIcon(item: AssignCrops, grade: string) {
    if (grade === 'A') item.preValueA = item.targetA;
    if (grade === 'B') item.preValueB = item.targetB;
    if (grade === 'C') item.preValueC = item.targetC;
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
    this.newTargetObj.date = this.formatDate(this.selectDate);
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
  preValueA!: number;
  preValueB!: number;
  preValueC!: number;
}

class NewTarget {
  companyCenterId!: number;
  date!: string;
  crop!: AssignCrops[];
}
