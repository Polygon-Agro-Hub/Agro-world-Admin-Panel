import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-user-staff',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './edit-user-staff.component.html',
  styleUrls: ['./edit-user-staff.component.css']
})
export class EditUserStaffComponent implements OnInit {

  ownerId!: number;
  owner: FarmOwner = new FarmOwner();
  isLoading: boolean = true;
roles: string[] = ['Supervisor', 'Manager', 'Laber'];
phoneCodes: string[] = ['+94', '+91', '+1', '+44']; // add all codes you need

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private plantcareService: PlantcareUsersService,
    public tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.ownerId = +this.route.snapshot.params['id']; // Get owner ID from route
    this.fetchOwner();
  }

  formatName(event: any, field: 'firstName' | 'lastName') {
  let value: string = event.target.value;

  // Block first character as space
  if (value.length === 1 && value[0] === ' ') {
    value = '';
  }

  // Capitalize first letter
  if (value.length > 0) {
    value = value[0].toUpperCase() + value.slice(1);
  }

  this.owner[field] = value;
}
blockFirstSpace(event: KeyboardEvent) {
  const input = (event.target as HTMLInputElement).value;

  // If the input is empty and user presses space, prevent it
  if (input.length === 0 && event.key === ' ') {
    event.preventDefault();
  }
}
// Block numbers & special characters (allow only letters + spaces from ANY language)
blockInvalidNameInput(event: KeyboardEvent): void {
  // Allow navigation/control keys
  const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

  if (controlKeys.includes(event.key)) {
    return; // allow editing and navigation
  }

  // Allow letters in any language + spaces
  const allowed = /^[\p{L} ]$/u;

  if (!allowed.test(event.key)) {
    event.preventDefault();
  }
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
        window.history.back(); // Go back to the previous page
      }
    });
  }

  fetchOwner(): void {
    this.isLoading = true;
    this.plantcareService.getFarmOwnerById(this.ownerId).subscribe({
      next: (res) => {
        this.owner = res.result;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching farm owner:', err);
        this.isLoading = false;
      }
    });
  }

  save(): void {
    this.isLoading = true;
    this.plantcareService.updateFarmOwner(this.ownerId, this.owner).subscribe({
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
          window.history.back(); // Go back to previous page
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
}

export class FarmOwner {
  id!: number;
  firstName: string = '';
  lastName: string = '';
  phoneCode: string = '';
  phoneNumber: string = '';
  nic: string = '';
  role: string = '';
  district: string = '';
  accHolderName: string = '';
  accNumber: string = '';
  bankName: string = '';
  branchName: string = '';
}
