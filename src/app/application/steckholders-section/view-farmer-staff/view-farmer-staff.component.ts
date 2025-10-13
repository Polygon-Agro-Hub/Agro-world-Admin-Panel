import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-farmer-staff',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
    DropdownModule
  ],
  templateUrl: './view-farmer-staff.component.html',
  styleUrl: './view-farmer-staff.component.css'
})
export class ViewFarmerStaffComponent implements OnInit {
  staffArr!: Staff[];
  hasData: boolean = false;
  isLoading: boolean = true;
  farmerId!: number;
  farmerName: string = '';
  farmerNumber: string = '';
  selectedRole: string = '';
  searchText: string = '';

  roleArr = [
    { label: 'Supervisor', value: 'Supervisor' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Laborer', value: 'Laborer' },
  ];

  constructor(
    public tokenService: TokenService,
    private plantcareService: PlantcareUsersService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public permissionService: PermissionService
  ) { }
  ngOnInit(): void {
    this.farmerId = this.route.snapshot.params['id'];
    this.farmerName = this.route.snapshot.queryParams['fname'];
    this.farmerNumber = this.route.snapshot.queryParams['phone'];
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.searchText = this.searchText.trim()
    this.plantcareService.getAllFarmerStaff(this.farmerId, this.selectedRole, this.searchText).subscribe(
      (res) => {
        console.log(res);
        // Map API response to Staff objects
        this.staffArr = res.result.map((item: any) => {
          const staff = new Staff();
          staff.id = item.id;
          staff.firstName = item.firstName;
          staff.lastName = item.lastName;
          staff.phoneCode = item.phoneCode;
          staff.phoneNumber = item.phoneNumber;
          staff.role = item.role;
          staff.nic = item.nic;
          staff.image = item.image;
          staff.modifyBy = item.modifyBy;
          staff.modifiedByUserName = item.modifiedByUserName;
          return staff;
        });
        this.hasData = this.staffArr.length > 0;
        this.isLoading = false;
      },
      (err) => {
        console.error(err);
        this.isLoading = false;
      }
    );
  }

  viewFarmerStaff(id: number) {
    this.router.navigate(['/steckholders/action/farmers/view-farmer-owner', id]);
  }

  editFarmerStaff(id: number) {
    this.router.navigate(['/steckholders/action/farmers/edit-user-staff', id]);
  }

  deleteFarmStaff(id: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You are about to delete this farm staff member. This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg',
        cancelButton: 'bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.executeDeleteFarmStaff(id);
      }
    });
  }

  private executeDeleteFarmStaff(id: number) {
    this.isLoading = true;
    this.plantcareService.deleteFarmStaff(id).subscribe(
      (res) => {
        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: res.message,
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.fetchData();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: res.message,
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while deleting. Please try again.',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchData();
  }

}

class Staff {
  id!: number;
  firstName!: string;
  lastName!: string;
  phoneCode!: string;
  phoneNumber!: string;
  role!: string;
  nic!: string | null;
  image!: string | null;
  modifyBy!: number | null;
  modifiedByUserName!: string | null;
}

