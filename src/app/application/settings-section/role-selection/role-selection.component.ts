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
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';
import { RoleSelectionService } from '../../../services/role-selection/role-selection.service';
import Swal from 'sweetalert2';
import { response } from 'express';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css',
})
export class RoleSelectionComponent {
  isModalOpen: boolean = false;
  createRolesObj: CreateRoles = new CreateRoles();

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addSection() {
    // Add logic to save the new section
    console.log('New section added');
    this.closeModal();
  }
  onSubmit() {
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

  rolesList: any[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    public permissionService: PermissionService,
    private tokenService: TokenService,
    private roleSelectionService: RoleSelectionService
  ) {}

  ngOnInit() {
    this.getAllRoles();
  }

  getAllRoles() {
    this.roleSelectionService.getAllRoles()?.subscribe(
      (response) => {
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
}

export class CreateRoles {
  id!: number;
  role: string = '';
  email: string = '';
}
