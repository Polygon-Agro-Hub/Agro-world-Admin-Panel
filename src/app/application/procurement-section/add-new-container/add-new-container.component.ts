import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
// TODO: adjust these two paths/names to your project
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { ProcumentsService } from '../../../services/procuments/procuments.service';

interface ContainerData {
  labelName: string;
  weight: string;
}

@Component({
  selector: 'app-add-new-container',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './add-new-container.component.html',
  styleUrl: './add-new-container.component.css',
})
export class AddNewContainerComponent implements OnInit {
  itemId: number | null = null;
  isEditMode = false;
  isLoading = false;

  containerData: ContainerData = { labelName: '', weight: '' };

  touched: Record<string, boolean> = {};
  attemptedSubmit = false;
  weightError = '';

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private procumentService: ProcumentsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId = Number(id);
      this.isEditMode = true;
      this.loadContainer();
    }
  }

  // ---------- Load (edit mode) ----------
  loadContainer(): void {
    this.isLoading = true;
    this.procumentService.getCrateById(this.itemId!).subscribe({
      next: (res) => {
        this.containerData = {
          labelName: res.data.labelName,
          weight: String(res.data.weight),
        };
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(
          'error',
          'Error',
          err?.error?.error || 'Failed to load container',
        );
        this.back();
      },
    });
  }

  // ---------- Validation ----------
  onBlur(field: keyof ContainerData): void {
    this.touched[field] = true;
    if (field === 'weight') this.validateWeight();
  }

  isFieldInvalid(field: keyof ContainerData): boolean {
    const value = (this.containerData[field] ?? '').toString().trim();
    return (this.touched[field] || this.attemptedSubmit) && !value;
  }

  validateWeight(): void {
    const value = this.containerData.weight?.toString().trim();
    if (!value) {
      this.weightError = '';
      return;
    }
    const num = Number(value);
    if (isNaN(num) || num <= 0) {
      this.weightError = 'Weight must be a number greater than 0.';
    } else {
      this.weightError = '';
    }
  }

  // ---------- Input helpers ----------
  handleInputWithSpaceTrimming(
    event: KeyboardEvent,
    field: keyof ContainerData,
  ): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  allowOnlyDecimal(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Home',
      'End',
    ];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey)
      return;

    const input = event.target as HTMLInputElement;
    const isDigit = /^[0-9]$/.test(event.key);
    const isSingleDot = event.key === '.' && !input.value.includes('.');

    if (!isDigit && !isSingleDot) {
      event.preventDefault();
    }
  }

  // ---------- Actions ----------
  onSubmit(): void {
    this.attemptedSubmit = true;
    this.validateWeight();

    if (
      !this.containerData.labelName?.trim() ||
      !this.containerData.weight?.toString().trim() ||
      this.weightError
    ) {
      return;
    }

    const labelName = this.containerData.labelName.trim();
    const weight = Number(this.containerData.weight);

    this.isLoading = true;

    const request$ = this.isEditMode
      ? this.procumentService.updateCrate(this.itemId!, labelName, weight)
      : this.procumentService.createCrate(labelName, weight);

    request$.subscribe({
      next: (res) => {
        this.isLoading = false;
        this.showMessage(
          'success',
          'Success',
          res?.message ||
            (this.isEditMode
              ? 'Container updated successfully'
              : 'Container created successfully'),
        ).then(() => this.back());
      },
      error: (err) => {
        this.isLoading = false;
        this.showMessage(
          'error',
          err?.status === 409 ? 'Duplicate Label' : 'Error',
          err?.error?.error || 'Something went wrong',
        );
      },
    });
  }

  onCancel(): void {
    this.back();
  }

  back(): void {
    this.location.back();
  }

  // ---------- Alerts (swap for your own toast/alert service) ----------
  private showMessage(icon: 'success' | 'error', title: string, text: string) {
    return Swal.fire({ icon, title, text, confirmButtonColor: '#3980C0' });
  }
}
