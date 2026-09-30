import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
// TODO: adjust this path to where your spinner component lives
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

interface ContainerData {
  labelName: string;
  weight: string;
}

@Component({
  selector: 'app-add-new-container',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './add-new-container.component.html',
  styleUrl: './add-new-container.component.css'
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
    private router: Router,
    private location: Location
    // TODO: inject your service, e.g. private containerService: ContainerService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.itemId = Number(id);
      this.isEditMode = true;
      this.loadContainer();
    }
  }

  loadContainer(): void {
    this.isLoading = true;
    // TODO: replace with your service call
    // this.containerService.getContainerById(this.itemId!).subscribe({
    //   next: (res) => {
    //     this.containerData = {
    //       labelName: res.labelName,
    //       weight: String(res.weight)
    //     };
    //     this.isLoading = false;
    //   },
    //   error: () => (this.isLoading = false)
    // });
    this.isLoading = false;
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
  handleInputWithSpaceTrimming(event: KeyboardEvent, field: keyof ContainerData): void {
    const input = event.target as HTMLInputElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  allowOnlyDecimal(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) return;

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

    const payload = {
      labelName: this.containerData.labelName.trim(),
      weight: Number(this.containerData.weight)
    };

    this.isLoading = true;

    if (this.isEditMode) {
      // TODO: this.containerService.updateContainer(this.itemId!, payload).subscribe(...)
      console.log('Update', this.itemId, payload);
    } else {
      // TODO: this.containerService.createContainer(payload).subscribe(...)
      console.log('Create', payload);
    }

    this.isLoading = false;
  }

  onCancel(): void {
    this.back();
  }

  back(): void {
    this.location.back();
  }
}