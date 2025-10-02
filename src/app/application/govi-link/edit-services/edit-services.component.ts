import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
@Component({
  selector: 'app-edit-services',
  standalone: true,
  imports: [FormsModule, CommonModule, LoadingSpinnerComponent],
  templateUrl: './edit-services.component.html',
  styleUrls: ['./edit-services.component.css']
})
export class EditServicesComponent implements OnInit {
  serviceId!: number;
  serviceData = {
    englishName: '',
    sinhalaName: '',
    tamilName: '',
    srvFee: 0
  };

  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Add this flag
  isView = false; // Set to true when you only want to view

  constructor(
    private route: ActivatedRoute,
    private goviLinkService: GoviLinkService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.serviceId = Number(this.route.snapshot.paramMap.get('id'));

    // Check query param for view mode
    this.route.queryParams.subscribe(params => {
      this.isView = params['view'] === 'true';
    });

    // Fetch service data
    this.isLoading = true;
    this.goviLinkService.getOfficerServiceById(this.serviceId).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.serviceData = {
          englishName: res.englishName,
          sinhalaName: res.sinhalaName,
          tamilName: res.tamilName,
          srvFee: Number(res.srvFee)
        };
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to fetch service details.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-white dark:bg-gray-800 text-black dark:text-white',
            title: 'font-semibold text-lg'
          }
        });
        console.error('Error fetching service:', err);
      }
    });
  }

  goBack() {
  this.router.navigate(['/govi-link/action/view-services-list']); // replace with your list page route
}



  back(): void {
  // Only show confirmation when not in view mode
  if (!this.isView) {
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
     this.router.navigate(['/govi-link/action/view-services-list']);
      }
    });
  } else {
    // If in view mode, just go back without confirmation
  this.router.navigate(['/govi-link/action/view-services-list']);
  }
}

  allowOnlyLetters(event: KeyboardEvent) {
  const char = event.key;
  // Use Unicode property escapes to allow all letters and spaces
  // This works for English, Sinhala, Tamil, etc.
  const regex = /^\p{L}$/u; // \p{L} matches any kind of letter from any language

  if (!regex.test(char) && char !== ' ') {
    event.preventDefault();
  }
}


  onUpdateService(form: NgForm) {
    const missingFields: string[] = [];

    if (!this.serviceData.englishName?.trim()) {
      missingFields.push('Service Name in English is required');
    }
    if (!this.serviceData.sinhalaName?.trim()) {
      missingFields.push('Service Name in Sinhala is required');
    }
    if (!this.serviceData.tamilName?.trim()) {
      missingFields.push('Service Name in Tamil is required');
    }
    if (this.serviceData.srvFee === null || this.serviceData.srvFee === undefined) {
      missingFields.push('Service Fee is required');
    } else if (this.serviceData.srvFee < 0) {
      missingFields.push('Service Fee cannot be negative');
    }

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
          htmlContainer: 'text-left'
        }
      });
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
this.goviLinkService.updateOfficerService(this.serviceId, this.serviceData).subscribe({
  next: (response) => {
    this.isLoading = false;
    Swal.fire({
      icon: 'success',
      title: 'Success',
      text: 'Service updated successfully!',
      confirmButtonText: 'OK',
    }).then(() => {
      this.router.navigate(['/govi-link/action/view-services-list']);
    });
  },
  error: (error) => {
    this.isLoading = false;
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Failed to update service. Please try again.',
      confirmButtonText: 'OK',
    });
  }
});

  }

  resetForm(form: NgForm) {
    form.resetForm();
    this.serviceData = {
      englishName: '',
      sinhalaName: '',
      tamilName: '',
      srvFee: 0
    };
  }

// Called on blur or after each keyup to format first letter
formatEnglishName() {
  if (this.serviceData.englishName) {
    // Trim leading spaces
    this.serviceData.englishName = this.serviceData.englishName.trimStart();
    // Capitalize first letter
    this.serviceData.englishName =
      this.serviceData.englishName.charAt(0).toUpperCase() +
      this.serviceData.englishName.slice(1);
  }
}

capitalizeFirstLetter() {
  if (this.serviceData.englishName) {
    const value = this.serviceData.englishName;
    // Capitalize first letter, keep the rest as-is
    this.serviceData.englishName = value.charAt(0).toUpperCase() + value.slice(1);
  }
}

blockLeadingSpace(event: KeyboardEvent) {
  const input = event.target as HTMLInputElement;

  // If cursor is at the start and space is pressed, prevent it
  if (input.selectionStart === 0 && event.code === 'Space') {
    event.preventDefault();
  }
}
// Called on keydown to block space at start
blockFirstSpace(event: KeyboardEvent) {
  const input = (event.target as HTMLInputElement).value;
  if (input.length === 0 && event.code === 'Space') {
    event.preventDefault();
  }
}

  formatSrvFee() {
    if (this.serviceData.srvFee !== null && this.serviceData.srvFee !== undefined) {
      let value = this.serviceData.srvFee.toString();
      if (value.includes('.')) {
        const [intPart, decimalPart] = value.split('.');
        this.serviceData.srvFee = parseFloat(intPart + '.' + decimalPart.slice(0, 2));
      }
    }
  }

  blockAfterTwoDecimals(event: any) {
    let value = event.target.value;
    if (value.includes('.')) {
      const [intPart, decimalPart] = value.split('.');
      if (decimalPart.length > 2) {
        event.target.value = intPart + '.' + decimalPart.slice(0, 2);
        this.serviceData.srvFee = parseFloat(event.target.value);
      }
    }
  }

onCancel(form: NgForm) {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the entered data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No, Keep Editing',
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold'
    }
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
