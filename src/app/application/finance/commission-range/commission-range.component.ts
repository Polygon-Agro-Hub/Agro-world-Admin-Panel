import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
} from '@angular/forms';
import {
  FinanceService,
  AgentCommission,
} from '../../../services/finance/finance.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-commission-range',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './commission-range.component.html',
  styleUrls: ['./commission-range.component.css'],
})
export class CommissionRangeComponent implements OnInit {
  commissionForm!: FormGroup;
  commissions: AgentCommission[] = [];
  isLoading = false;
  isEditing = false;
  hasNewRows = false;
  lastModifiedBy: string | null = '--';
  originalCommissions: AgentCommission[] = [];

  constructor(
    private fb: FormBuilder,
    private financeService: FinanceService,
    private location: Location,
    public tokenService: TokenService,
    public permissionService: PermissionService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadCommissions();
  }

  initForm(): void {
    this.commissionForm = this.fb.group({
      commissionRanges: this.fb.array([]),
    });
  }

  get commissionRanges(): FormArray {
    return this.commissionForm.get('commissionRanges') as FormArray;
  }

  createCommissionRange(commission?: AgentCommission): FormGroup {
    return this.fb.group(
      {
        id: [commission?.id || null],
        minRange: [
          commission?.minRange || '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        maxRange: [
          commission?.maxRange || '',
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern('^[0-9]*$'),
          ],
        ],
        value: [
          commission?.value || 0,
          [
            Validators.required,
            Validators.min(0),
            Validators.pattern('^[0-9]*(.[0-9]{1,2})?$'),
          ],
        ],
        isNew: [commission?.id ? false : true],
        modifyByName: [commission?.modifyByName || ''], // Add this field
        modifyByEmail: [commission?.modifyByEmail || ''], // Add this field
      },
      { validators: this.rangeValidator }
    );
  }

  rangeValidator(group: FormGroup): { [key: string]: any } | null {
    const minRange = group.get('minRange')?.value;
    const maxRange = group.get('maxRange')?.value;

    if (
      minRange !== null &&
      maxRange !== null &&
      parseInt(minRange) >= parseInt(maxRange)
    ) {
      return { rangeInvalid: true };
    }
    return null;
  }

  loadCommissions(): void {
    this.isLoading = true;
    this.financeService.getAllAgentCommissions(1, 100).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.commissions = response.data.items;
          this.originalCommissions = JSON.parse(
            JSON.stringify(response.data.items)
          );
          this.populateForm();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading commissions:', error);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load commission ranges',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }

  populateForm(): void {
    this.commissionRanges.clear();
    this.commissions.forEach((commission) => {
      this.commissionRanges.push(this.createCommissionRange(commission));
    });
    this.hasNewRows = false;
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onAddNew(): void {
    const newRange = this.createCommissionRange();
    this.commissionRanges.push(newRange);
    this.hasNewRows = true;

    setTimeout(() => {
      const newRow = document.getElementById(
        `row-${this.commissionRanges.length - 1}`
      );
      if (newRow) {
        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  onCancel(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'All unsaved changes will be lost!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Continue Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.resetForm();
      }
    });
  }

  resetForm(): void {
    this.isEditing = false;
    this.hasNewRows = false;
    this.loadCommissions();
  }

  // Update method with optimized change detection
  onUpdate(): void {
    if (this.commissionForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;

    const updatePromises: Promise<any>[] = [];
    const createPromises: Promise<any>[] = [];

    this.commissionRanges.controls.forEach((control, index) => {
      const formData = control.value;

      if (formData.id && !formData.isNew) {
        // Find original commission data
        const originalCommission = this.originalCommissions.find(
          (oc) => oc.id === formData.id
        );

        if (originalCommission) {
          // Build update data with ONLY changed fields
          const updateData: any = {};
          let hasChanges = false;

          // Check minRange change
          const newMinRange = parseInt(formData.minRange);
          if (newMinRange !== originalCommission.minRange) {
            updateData.minRange = newMinRange;
            hasChanges = true;
          }

          // Check maxRange change
          const newMaxRange = parseInt(formData.maxRange);
          if (newMaxRange !== originalCommission.maxRange) {
            updateData.maxRange = newMaxRange;
            hasChanges = true;
          }

          // Check value change
          const newValue = parseFloat(formData.value);
          if (newValue !== originalCommission.value) {
            updateData.value = newValue;
            hasChanges = true;
          }

          // Only send update if there are changes
          if (hasChanges) {
            updatePromises.push(
              this.financeService
                .updateAgentCommission(formData.id, updateData)
                .toPromise()
            );
          } else {
          }
        }
      } else if (formData.isNew) {
        // Create new commission - send only necessary fields
        const createData = {
          minRange: parseInt(formData.minRange),
          maxRange: parseInt(formData.maxRange),
          value: parseFloat(formData.value) || 0,
        };
        createPromises.push(
          this.financeService.createAgentCommission(createData).toPromise()
        );
      }
    });

    // Execute all promises
    const allPromises = [...updatePromises, ...createPromises];

    if (allPromises.length === 0) {
      this.isLoading = false;
      Swal.fire({
        icon: 'info',
        title: 'No Changes',
        text: 'No changes detected to update.',
        timer: 2000,
        showConfirmButton: false,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    Promise.all(allPromises)
      .then(() => {
        this.isLoading = false;
        const totalUpdates = updatePromises.length + createPromises.length;
        let message = 'Commission ranges updated successfully!';

        if (updatePromises.length > 0 && createPromises.length > 0) {
          message = `${updatePromises.length} commission(s) updated and ${createPromises.length} new commission(s) created successfully!`;
        } else if (updatePromises.length > 0) {
          message = `${updatePromises.length} commission(s) updated successfully!`;
        } else if (createPromises.length > 0) {
          message = `${createPromises.length} new commission(s) created successfully!`;
        }

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Commission Updated Successfully',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        }).then(() => {
          this.resetForm();
        });
      })
      .catch((error) => {
        this.isLoading = false;
        // Extract the specific error message from the response
        let errorMessage = 'Failed to update commission ranges';

        if (error.error && error.error.message) {
          // If the error has a specific message from the API
          errorMessage = error.error.message;
        } else if (error.message) {
          // If it's a general error message
          errorMessage = error.message;
        } else if (error.status === 400) {
          // For bad request errors
          errorMessage = 'Invalid data provided. Please check your inputs.';
        } else if (error.status === 409) {
          // For conflict errors (like overlapping ranges)
          errorMessage = 'Commission range conflicts with existing ranges.';
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      });
  }

  onCreate(): void {
    if (this.commissionForm.invalid) {
      this.markAllFieldsAsTouched();
      this.showValidationErrors();
      return;
    }

    this.isLoading = true;

    const createPromises: Promise<any>[] = [];

    this.commissionRanges.controls.forEach((control) => {
      const formData = control.value;

      if (formData.isNew) {
        const createData = {
          minRange: parseInt(formData.minRange),
          maxRange: parseInt(formData.maxRange),
          value: parseFloat(formData.value) || 0,
        };
        createPromises.push(
          this.financeService.createAgentCommission(createData).toPromise()
        );
      }
    });

    Promise.all(createPromises)
      .then(() => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `${createPromises.length} new commission range(s) created successfully!`,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        }).then(() => {
          this.resetForm();
        });
      })
      .catch((error) => {
        this.isLoading = false;
        console.error('Error creating commissions:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to create commission ranges',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      });
  }

  onDelete(index: number): void {
    const commission = this.commissionRanges.at(index).value;

    if (commission.isNew) {
      this.commissionRanges.removeAt(index);
      this.hasNewRows = this.commissionRanges.controls.some(
        (control) => control.value.isNew
      );
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'This commission range will be permanently deleted!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.financeService.deleteAgentCommission(commission.id).subscribe({
          next: () => {
            this.loadCommissions();
            Swal.fire({
              icon: 'success',
              title: 'Deleted',
              text: 'Commission range deleted successfully!',
              timer: 2000,
              showConfirmButton: false,
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold',
              },
            });
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error deleting commission:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to delete commission range',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }

  markAllFieldsAsTouched(): void {
    this.commissionRanges.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }

  showValidationErrors(): void {
    const invalidRows = this.commissionRanges.controls
      .map((control, index) => ({ control, index }))
      .filter(({ control }) => control.invalid);

    if (invalidRows.length > 0) {
      const firstInvalidRow = invalidRows[0];
      const errors = firstInvalidRow.control.errors;

      let errorMessage = 'Please fix the following errors:\n';

      if (errors?.['required']) {
        errorMessage += '- All fields are required\n';
      }
      if (errors?.['min'] || errors?.['pattern']) {
        errorMessage += '- Values must be valid positive numbers\n';
      }
      if (errors?.['rangeInvalid']) {
        errorMessage += '- Max range must be greater than min range\n';
      }

      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: errorMessage,
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });

      const invalidRowElement = document.getElementById(
        `row-${firstInvalidRow.index}`
      );
      if (invalidRowElement) {
        invalidRowElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }
  }

  onBack(): void {
    this.location.back();
  }

  // Helper methods for template
  getRowId(index: number): string {
    return `row-${index}`;
  }

  isRowInvalid(index: number): boolean {
    const control = this.commissionRanges.at(index);
    return control.invalid && control.touched;
  }

  isUpdateDisabled(): boolean {
    return this.commissionRanges.controls.some((control) => {
      const minRange = control.get('minRange');
      const maxRange = control.get('maxRange');

      return (
        control.invalid ||
        !minRange?.value ||
        !maxRange?.value ||
        minRange.invalid ||
        maxRange.invalid
      );
    });
  }

  isCreateDisabled(): boolean {
    return this.commissionRanges.controls.some((control) => {
      if (control.value.isNew) {
        const minRange = control.get('minRange');
        const maxRange = control.get('maxRange');

        return (
          control.invalid ||
          !minRange?.value ||
          !maxRange?.value ||
          minRange.invalid ||
          maxRange.invalid
        );
      }
      return false;
    });
  }

  getPageTitle(): string {
    return this.isEditing ? 'Edit Commission Range' : 'Commission Range';
  }

  isNewRow(index: number): boolean {
    return this.commissionRanges.at(index).value.isNew;
  }

  hasOnlyNewRows(): boolean {
    return (
      this.commissionRanges.controls.length > 0 &&
      this.commissionRanges.controls.every((control) => control.value.isNew)
    );
  }

  getActionButtonText(): string {
    if (this.hasOnlyNewRows()) {
      return 'Create';
    } else if (this.hasNewRows) {
      return 'Create';
    } else {
      return 'Update';
    }
  }

  onAction(): void {
    if (this.hasOnlyNewRows()) {
      this.onCreate();
    } else {
      this.onUpdate();
    }
  }

  // Get modified user display name
  getModifiedUserDisplay(index: number): string {
    const control = this.commissionRanges.at(index);
    const modifyByName = control.get('modifyByName')?.value;

    if (modifyByName) {
      return `${modifyByName}`;
    } else {
      return 'Unknown';
    }
  }
}
