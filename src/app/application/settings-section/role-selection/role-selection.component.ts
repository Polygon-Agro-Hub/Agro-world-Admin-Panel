import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { TokenService } from '../../../services/token/services/token.service';
import { RoleSelectionService } from '../../../services/role-selection/role-selection.service';
import Swal from 'sweetalert2';
import { response } from 'express';
import { EmailvalidationsService } from '../../../services/email-validation/emailvalidations.service';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css',
})
export class RoleSelectionComponent {
  isLoading = false;
  isModalOpen: boolean = false;
  iseditModalOpen: boolean = false;
  createRolesObj: CreateRoles = new CreateRoles();
  selectedRole: any = {};
  emailError: string | null = null; // Add error state for create modal
  editEmailError: string | null = null; // Add error state for edit modal

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.emailError = null; // Clear error when modal closes
  this.createRolesObj.email = ''; // Clear email field
  }

  editModalOpen(role: any) {
    this.selectedRole = { ...role };
    this.iseditModalOpen = true;
  }

  editCloseModel() {
    this.iseditModalOpen = false;
    this.editEmailError = null; // Clear error when modal closes
  }

  addSection() {
    // Add logic to save the new section
    console.log('New section added');
    this.closeModal();
  }
  onSubmit() {
    this.validateCreateEmail();

    if (this.emailError) {
    Swal.fire({
      title: 'Validation Error!',
      text: 'Please fix the email validation errors before submitting.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    return;
  }


    this.roleSelectionService.createRoles(this.createRolesObj)?.subscribe(
      (response) => {
        // Show SweetAlert confirmation
        Swal.fire({
          title: 'Success!',
          text: 'Role created successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          // Refresh the page after the user clicks "OK"
          if (result.isConfirmed) {
            window.location.reload(); // Refresh the page
          }
        });
      },
      (error) => {
        // Handle error if the role creation fails
        Swal.fire({
          title: 'Error!',
          text: 'Failed to create role.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  onEditOnSubmit() {
    this.validateEditEmail();
  
  if (this.editEmailError) {
    Swal.fire({
      title: 'Validation Error!',
      text: 'Please fix the email validation errors before submitting.',
      icon: 'error',
      confirmButtonText: 'OK',
    });
    return;
  }

    this.updateRole();
  }

  updateRole() {
    this.roleSelectionService.updateRole(this.selectedRole)?.subscribe(
      (response) => {
        // Show SweetAlert confirmation
        Swal.fire({
          title: 'Success!',
          text: 'Role updated successfully.',
          icon: 'success',
          confirmButtonText: 'OK',
        }).then((result) => {
          // Refresh the page after the user clicks "OK"
          if (result.isConfirmed) {
            window.location.reload(); // Refresh the page
          }
        });
      },
      (error) => {
        // Handle error if the role update fails
        Swal.fire({
          title: 'Error!',
          text: 'Failed to update role.',
          icon: 'error',
          confirmButtonText: 'OK',
        });
      }
    );
  }

  rolesList: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService,
    private tokenService: TokenService,
    private roleSelectionService: RoleSelectionService,
    private emailValidationService: EmailvalidationsService
  ) {}

  ngOnInit() {
    this.getAllRoles();
  }

  getAllRoles() {
    this.isLoading = true;
    this.roleSelectionService.getAllRoles()?.subscribe(
      (response) => {
        this.isLoading = false;
        this.rolesList = response.roles;
        console.log(response);
      },
      (error) => {
        console.error('Error fetching rols', error);
      }
    );
  }

  viewPermissions(id: number) {
    this.router.navigate([`/settings/give-permissions/${id}`]);
  }

  validateCreateEmail(): void {
  if (!this.createRolesObj.email) {
    this.emailError = this.emailValidationService.validationMessages.required;
    return;
  }
  this.emailError = this.emailValidationService.getErrorMessage(this.createRolesObj.email);
}

validateEditEmail(): void {
  if (!this.selectedRole.email) {
    this.editEmailError = this.emailValidationService.validationMessages.required;
    return;
  }
  this.editEmailError = this.emailValidationService.getErrorMessage(this.selectedRole.email);
}
}

export class CreateRoles {
  id!: number;
  role: string = '';
  email: string = '';
}
