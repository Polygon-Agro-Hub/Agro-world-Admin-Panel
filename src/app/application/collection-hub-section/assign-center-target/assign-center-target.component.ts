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
  isDateValid: boolean = true;
  countCrops: number = 0;
  isNew: boolean = true;
  companyCenterId!: number;
  isFormValid: boolean = false;
  hasData: boolean = false;
  isLoading = false;
  officerName!: string;

  isDateSelected: boolean = true;

  dateError: boolean = false;
  selectDate: Date | null = new Date();

  constructor(private TargetSrv: TargetService) {}

  ngOnInit(): void {
    const today = new Date();
    const tomorrow = new Date(today);

    tomorrow.setDate(today.getDate() + 1);

    this.selectDate = tomorrow;

    this.fetchSavedCenterCrops();
  }

  onDateChange(event: any) {
    if (!event) {
      this.selectDate = null;
      this.isDateSelected = false;
      this.dateError = true;
      this.fetchSavedCenterCrops();
    } else {
      this.isDateSelected = true;
      this.dateError = false;
      this.fetchSavedCenterCrops();
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

    this.isDateValid = true;
    const formattedDate = this.formatDate(this.selectDate);

    this.TargetSrv.getSavedCenterCrops(
      this.centerDetails.centerId,
      formattedDate,
      this.searchText,
    ).subscribe((res) => {
      this.isLoading = false;

      this.assignCropsArr = res.products.map((p: AssignCrops) => ({
        ...p,
        originalTotal: (p.targetA || 0) + (p.targetB || 0) + (p.targetC || 0),
      }));
      this.officerName = res.officerName;
      this.countCrops = res.products.length;
      this.companyCenterId = res.companyCenterId;
      this.hasData = res.products.length > 0;
      this.validateForm();
    });
  }

  private formatDate(date: Date | null | undefined): string {
    if (!date) {
      return '';
    }

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
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
            popup:
              'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
            title: 'font-semibold text-lg',
            htmlContainer: 'text-left',
          },
        });
        this.isLoading = false;
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
      this.isLoading = false;
      return;
    } else {
      if (item.targetC < item.preValueC) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Input',
          html: 'Updated target cannot be less than the initially added target',
          confirmButtonText: 'OK',
          customClass: {
            popup:
              'bg-white dark:bg-[#363636] text-[#534E4E] dark:text-textDark',
            title: 'font-semibold text-lg',
            htmlContainer: 'text-left',
          },
        });
        this.isLoading = false;
        return;
      }
    }

    if (this.isQtyExceeded(item)) {
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
      this.isLoading = false;
      return;
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
            text: 'Target updated successfully',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
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
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while saving the grade',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        console.error('Error saving grade:', error);
      },
    );
  }

  allowOnlyDigits(event: KeyboardEvent): void {
    const key = event.key;
    const input = event.target as HTMLInputElement;

    // Allow navigation/editing keys (Backspace, Delete, Tab, arrows, etc.)
    if (key.length > 1) {
      return;
    }

    // Allow a single decimal point
    if (key === '.') {
      if (input.value.includes('.')) {
        event.preventDefault(); // already has one, block a second
      }
      return;
    }

    // Only allow digits 0-9
    if (!/^[0-9]$/.test(key)) {
      event.preventDefault();
      return;
    }

    // Limit to 3 digits after the decimal point
    const dotIndex = input.value.indexOf('.');
    if (dotIndex !== -1) {
      const cursorPos = input.selectionStart ?? input.value.length;
      const decimalPart = input.value.slice(dotIndex + 1);

      // Only block if the cursor is positioned after the dot (typing a decimal digit)
      if (cursorPos > dotIndex && decimalPart.length >= 3) {
        event.preventDefault();
      }
    }
  }

  removeLeadingZeros(item: any): void {
    if (item.targetB) {
      // Only strip zeros that are followed by another digit (not by "." or end of string)
      item.targetB = item.targetB.replace(/^0+(?=\d)/, '');
    }
  }

  validateForm() {
    this.isFormValid =
      this.assignCropsArr.some(
        (crop) =>
          crop.isNew &&
          (crop.targetA > 0 || crop.targetB > 0 || crop.targetC > 0),
      ) &&
      !this.assignCropsArr.some(
        (crop) => crop.isNew && this.isQtyExceeded(crop),
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
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
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          }).then(() => {
            this.fetchSavedCenterCrops();
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: res.message || 'Failed to assign target',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'An error occurred while assigning target',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        console.error('Error assigning target:', error);
      },
    );
  }

  get systemAppearDate(): string {
    return this.formatDayMonth(this.offsetSelectDate(-1));
  }

  get mustCompleteDate(): string {
    return this.formatDayMonth(this.offsetSelectDate(0));
  }

  get scheduledDeliveryDate(): string {
    return this.formatDayMonth(this.offsetSelectDate(1));
  }

  private offsetSelectDate(offsetDays: number): Date {
    const d = new Date(this.selectDate!);
    d.setDate(d.getDate() + offsetDays);
    return d;
  }

  private formatDayMonth(d: Date): string {
    const day = d.getDate();
    const rem10 = day % 10;
    const rem100 = day % 100;
    let suffix = 'th';
    if (rem100 < 11 || rem100 > 13) {
      if (rem10 === 1) suffix = 'st';
      else if (rem10 === 2) suffix = 'nd';
      else if (rem10 === 3) suffix = 'rd';
    }
    const month = d.toLocaleString('en-US', { month: 'long' });
    return `${day}${suffix} ${month}`;
  }

  checkNegativeValue(item: AssignCrops, grade: string) {
    if (this.isDateValid) {
      if (item.targetA < 0 || item.targetB < 0 || item.targetC < 0) {
        if (grade === 'A') item.targetA = 0;
        if (grade === 'B') item.targetB = 0;
        if (grade === 'C') item.targetC = 0;
        // this.toastSrv.error('Negative values are not allowed.')
      }
    }
    this.validateForm();
  }

  restrictDecimal(event: any, item: AssignCrops, grade: string) {
    item.lastEditedGrade = grade;
    let value = event.target.value;

    if (value.includes('.')) {
      const parts = value.split('.');
      if (parts[1].length > 3) {
        value = parts[0] + '.' + parts[1].substring(0, 3);
        event.target.value = value;

        const parsed = parseFloat(value);
        if (grade === 'A') item.targetA = parsed;
        if (grade === 'B') item.targetB = parsed;
        if (grade === 'C') item.targetC = parsed;
      }
    }
  }

  isQtyExceeded(item: AssignCrops): boolean {
    if (item.isNew) {
      const total =
        (item.targetA || 0) + (item.targetB || 0) + (item.targetC || 0);
      return total > item.remaining;
    }

    const addedA = item.editingA
      ? (item.targetA || 0) - (item.preValueA || 0)
      : 0;
    const addedB = item.editingB
      ? (item.targetB || 0) - (item.preValueB || 0)
      : 0;
    const addedC = item.editingC
      ? (item.targetC || 0) - (item.preValueC || 0)
      : 0;

    return addedA + addedB + addedC > item.remaining;
  }

  maxQty(item: AssignCrops): number {
    return Math.round(item.remaining * 1.02 * 100) / 100;
  }

  isGradeInvalid(item: AssignCrops, grade: string): boolean {
    const target =
      grade === 'A'
        ? item.targetA
        : grade === 'B'
          ? item.targetB
          : item.targetC;
    const preValue =
      grade === 'A'
        ? item.preValueA
        : grade === 'B'
          ? item.preValueB
          : item.preValueC;
    const isEditingGrade =
      grade === 'A'
        ? item.editingA
        : grade === 'B'
          ? item.editingB
          : item.editingC;

    if (target < 0) return true;

    if (!item.isNew && isEditingGrade && target < preValue) return true;

    return (item.isNew || isEditingGrade) && this.isQtyExceeded(item);
  }

  get hasNewItems(): boolean {
    return this.assignCropsArr.some((crop) => crop.isNew);
  }

  get isSelectedDatePast(): boolean {
    if (!this.selectDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(this.selectDate);
    selected.setHours(0, 0, 0, 0);
    return selected < today;
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
  isNew: boolean = true;
  qty: number = 0;
  unitType: string = '';
  lastEditedGrade: string | null = null;
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
  remaining!: number;
  originalTotal: number = 0;
}

class NewTarget {
  companyCenterId!: number;
  date!: string;
  crop!: AssignCrops[];
}
