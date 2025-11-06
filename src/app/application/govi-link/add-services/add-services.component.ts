import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; 
import { CommonModule } from '@angular/common';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-services',
  standalone: true,
  imports: [FormsModule, LoadingSpinnerComponent, CommonModule],
  templateUrl: './add-services.component.html',
  styleUrls: ['./add-services.component.css']
})
export class AddServicesComponent {
  serviceData: {
    englishName: string;
    tamilName: string;
    sinhalaName: string;
    srvFee?: number;
  } = {
    englishName: '',
    tamilName: '',
    sinhalaName: ''
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private goviLinkService: GoviLinkService, private router: Router ) {}

  onSubmit(form: NgForm) {
    const missingFields: string[] = [];

    // Validate English Name
    if (!this.serviceData.englishName?.trim()) {
      missingFields.push('Service Name in English is required');
    }

    // Validate Sinhala Name
    if (!this.serviceData.sinhalaName?.trim()) {
      missingFields.push('Service Name in Sinhala is required');
    }

    // Validate Tamil Name
    if (!this.serviceData.tamilName?.trim()) {
      missingFields.push('Service Name in Tamil is required');
    }

    // Validate Service Fee
    if (this.serviceData.srvFee === null || this.serviceData.srvFee === undefined) {
      missingFields.push('Service Fee is required');
    } else if (this.serviceData.srvFee < 0) {
      missingFields.push('Service Fee cannot be negative');
    }

    // Show popup if there are missing/invalid fields
    if (missingFields.length > 0) {
      let errorMessage = '<div class="text-left"><ul class="list-disc pl-5">';
      missingFields.forEach((field) => {
        errorMessage += `<li>${field}</li>`;
      });
      errorMessage += '</ul></div>';

      Swal.fire({
        icon: 'error',
        title: 'Missing or Invalid Fields',
        html: errorMessage,
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
          title: 'font-semibold text-lg',
          htmlContainer: 'text-left',
        },
      });
      return;
    }

    // Show confirmation popup before creating the service
    this.showConfirmationPopup(form);
  }

  showConfirmationPopup(form: NgForm) {
    Swal.fire({
      icon: 'question',
      title: 'Are you sure?',
      text: 'Do you really want to create this service?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Create',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // If user confirms, proceed with saving the service
        this.saveService(form);
      }
      // If user cancels, do nothing and stay on the form
    });
  }

  saveService(form: NgForm) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.goviLinkService.saveOfficerService(this.serviceData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = response.message;

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Service added successfully!',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          this.resetForm(form);
          // ✅ Navigate to view services list
          this.router.navigate(['/govi-link/action/view-services-list']);
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Failed to save service. Please try again.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to save service. Please try again.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        console.error('Error:', error);
      },
    });
  }

  resetForm(form: NgForm) {
    form.resetForm(); // resets both model and form state
    this.serviceData = {
      englishName: '',
      sinhalaName: '',
      tamilName: ''
    };
  }

  formatEnglishName() {
    if (this.serviceData.englishName) {
      // Trim leading spaces and capitalize first letter
      this.serviceData.englishName = this.serviceData.englishName.trimStart();
      this.serviceData.englishName =
        this.serviceData.englishName.charAt(0).toUpperCase() +
        this.serviceData.englishName.slice(1);
    }
  }

  blockFirstSpace(event: KeyboardEvent) {
    // If the input is empty and user presses space, prevent it
    if (this.serviceData.englishName.length === 0 && event.code === 'Space') {
      event.preventDefault();
    }
  }

  formatSrvFee() {
    if (this.serviceData.srvFee !== null && this.serviceData.srvFee !== undefined) {
      let value = this.serviceData.srvFee.toString();

      if (value.includes('.')) {
        const [intPart, decimalPart] = value.split('.');
        // Keep only first 2 digits after decimal
        this.serviceData.srvFee = parseFloat(intPart + '.' + decimalPart.slice(0, 2));
      }
    }
  }

  blockAfterTwoDecimals(event: any) {
    let value = event.target.value;

    if (value.includes('.')) {
      const [intPart, decimalPart] = value.split('.');
      if (decimalPart.length > 2) {
        // Truncate to 2 decimal digits
        event.target.value = intPart + '.' + decimalPart.slice(0, 2);
        this.serviceData.srvFee = parseFloat(event.target.value);
      }
    }
  }

  onCancel(form: NgForm) {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling.',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Reset form if needed
        this.resetForm(form);
        // Navigate to view services list
        this.router.navigate(['/govi-link/action/view-services-list']);
      }
      // If user clicked "No", do nothing and stay on the page
    });
  }
}