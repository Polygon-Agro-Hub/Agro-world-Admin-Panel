import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';

interface Reason {
  id: number;
  indexNo: number;
  rsnEnglish: string;
  rsnSinhala: string;
  rsnTamil: string;
}

@Component({
  selector: 'app-transport-reasons-to-hold',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DragDropModule, LoadingSpinnerComponent],
  templateUrl: './transport-reasons-to-hold.component.html',
  styleUrls: ['./transport-reasons-to-hold.component.css'],
})
export class TransportReasonsToHoldComponent implements OnInit {
  reasonForm!: FormGroup;
  reasons: Reason[] = [];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private distributionService: DistributionHubService,
    public permissionService: PermissionService,
    public tokenService: TokenService
  ) { }

  ngOnInit(): void {
    this.reasonForm = this.fb.group({
      indexNo: [{ value: '', disabled: true }],
      rsnEnglish: ['', [Validators.required]],
      rsnSinhala: ['', [Validators.required]],
      rsnTamil: ['', [Validators.required]],
    });

    this.loadReasons();
  }

  // Load all reasons from backend
  loadReasons(): void {
    this.isLoading = true;
    this.distributionService.getAllHoldReasons().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          this.reasons = response.data;
          this.updateFormIndexNo();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error loading reasons:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to load reasons. Please try again.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }

  onBack(): void {
    this.location.back();
  }

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  private updateFormIndexNo(): void {
    this.reasonForm.patchValue({
      indexNo: this.reasons.length + 1,
    });
  }

  onSubmit(): void {
    if (this.reasonForm.invalid) {
      this.reasonForm.markAllAsTouched();

      // Show validation errors
      const errors: string[] = [];
      if (this.reasonForm.get('rsnEnglish')?.errors?.['required']) {
        errors.push('Reason (in English) is required');
      }
      if (this.reasonForm.get('rsnSinhala')?.errors?.['required']) {
        errors.push('Reason (in Sinhala) is required');
      }
      if (this.reasonForm.get('rsnTamil')?.errors?.['required']) {
        errors.push('Reason (in Tamil) is required');
      }

      if (errors.length > 0) {
        const errorsList = errors.map((error) => `<li>${error}</li>`).join('');
        Swal.fire({
          icon: 'error',
          title: 'Missing Information',
          html: `
            <div class="text-left">
              <p class="mb-3">Please fill in the following required fields:</p>
              <ul class="list-disc list-inside space-y-1">
                ${errorsList}
              </ul>
            </div>
          `,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
      return;
    }

    const formValue = this.reasonForm.getRawValue();
    const reasonData = {
      rsnEnglish: formValue.rsnEnglish.trim(),
      rsnSinhala: formValue.rsnSinhala.trim(),
      rsnTamil: formValue.rsnTamil.trim(),
    };

    // Create new reason
    this.isLoading = true;
    this.distributionService.createHoldReason(reasonData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: response.message || 'Reason added successfully.',
            timer: 2000,
            showConfirmButton: false,
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.loadReasons();
          this.reasonForm.reset();
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error creating reason:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.error?.error === `Data too long for column 'rsnEnglish' at row 1` ? 'The message is too long. Please limit it to a maximum of 250 words.' : 'Failed to add reason. Please try again.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      },
    });
  }

  onDelete(id: number): void {
    // Check if trying to delete ID 1
    if (id === 1) {
      Swal.fire({
        icon: 'error',
        title: 'Cannot Delete',
        text: 'The default reason (ID: 1) cannot be deleted.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      return;
    }

    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'Do you want to delete this reason?',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.distributionService.deleteHoldReason(id).subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.status) {
              Swal.fire({
                icon: 'success',
                title: 'Deleted',
                text: response.message || 'Reason deleted successfully.',
                timer: 2000,
                showConfirmButton: false,
                customClass: {
                  popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              });
              this.loadReasons();
            }
          },
          error: (error) => {
            this.isLoading = false;
            console.error('Error deleting reason:', error);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: error.error?.message || 'Failed to delete reason. Please try again.',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
      }
    });
  }

  onCancel(): void {
    if (this.reasonForm.dirty) {
      Swal.fire({
        icon: 'warning',
        title: 'Are you sure?',
        text: 'You may lose the entered data after canceling!',
        showCancelButton: true,
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No, Keep Editing',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.reasonForm.reset();
          this.updateFormIndexNo();
        }
      });
    } else {
      this.reasonForm.reset();
      this.updateFormIndexNo();
    }
  }

  drop(event: CdkDragDrop<Reason[]>): void {
    moveItemInArray(this.reasons, event.previousIndex, event.currentIndex);
    this.updateIndexes();
    this.saveIndexesToBackend();
  }

  private updateIndexes(): void {
    this.reasons.forEach((reason, i) => {
      reason.indexNo = i + 1;
    });
  }

  private saveIndexesToBackend(): void {
    const indexData = this.reasons.map((reason) => ({
      id: reason.id,
      indexNo: reason.indexNo,
    }));

    this.distributionService.updateHoldReasonIndexes(indexData).subscribe({
      next: (response) => {
        if (response.status) {
          console.log('Indexes updated successfully');
        }
      },
      error: (error) => {
        console.error('Error updating indexes:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to update order. Please refresh the page.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        // Reload to get correct order from server
        this.loadReasons();
      },
    });
  }
}