import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../../services/collection-officer/collection-officer.service'; // TODO: update path/class name to match your actual service

@Component({
  selector: 'app-add-edit-driver-category',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './add-edit-driver-category.component.html',
  styleUrl: './add-edit-driver-category.component.css',
})
export class AddEditDriverCategoryComponent implements OnInit {
  form!: FormGroup;

  isLoading = false;
  isEditMode = false;

  isCompleted = false;

  categoryId: number | null = null;
  private originalCategory: DriverCategory | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private location: Location,
    private collectionOfficerService: CollectionOfficerService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.isEditMode = true;
      this.categoryId = Number(id);
      this.loadCategory(this.categoryId);
    } else {
      this.isEditMode = false;
      this.buildForm();
    }
  }

  private loadCategory(id: number): void {
    this.isLoading = true;

    this.collectionOfficerService.getDriveCategoryById(id).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (!res || !res.status || !res.result) {
          Swal.fire({
            icon: 'error',
            title: 'Not Found',
            text: 'Driver category not found.',
            confirmButtonColor: '#3980C0',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          }).then(() => this.location.back());
          return;
        }

        const category: DriverCategory = {
          id: res.result.id,
          name: res.result.catName,
          payoutPerOrder: res.result.payout,
        };

        this.originalCategory = { ...category };
        this.buildForm(category);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching driver category:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load driver category. Please try again.',
          confirmButtonColor: '#3980C0',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        }).then(() => this.location.back());
      },
    });
  }

  private buildForm(category?: DriverCategory): void {
    this.form = this.fb.group({
      driverCategoryName: [
        category?.name ?? '',
        [Validators.required],
      ],
      payoutPerOrder: [
        category?.payoutPerOrder ?? '',
        [Validators.required, positivePayoutValidator()],
      ],
    });
  }

  onNameInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart;
    let value = input.value;

    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    this.form.get('driverCategoryName')?.setValue(value);

    setTimeout(() => input.setSelectionRange(cursorPos, cursorPos));
  }

  get isActionDisabled(): boolean {
    if (!this.form) {
      return true;
    }

    if (!this.isEditMode) {
      const { driverCategoryName, payoutPerOrder } = this.form.value;
      const hasValues =
        !!(driverCategoryName && driverCategoryName.trim()) &&
        payoutPerOrder !== null &&
        payoutPerOrder !== '';
      return !(hasValues && this.form.valid);
    }

    return !(this.hasChanges() && this.form.valid);
  }

  private hasChanges(): boolean {
    if (!this.originalCategory) {
      return false;
    }

    const { driverCategoryName, payoutPerOrder } = this.form.value;

    return (
      (driverCategoryName ?? '').trim() !== this.originalCategory.name ||
      Number(payoutPerOrder) !== Number(this.originalCategory.payoutPerOrder)
    );
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const name = (this.form.value.driverCategoryName as string).trim();
    const payout = Number(this.form.value.payoutPerOrder);

    const payload = {
      catName: name,
      payout: payout,
    };

    const request$ =
      this.isEditMode && this.categoryId !== null
        ? this.collectionOfficerService.updateDriveCategory(this.categoryId, payload)
        : this.collectionOfficerService.addDriveCategory(payload);

    request$.subscribe({
      next: (res) => {
        this.isLoading = false;

        if (!res || !res.status) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res?.error || 'Something went wrong. Please try again.',
            confirmButtonColor: '#3980C0',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          return;
        }

        this.isCompleted = true;

        Swal.fire({
          icon: 'success',
          title: this.isEditMode ? 'Updated!' : 'Saved!',
          text: this.isEditMode
            ? 'Driver category updated successfully.'
            : 'Driver category added successfully.',
          confirmButtonColor: '#3980C0',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        }).then(() => {
          this.location.back();
        });
      },
      error: (err) => {
        this.isLoading = false;
        console.error(
          this.isEditMode ? 'Error updating drive category:' : 'Error adding drive category:',
          err,
        );

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text:
            err?.error?.error ||
            (this.isEditMode
              ? 'Failed to update driver category. Please try again.'
              : 'Failed to add driver category. Please try again.'),
          confirmButtonColor: '#3980C0',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      },
    });
  }

  onBack(): void {
    if (this.isCompleted) {
      this.location.back();
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      confirmButtonColor: '#3980C0',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  onCancel(): void {
    if (this.isCompleted) {
      this.location.back();
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      confirmButtonColor: '#3980C0',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  onPayoutKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const invalidChars = ['-', '+', 'e', 'E'];

    if (invalidChars.includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (
      event.key >= '0' &&
      event.key <= '9' &&
      input.selectionStart === 1 &&
      input.value === '0'
    ) {
      event.preventDefault();
    }
  }

  onPayoutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Strip any minus sign that slipped through (e.g. via paste)
    if (value.includes('-')) {
      value = value.replace(/-/g, '');
      input.value = value;
      this.form.get('payoutPerOrder')?.setValue(value, { emitEvent: false });
    }
  }
}

export interface DriverCategory {
  id: number;
  name: string;
  payoutPerOrder: number;
}

function positivePayoutValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null || control.value === '') {
      return null;
    }

    const value = Number(control.value);
    if (isNaN(value)) {
      return null;
    }

    return value <= 0 ? { invalidPayout: true } : null;
  };
}