import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import {
  CertificateCompanyService,
  ClusterMember,
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-view-cluster-users',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './view-cluster-users.component.html',
  styleUrls: ['./view-cluster-users.component.css'],
})
export class ViewClusterUsersComponent implements OnInit {
  users: ClusterMember[] = [];
  filteredUsers: ClusterMember[] = [];
  isLoading = false;
  hasData: boolean = false;
  clusterId!: number;
  clusterName: string = 'Loading...';
  searchTerm: string = '';
  isAddFarmerModalOpen: boolean = false;
  farmIdError: string = '';
  newFarmerFarmId: string = '';
  newFarmerNIC: string = '';
  nicError: string = '';
  isDeleteModalOpen: boolean = false;
  farmerToDelete: ClusterMember | null = null;
  clusterStatus: string = '';

  constructor(
    private farmerClusterService: CertificateCompanyService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    public tokenService: TokenService
  ) { }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.clusterId = +params['clusterId'];
      if (this.clusterId) {
        this.fetchClusterUsers();
      }
    });
  }

  fetchClusterUsers(searchTerm: string = '') {
    this.isLoading = true;
    this.farmerClusterService.getClusterMembers(this.clusterId, searchTerm).subscribe(
      (response: any) => {
        this.isLoading = false;

        if (response.data) {
          // Set cluster name and status
          this.clusterName = response.data.clusterName || 'Unknown Cluster';
          this.clusterStatus = response.data.clusterStatus || '';

          // Set users list
          this.users = response.data.members || [];
          this.filteredUsers = [...this.users];
          this.hasData = this.users.length > 0;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching cluster users:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch cluster members.',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
  }

  onNICInput(event: any) {
    // Remove special characters, only allow alphanumeric
    const value = event.target.value;
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '');

    if (value !== sanitized) {
      this.newFarmerNIC = sanitized;
      event.target.value = sanitized;
    }

    // Real-time validation matching submit validation
    const trimmedNIC = this.newFarmerNIC.trim();

    if (trimmedNIC.length === 0) {
      this.nicError = 'NIC is required';
    } else if (trimmedNIC.length < 9) {
      this.nicError = 'NIC must be at least 9 characters';
    } else {
      this.nicError = ''; // Clear error when valid
    }
  }
  onNICPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedText = event.clipboardData?.getData('text') || '';
    const sanitized = pastedText.replace(/[^a-zA-Z0-9]/g, '');
    this.newFarmerNIC = sanitized.substring(0, 12); // Respect maxlength

    // Real-time validation matching submit validation
    const trimmedNIC = this.newFarmerNIC.trim();

    if (trimmedNIC.length === 0) {
      this.nicError = 'NIC is required';
    } else if (trimmedNIC.length < 9) {
      this.nicError = 'NIC must be at least 9 characters';
    } else {
      this.nicError = '';
    }
  }
  onSearch() {
    // Only search when search icon is clicked
    this.fetchClusterUsers(this.searchTerm.trim());
  }

  offSearch() {
    this.searchTerm = '';
    this.fetchClusterUsers(); // Fetch all users without search term
  }

  // Open delete confirmation modal
  openDeleteModal(user: ClusterMember) {
    this.farmerToDelete = user;
    this.isDeleteModalOpen = true;
  }

  // Close delete confirmation modal
  closeDeleteModal() {
    this.isDeleteModalOpen = false;
    this.farmerToDelete = null;
  }

  // Confirm and execute deletion
  confirmDelete() {
    if (this.farmerToDelete) {
      this.removeUserFromCluster(this.farmerToDelete);
      this.closeDeleteModal();
    }
  }

  // Remove user
  removeUser(user: ClusterMember) {
    this.openDeleteModal(user);
  }

  removeUserFromCluster(user: ClusterMember) {
    this.isLoading = true;
    this.farmerClusterService
      .removeUserFromCluster(this.clusterId, user.farmerId)
      .subscribe(
        (response: any) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Success!',
            text: response.message || 'User removed successfully from cluster',
            icon: 'success',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          // Refresh the user list after removal
          this.fetchClusterUsers(this.searchTerm);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error removing user:', error);
          Swal.fire({
            title: 'Error',
            text: error.error?.message || 'Failed to remove user from cluster',
            icon: 'error',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      );
  }

  onBack(): void {
    this.location.back();
  }

  addNew() {
    this.newFarmerNIC = '';
    this.newFarmerFarmId = '';
    this.nicError = 'NIC is required'; // Show initial error
    this.farmIdError = 'Farm ID is required'; // Show initial error
    this.isAddFarmerModalOpen = true;
  }

  closeAddFarmerModal() {
    this.isAddFarmerModalOpen = false;
    this.nicError = '';
    this.farmIdError = '';
  }

  submitAddFarmer() {
    this.nicError = '';
    this.farmIdError = '';

    // Validate NIC
    const trimmedNIC = this.newFarmerNIC.trim();
    if (!trimmedNIC) {
      this.nicError = 'NIC is required';
      return;
    }

    if (trimmedNIC.length < 9) {
      this.nicError = 'NIC must be at least 9 characters';
      return;
    }

    // Validate Farm ID
    const trimmedFarmId = this.newFarmerFarmId.trim();
    if (!trimmedFarmId) {
      this.farmIdError = 'Farm ID is required';
      return;
    }

    this.isLoading = true;

    // Prepare data to send to backend
    const addFarmerData = {
      nic: trimmedNIC,
      farmId: trimmedFarmId,
    };

    this.farmerClusterService
      .addFarmerToCluster(this.clusterId, addFarmerData)
      .subscribe(
        (response: any) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Success!',
            text: response.message || 'Farmer added successfully',
            icon: 'success',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          // Refresh with current search term
          this.fetchClusterUsers(this.searchTerm);
          this.closeAddFarmerModal();
        },
        (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Failed to add farmer';

          // Check if error is specifically for NIC or Farm ID
          if (errorMessage.toLowerCase().includes('nic')) {
            this.nicError = errorMessage;
          } else if (errorMessage.toLowerCase().includes('farm')) {
            this.farmIdError = errorMessage;
          } else {
            this.nicError = errorMessage;
          }
        }
      );
  }

}