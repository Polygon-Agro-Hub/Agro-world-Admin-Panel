import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import {
  CertificateCompanyService,
  FarmerCluster,
} from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-view-farmer-clusters',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
  ],
  templateUrl: './view-farmer-clusters.component.html',
  styleUrls: ['./view-farmer-clusters.component.css'],
})
export class ViewFarmerClustersComponent implements OnInit, OnDestroy {
  clusters: FarmerCluster[] = [];
  isLoading = false;
  hasData: boolean = true;
  searchTerm: string = '';
  
  // Status modal properties
  showStatusModal: boolean = false;
  selectedCluster: FarmerCluster | null = null;
  countdown: number = 30;
  countdownInterval: any;
  isCountdownCompleted: boolean = false;

  constructor(
    private farmerClusterService: CertificateCompanyService,
    private router: Router,
    private location: Location,
    public tokenService: TokenService
  ) {}

  ngOnInit() {
    this.fetchClusters();
  }

  ngOnDestroy() {
    this.clearCountdown();
  }

  onSearch() {
    this.fetchClusters();
  }

  offSearch() {
    this.searchTerm = '';
    this.fetchClusters();
  }

  fetchClusters() {
    this.isLoading = true;
    this.farmerClusterService.getAllFarmerClusters(this.searchTerm).subscribe(
      (response) => {
        this.isLoading = false;
        this.clusters = response.data as FarmerCluster[];
        this.hasData = this.clusters.length > 0;
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching clusters:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch farmer clusters.',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      }
    );
  }

  openStatusConfirmation(cluster: FarmerCluster) {
    this.selectedCluster = cluster;
    this.showStatusModal = true;
    this.countdown = 30;
    this.isCountdownCompleted = false;
    
    this.clearCountdown();
    this.countdownInterval = setInterval(() => {
      this.countdown--;
      
      if (this.countdown <= 0) {
        this.isCountdownCompleted = true;
        this.autoCancelStatusUpdate();
      }
    }, 1000);
  }

  cancelStatusUpdate() {
    this.clearCountdown();
    this.showStatusModal = false;
    this.selectedCluster = null;
    this.isCountdownCompleted = false;
    
    // Show cancellation message only if user manually cancelled
    if (this.countdown > 0) {
      Swal.fire({
        title: 'Cancelled',
        text: 'Status update was cancelled.',
        icon: 'info',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  }

  autoCancelStatusUpdate() {
    this.clearCountdown();
    this.showStatusModal = false;
    
    Swal.fire({
      title: 'Time Expired',
      text: 'Status update was automatically cancelled due to inactivity.',
      icon: 'warning',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    
    this.selectedCluster = null;
    this.isCountdownCompleted = false;
  }

  confirmStatusUpdate() {
    this.clearCountdown();
    this.showStatusModal = false;
    this.isCountdownCompleted = false;
    
    if (this.selectedCluster) {
      this.isLoading = true;
      // Call your API to update the cluster status to "Started"
      this.farmerClusterService.updateClusterStatus(this.selectedCluster.clusterId!, 'Started').subscribe(
        (response) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Success!',
            text: 'Cluster status updated to Started.',
            icon: 'success',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          // Refresh the clusters list
          this.fetchClusters();
        },
        (error) => {
          this.isLoading = false;
          Swal.fire({
            title: 'Error',
            text: 'Failed to update cluster status.',
            icon: 'error',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        }
      );
    }
  }

  private clearCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  viewMembers(clusterId: number) {
    this.router.navigate([`/plant-care/action/view-cluster-users`, clusterId]);
  }

  editCluster(clusterId: number) {
    this.router.navigate([`/plant-care/action/edit-farmer-cluster`, clusterId]);
  }

  deleteCluster(clusterId: number) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will delete the entire cluster and cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.isLoading = true;
        this.farmerClusterService.deleteFarmerCluster(clusterId).subscribe(
          (response) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Deleted!',
              text: response.message || 'Cluster deleted successfully',
              icon: 'success',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
            this.fetchClusters();
          },
          (error) => {
            this.isLoading = false;
            Swal.fire({
              title: 'Error',
              text: error.message || 'Failed to delete cluster.',
              icon: 'error',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          }
        );
      }
    });
  }

  addNew() {
    this.router.navigate(['/plant-care/action/add-farmer-clusters']);
  }

  onBack(): void {
    this.location.back();
  }
}