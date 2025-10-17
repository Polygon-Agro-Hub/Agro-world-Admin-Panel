import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import  Swal  from 'sweetalert2';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-edit-user-staff',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, DropdownModule],
  templateUrl: './edit-user-staff.component.html',
  styleUrls: ['./edit-user-staff.component.css']
})
export class EditUserStaffComponent implements OnInit {
  userForm!: FormGroup;
  ownerId!: number;
  isLoading: boolean = true;
  roles: string[] = ['Supervisor', 'Manager', 'Laber'];
  phoneCodes: string[] = ['+94', '+91', '+1', '+44'];
  isPhoneInvalid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private plantcareService: PlantcareUsersService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.ownerId = +this.route.snapshot.params['id'];

    // Initialize the form with validators
    this.userForm = this.fb.group({
      firstName: ['', [
        Validators.required,
        Validators.pattern(/^\p{L}+[\p{L}\s]*$/u),
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.pattern(/^\p{L}+[\p{L}\s]*$/u),
        Validators.maxLength(50)
      ]],
      phoneCode: ['', [Validators.required]],
      phoneNumber: ['', [
        Validators.required,
        Validators.pattern(/^[0-9]{9}$/)
      ]],
      nic: ['', [
        Validators.required,
        Validators.pattern(/^(\d{12}|\d{9}[Vv])$/)
      ]],
      role: ['', [Validators.required]]
    });

    this.fetchOwner();
  }

  // Capitalize first letter of name fields on change
  formatName(field: string) {
    const control = this.userForm.get(field);
    let value = control?.value;
    if (value) {
      value = value.trimStart();
      if (value.length > 0) {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
      control?.setValue(value, { emitEvent: false });
    }
  }

  // Listen to form changes for firstName, lastName, and nic
  ngAfterViewInit() {
    this.userForm.get('firstName')?.valueChanges.subscribe(() => this.formatName('firstName'));
    this.userForm.get('lastName')?.valueChanges.subscribe(() => this.formatName('lastName'));
    this.userForm.get('nic')?.valueChanges.subscribe((value) => this.formatNIC(value));
  }

  // Restrict input to numbers only
  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode || event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
    const input = (event.target as HTMLInputElement).value;
    if (input.length >= 9 && charCode !== 8 && charCode !== 46) {
      event.preventDefault();
    }
  }

  // Validate Sri Lankan phone number
  validateSriLankanPhone(value: string): void {
    this.isPhoneInvalid = false;
    const phoneCode = this.userForm.get('phoneCode')?.value;
    if (value && phoneCode === '+94') {
      if (!value.startsWith('7') || value.length !== 9) {
        this.isPhoneInvalid = true;
      }
    }
    if (value) {
      const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 9);
      this.userForm.get('phoneNumber')?.setValue(digitsOnly, { emitEvent: true }); // Trigger validation
    }
  }

  // Format NIC input
  formatNIC(value: string) {
    if (!value) return;
    let formatted = value.toUpperCase().replace(/[^0-9V]/g, '');
    if (formatted.includes('V') && formatted[formatted.length - 1] !== 'V') {
      formatted = formatted.replace(/V/g, '') + 'V';
    }
    if (formatted.endsWith('V') && formatted.length > 10) {
      formatted = formatted.slice(0, 10);
    } else if (!formatted.endsWith('V') && formatted.length > 12) {
      formatted = formatted.slice(0, 12);
    }
    this.userForm.get('nic')?.setValue(formatted, { emitEvent: true }); // Trigger validation
  }

  // Mark all controls as touched to show validation errors
  markFormAsTouched() {
    Object.values(this.userForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  fetchOwner(): void {
    this.isLoading = true;
    this.plantcareService.getFarmOwnerById(this.ownerId).subscribe({
      next: (res) => {
        this.userForm.patchValue(res.result);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching farm owner:', err);
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to fetch farm staff details.',
        });
      }
    });
  }

  save(): void {
    if (this.userForm.invalid) {
      this.markFormAsTouched();
      return;
    }

    this.isLoading = true;
    this.plantcareService.updateFarmOwner(this.ownerId, this.userForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Farm staff details have been updated successfully.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          }
        }).then(() => {
          window.history.back();
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to update farm staff details.',
        });
        console.error(err);
      }
    });
  }

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
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        window.history.back();
      }
    });
  }
}