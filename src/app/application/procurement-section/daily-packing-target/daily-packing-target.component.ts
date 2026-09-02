import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-daily-packing-target',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './daily-packing-target.component.html',
  styleUrl: './daily-packing-target.component.css',
})
export class DailyPackingTargetComponent {
  currentDailyTarget: number = 0;
  newTargetValue: any = '';
  isLoading = false;

  constructor(private router: Router) {}

  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/sales-dash']);
      }
    });
  }

  blockFirstSpace(event: KeyboardEvent) {
    const inputEl = event.target as HTMLInputElement;
    const cursorPos = inputEl.selectionStart || 0;

    if (
      event.key === ' ' &&
      (cursorPos === 0 || inputEl.value.charAt(cursorPos - 1) === ' ')
    ) {
      event.preventDefault();
    }
  }

  preventDecimalInput(event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;
    const forbiddenKeys = ['.', ',', 'e', 'E', '+', '-'];
    if (forbiddenKeys.includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === '0' && input.value.length === 0) {
      event.preventDefault();
    }
  }

  validateTargetInput() {
    if (isNaN(this.newTargetValue)) {
      this.newTargetValue = '';
      return;
    }

    if (this.newTargetValue.toString().startsWith('0')) {
      this.newTargetValue = this.newTargetValue.toString().replace(/^0+/, '');
    }

    if (this.newTargetValue === '') {
      return;
    }

    this.newTargetValue = Math.round(this.newTargetValue);
    if (this.newTargetValue < 1) {
      this.newTargetValue = '';
    }
  }

  saveTarget() {
    this.isLoading = true;
    this.validateTargetInput();

    if (
      !this.newTargetValue ||
      this.newTargetValue <= 0 ||
      isNaN(this.newTargetValue)
    ) {
      Swal.fire({
        title: 'Invalid Target',
        text: 'Please Add a Target',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
        },
      });
      this.isLoading = false;
      return;
    }

    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to save the target of ${this.newTargetValue}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Save it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: connect to backend service to persist the new target
        this.currentDailyTarget = this.newTargetValue;
        Swal.fire({
          title: 'Success!',
          text: 'Daily packing target updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        this.newTargetValue = '';
        this.isLoading = false;
      } else {
        this.isLoading = false;
      }
    });
  }
}