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
  newFarmerNIC: string = '';
  nicError: string = '';

  constructor(
    private farmerClusterService: CertificateCompanyService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    public tokenService: TokenService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.clusterId = +params['clusterId'];
      if (this.clusterId) {
        this.fetchClusterUsers();
      }
    });
  }

  fetchClusterUsers() {
    this.isLoading = true;
    this.farmerClusterService.getClusterMembers(this.clusterId).subscribe(
      (response: any) => {
        this.isLoading = false;

        // Set cluster name
        this.clusterName = response.data?.clusterName || 'Unknown Cluster';

        // Set users list
        this.users = response.data?.members || [];
        this.filteredUsers = [...this.users];
        this.hasData = this.users.length > 0;
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

  onSearch() {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
      return;
    }

    const term = this.searchTerm.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (user) =>
        user.nic.toLowerCase().includes(term) ||
        user.phoneNumber.toLowerCase().includes(term)
    );
  }

  offSearch() {
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
  }

  removeUser(user: ClusterMember) {
    Swal.fire({
      html: ` <br/>
      Are you sure you want to remove the following farmer from this cluster? <br/><br/><br/>
      <span>Farmer Name :</span> ${user.firstName} ${user.lastName} <br/>
      <span>Farmer NIC :</span> ${user.nic} <br/>
    `,
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      cancelButtonText: 'No, Cancel',
      confirmButtonText: 'Yes, Remove',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.removeUserFromCluster(user);
      }
    });
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
          // Remove user from local arrays
          this.users = this.users.filter((u) => u.farmerId !== user.farmerId);
          this.filteredUsers = this.filteredUsers.filter(
            (u) => u.farmerId !== user.farmerId
          );
          this.hasData = this.users.length > 0;
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
    this.isAddFarmerModalOpen = true;
  }

  closeAddFarmerModal() {
    this.isAddFarmerModalOpen = false;
  }

  submitAddFarmer() {
    this.nicError = '';

    if (!this.newFarmerNIC.trim()) {
      this.nicError = 'NIC is required';
      return;
    }

    if (this.newFarmerNIC.trim().length < 9) {
      this.nicError = 'NIC must be at least 9 characters';
      return;
    }

    this.isLoading = true;
    this.farmerClusterService
      .addFarmerToCluster(this.clusterId, this.newFarmerNIC.trim())
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
          this.fetchClusterUsers();
          this.closeAddFarmerModal();
        },
        (error) => {
          this.isLoading = false;
          this.nicError = error.error?.message || 'Failed to add farmer';
        }
      );
  }
}
