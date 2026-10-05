import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
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

  private readonly MAX_DECIMALS = 2;

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
          weight: this.formatWeight(res.data.weight),
        };
        this.weightError = '';
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.showMessage(
          'error',
          'Error',
          'Failed to load container. Please try again.',
        ).then(() => this.back());
      },
    });
  }

  // Normalizes a fetched weight to at most 2 decimals, no trailing zeros
  // e.g. "1.500" -> "1.5", 30 -> "30", "2.456" -> "2.46"
  private formatWeight(value: unknown): string {
    const num = Number(value);
    if (value === null || value === undefined || value === '' || isNaN(num)) {
      return '';
    }
    return String(Number(num.toFixed(this.MAX_DECIMALS)));
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
  const decimalPart = value.split('.')[1] ?? '';

  if (isNaN(num) || num < 0) {
    this.weightError = 'Weight must be a valid number (0 or greater).';
  } else if (decimalPart.length > this.MAX_DECIMALS) {
    this.weightError = 'Weight can have up to 2 decimal places only.';
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

  // Blocks invalid keys while typing (digits, one dot, max 2 decimals)
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
    const value = input.value;
    const selStart = input.selectionStart ?? value.length;
    const selEnd = input.selectionEnd ?? value.length;
    const hasSelection = selStart !== selEnd;

    const isDigit = /^[0-9]$/.test(event.key);
    const isDot = event.key === '.';

    if (!isDigit && !isDot) {
      event.preventDefault();
      return;
    }

    // Only one dot allowed (unless the dot is part of the selected text)
    if (isDot) {
      const dotSelected =
        hasSelection && value.slice(selStart, selEnd).includes('.');
      if (value.includes('.') && !dotSelected) {
        event.preventDefault();
      }
      return;
    }

    // Digit: block if caret is after the dot and 2 decimals already exist
    const dotIndex = value.indexOf('.');
    if (
      dotIndex !== -1 &&
      selStart > dotIndex &&
      !hasSelection &&
      value.length - dotIndex - 1 >= this.MAX_DECIMALS
    ) {
      event.preventDefault();
    }
  }

  // Cleans pasted / autofilled values (strips invalid chars, trims to 2 decimals)
  onWeightInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9.]/g, '');

    // keep only the first dot
    const firstDot = value.indexOf('.');
    if (firstDot !== -1) {
      value =
        value.slice(0, firstDot + 1) +
        value.slice(firstDot + 1).replace(/\./g, '');
      const [intPart, decPart] = value.split('.');
      value = intPart + '.' + decPart.slice(0, this.MAX_DECIMALS);
    }

    if (value !== input.value) {
      input.value = value;
    }
    this.containerData.weight = value;

    if (this.touched['weight']) this.validateWeight();
  }

  // ---------- Actions ----------
  onSubmit(): void {
  this.attemptedSubmit = true;
  this.touched['weight'] = true;
  this.validateWeight();

  if (
    !this.containerData.labelName?.trim() ||
    !this.containerData.weight?.toString().trim() ||
    this.weightError
  ) {
    return;
  }

  const labelName = this.containerData.labelName.trim();
  const weight = Number(Number(this.containerData.weight).toFixed(this.MAX_DECIMALS));

  this.isLoading = true;

  const request$ = this.isEditMode
    ? this.procumentService.updateCrate(this.itemId!, labelName, weight)
    : this.procumentService.createCrate(labelName, weight);

  request$.subscribe({
    next: () => {
      this.isLoading = false;
      this.showMessage(
        'success',
        'Success',
        this.isEditMode
          ? 'Container updated successfully'
          : 'Container created successfully',
      ).then(() => this.back());
    },
    error: (err) => {
      this.isLoading = false;
      if (err?.status === 409) {
        this.showMessage(
          'error',
          'Duplicate Label',
          'A container with this label already exists.',
        );
      } else {
        this.showMessage(
          'error',
          'Error',
          'Something went wrong. Please try again.',
        );
      }
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