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

    setTimeout(() => {
      const category = DRIVER_CATEGORY_MOCK_DATA.find((d) => d.id === id);

      if (!category) {
        this.isLoading = false;
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

      this.originalCategory = { ...category };
      this.buildForm(category);
      this.isLoading = false;
    }, 400);
  }

  private buildForm(category?: DriverCategory): void {
    this.form = this.fb.group({
      driverCategoryName: [
        category?.name ?? '',
        [
          Validators.required,
          noDuplicateNameValidator(() => this.getExistingNames()),
        ],
      ],
      payoutPerOrder: [
        category?.payoutPerOrder ?? '',
        [Validators.required, positivePayoutValidator()],
      ],
    });
  }

  private getExistingNames(): string[] {
    return DRIVER_CATEGORY_MOCK_DATA.filter(
      (d) => !this.isEditMode || d.id !== this.categoryId,
    ).map((d) => d.name);
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

    setTimeout(() => {
      const name = (this.form.value.driverCategoryName as string).trim();
      const payout = Number(this.form.value.payoutPerOrder);

      if (this.isEditMode && this.categoryId !== null) {
        const index = DRIVER_CATEGORY_MOCK_DATA.findIndex(
          (d) => d.id === this.categoryId,
        );
        if (index > -1) {
          DRIVER_CATEGORY_MOCK_DATA[index] = {
            ...DRIVER_CATEGORY_MOCK_DATA[index],
            name,
            payoutPerOrder: payout,
          };
        }
      } else {
        DRIVER_CATEGORY_MOCK_DATA.push({
          id: this.getNextId(),
          name,
          payoutPerOrder: payout,
        });
      }

      this.isLoading = false;
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
    }, 600);
  }

  private getNextId(): number {
    return (
      DRIVER_CATEGORY_MOCK_DATA.reduce((max, d) => Math.max(max, d.id), 0) + 1
    );
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

const DRIVER_CATEGORY_MOCK_DATA: DriverCategory[] = [
  { id: 1, name: 'Random Driver', payoutPerOrder: 250.0 },
  { id: 2, name: 'Premium Driver', payoutPerOrder: 350.0 },
  { id: 3, name: 'Bike Driver', payoutPerOrder: 150.0 },
  { id: 4, name: 'Three Wheeler Driver', payoutPerOrder: 200.0 },
];

function noDuplicateNameValidator(
  getExistingNames: () => string[],
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim().toLowerCase();
    if (!value) {
      return null;
    }

    const isDuplicate = getExistingNames().some(
      (name) => name.trim().toLowerCase() === value,
    );

    return isDuplicate ? { duplicate: true } : null;
  };
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
