import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import {
  CertificateCompanyService,
  ClusterMember,
  Certificate,
} from '../../../services/plant-care/certificate-company.service';

interface District {
  name: string;
  value: string;
}

interface ClusterData {
  clusterId: number;
  clusterName: string;
  clusterStatus: string;
  district: string;
  certificateId: number;
  certificateName: string;
  certificateNumber: string;
  lastModifiedBy: string;
  lastModifiedOn: string;
  createdAt: string;
  members: ClusterMember[];
  totalMembers: number;
}

@Component({
  selector: 'app-edit-farmer-cluster',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
  ],
  templateUrl: './edit-farmer-cluster.component.html',
  styleUrls: ['./edit-farmer-cluster.component.css'],
})
export class EditFarmerClusterComponent implements OnInit {
  users: ClusterMember[] = [];
  filteredUsers: ClusterMember[] = [];
  isLoading = false;
  hasData: boolean = false;
  clusterId!: number;
  clusterData: ClusterData | null = null;
  clusterName: string = '';
  originalClusterName: string = '';
  selectedDistrict: string = '';
  originalDistrict: string = '';
  selectedCertificateId: number | null = null;
  originalCertificateId: number | null = null;
  searchTerm: string = '';
  isAddFarmerModalOpen: boolean = false;
  newFarmerNIC: string = '';
  newFarmerFarmId: string = '';
  nicError: string = '';
  farmIdError: string = '';
  nameError: string = '';
  isDeleteModalOpen: boolean = false;
  farmerToDelete: ClusterMember | null = null;
  formSubmitted: boolean = false;
  certificates: Certificate[] = [];
  isInitializing: boolean = false;

  districts: District[] = [
    { name: 'Ampara', value: 'Ampara' },
    { name: 'Anuradhapura', value: 'Anuradhapura' },
    { name: 'Badulla', value: 'Badulla' },
    { name: 'Batticaloa', value: 'Batticaloa' },
    { name: 'Colombo', value: 'Colombo' },
    { name: 'Galle', value: 'Galle' },
    { name: 'Gampaha', value: 'Gampaha' },
    { name: 'Hambantota', value: 'Hambantota' },
    { name: 'Jaffna', value: 'Jaffna' },
    { name: 'Kalutara', value: 'Kalutara' },
    { name: 'Kandy', value: 'Kandy' },
    { name: 'Kegalle', value: 'Kegalle' },
    { name: 'Kilinochchi', value: 'Kilinochchi' },
    { name: 'Kurunegala', value: 'Kurunegala' },
    { name: 'Mannar', value: 'Mannar' },
    { name: 'Matale', value: 'Matale' },
    { name: 'Matara', value: 'Matara' },
    { name: 'Monaragala', value: 'Monaragala' },
    { name: 'Mullaitivu', value: 'Mullaitivu' },
    { name: 'Nuwara Eliya', value: 'Nuwara Eliya' },
    { name: 'Polonnaruwa', value: 'Polonnaruwa' },
    { name: 'Puttalam', value: 'Puttalam' },
    { name: 'Rathnapura', value: 'Rathnapura' },
    { name: 'Trincomalee', value: 'Trincomalee' },
    { name: 'Vavuniya', value: 'Vavuniya' },
  ];

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
        this.loadCertificates();
        this.fetchClusterUsers();
      }
    });
  }

  fetchClusterUsers() {
    this.isLoading = true;
    this.farmerClusterService.getClusterMembers(this.clusterId).subscribe(
      (response: any) => {
        this.isLoading = false;

        if (response.data) {
          this.clusterData = response.data;

          // Set form values
          this.clusterName = response.data.clusterName || '';
          this.originalClusterName = this.clusterName;

          this.selectedDistrict = response.data.district || '';
          this.originalDistrict = this.selectedDistrict;

          this.selectedCertificateId = response.data.certificateId || null;
          this.originalCertificateId = this.selectedCertificateId;

          // Set users list
          this.users = response.data.members || [];
          this.filteredUsers = [...this.users];
          this.hasData = this.users.length > 0;
        }
      },
      (error) => {
        this.isLoading = false;
        console.error('Error fetching cluster users:', error);
        this.showErrorPopup('Error', 'Failed to fetch cluster members.');
      }
    );
  }

  loadCertificates(): void {
    this.isInitializing = true;
    this.farmerClusterService.getFarmerClusterCertificates().subscribe({
      next: (response) => {
        this.isInitializing = false;
        if (response.status && response.data) {
          this.certificates = response.data;
        } else {
          this.showErrorPopup(
            'Certificate Load Error',
            'Failed to load certificates. Please try again.'
          );
        }
      },
      error: (error) => {
        this.isInitializing = false;
        console.error('Error loading certificates:', error);
        this.showErrorPopup(
          'Certificate Load Error',
          'Failed to load certificates. Please try again.'
        );
      },
    });
  }

  getSelectedCertificateName(): string {
    const selectedCert = this.certificates.find(
      (cert) => cert.id === this.selectedCertificateId
    );
    return selectedCert
      ? `${selectedCert.srtName} (${selectedCert.srtNumber})`
      : '';
  }

  hasChanges(): boolean {
    return (
      this.clusterName !== this.originalClusterName ||
      this.selectedDistrict !== this.originalDistrict ||
      this.selectedCertificateId !== this.originalCertificateId
    );
  }

  // New method to handle cluster name keydown events
  onClusterNameKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;
    
    // Block space if it's at the beginning or if the field is empty
    if (event.key === ' ') {
      // Block space if:
      // 1. Cursor is at position 0 (beginning)
      // 2. OR the field is empty
      // 3. OR there's only whitespace content
      if (cursorPosition === 0 || !this.clusterName.trim()) {
        event.preventDefault();
        return;
      }
      
      // Optional: Block consecutive spaces
      // You can remove this if you want to allow spaces in the middle
      const previousChar = this.clusterName.charAt(cursorPosition - 1);
      if (previousChar === ' ') {
        event.preventDefault();
        return;
      }
    }
  }

  // Updated cluster name input handler
  onClusterNameInput(): void {
    // Trim leading and trailing spaces
    const trimmedName = this.clusterName.trim();
    
    // If the original value has leading spaces, update the model
    if (this.clusterName !== trimmedName) {
      this.clusterName = trimmedName;
    }
    
    // Validation
    if (trimmedName.length === 0) {
      this.nameError = 'Cluster name is required';
    } else {
      this.nameError = '';
    }
  }

  updateCluster() {
    this.formSubmitted = true;
    this.nameError = '';

    // Validate required fields
    if (!this.clusterName.trim()) {
      this.nameError = 'Cluster name is required';
      return;
    }

    if (!this.selectedDistrict) {
      Swal.fire({
        title: 'Validation Error',
        text: 'District is required',
        icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    if (!this.selectedCertificateId) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Certificate selection is required',
        icon: 'error',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isLoading = true;
    const updateData = {
      clusterName: this.clusterName.trim(),
      district: this.selectedDistrict,
      certificateId: this.selectedCertificateId,
    };
    Swal.fire({
      title: 'Are you sure?',
      text: ' Do you really want to update this cluster?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'No, Cancel',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.farmerClusterService
          .updateFarmerCluster(this.clusterId, updateData)
          .subscribe(
            (response: any) => {
              this.isLoading = false;
              Swal.fire({
                title: 'Success!',
                text: response.message || 'Cluster updated successfully',
                icon: 'success',
                customClass: {
                  popup:
                    'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                  title: 'font-semibold text-lg',
                },
              }).then(() => {
                this.goBack();
              });
            },
            (error) => {
              this.isLoading = false;
              this.nameError = error.error?.message || 'Failed to update cluster';
            }
          );
      }
      this.isLoading = false;

    });

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
        user.phoneNumber?.toLowerCase().includes(term) ||
        user.farmerName.toLowerCase().includes(term) ||
        user.farmId.toString().includes(term) ||
        user.farmName?.toLowerCase().includes(term)
    );
  }

  offSearch() {
    this.searchTerm = '';
    this.filteredUsers = [...this.users];
  }

  onCancel() {
    if (this.hasChanges()) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'You have unsaved changes. Do you want to cancel without saving?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Cancel',
        cancelButtonText: 'No, Continue Editing',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.goBack();
        }
      });
    } else {
      this.goBack();
    }
  }

  goBack() {
    this.location.back();
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
          // Remove user from local arrays
          this.users = this.users.filter((u) => u.farmerId !== user.farmerId);
          this.filteredUsers = this.filteredUsers.filter(
            (u) => u.farmerId !== user.farmerId
          );
          this.hasData = this.users.length > 0;

          // Update cluster data
          if (this.clusterData) {
            this.clusterData.members = this.users;
            this.clusterData.totalMembers = this.users.length;
          }
        },
        (error) => {
          this.isLoading = false;
          console.error('Error removing user:', error);
          this.showErrorPopup(
            'Error',
            error.error?.message || 'Failed to remove user from cluster'
          );
        }
      );
  }

  onBack(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Keep Editing',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  addNew() {
    this.newFarmerNIC = '';
    this.newFarmerFarmId = '';
    this.nicError = '';
    this.farmIdError = '';
    this.isAddFarmerModalOpen = true;
  }

  closeAddFarmerModal() {
    this.isAddFarmerModalOpen = false;
    this.nicError = '';
    this.farmIdError = '';
  }

  restrictNICInput(event: KeyboardEvent): void {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
    const char = event.key;
    const currentValue = this.newFarmerNIC || '';
    const currentLength = currentValue.length;

    // Allow control keys
    if (allowedKeys.includes(char)) {
      return;
    }

    // Get cursor position
    const input = event.target as HTMLInputElement;
    const cursorPosition = input.selectionStart || 0;

    // For 10th character position (index 9), only allow V or X
    if (cursorPosition === 9 && currentLength === 9 && /^[vVxX]$/.test(char)) {
      return;
    }

    // For positions 1-9, only allow digits
    if (cursorPosition < 9 && /^\d$/.test(char)) {
      return;
    }

    // For positions 10-12 (after 9 digits without V/X), only allow digits
    if (cursorPosition >= 9 && currentLength >= 9 && /^\d$/.test(char)) {
      // Check if position 9 (10th character) is NOT V or X
      const charAtPosition9 = currentValue.charAt(9);
      if (!charAtPosition9 || /^\d$/.test(charAtPosition9)) {
        return;
      }
    }

    // Block everything else
    event.preventDefault();
  }

  onNICInput(): void {
    const trimmedNIC = this.newFarmerNIC.trim();

    if (trimmedNIC.length === 0) {
      this.nicError = 'NIC is required';
    } else if (trimmedNIC.length < 10) {
      this.nicError = 'NIC must be at least 10 characters';
    } else if (trimmedNIC.length === 10 && !/^\d{9}[vVxX]$/i.test(trimmedNIC)) {
      this.nicError = 'Invalid NIC format. Old NIC should be 9 digits followed by V';
    } else if (trimmedNIC.length === 12 && !/^\d{12}$/.test(trimmedNIC)) {
      this.nicError = 'Invalid NIC format. New NIC should be 12 digits';
    } else if (trimmedNIC.length > 12) {
      this.nicError = 'NIC cannot exceed 12 characters';
    } else if (trimmedNIC.length === 11) {
      this.nicError = 'Invalid NIC length';
    } else {
      this.nicError = '';
    }
  }

  // Add method to validate Farm ID on input
  onFarmIdInput(): void {
    const trimmedFarmId = this.newFarmerFarmId.trim();

    if (trimmedFarmId.length === 0) {
      this.farmIdError = '';
    } else {
      this.farmIdError = '';
    }
  }

  submitAddFarmer() {
    this.nicError = '';
    this.farmIdError = '';

    // Validate NIC
    if (!this.newFarmerNIC.trim()) {
      this.nicError = 'NIC is required';
      return;
    }

    const trimmedNIC = this.newFarmerNIC.trim();

    if (trimmedNIC.length < 10) {
      this.nicError = 'NIC must be at least 10 characters';
      return;
    }

    if (trimmedNIC.length === 10 && !/^\d{9}[vVxX]$/i.test(trimmedNIC)) {
      this.nicError = 'Invalid NIC format. Old NIC should be 9 digits followed by V or X';
      return;
    }

    if (trimmedNIC.length === 12 && !/^\d{12}$/.test(trimmedNIC)) {
      this.nicError = 'Invalid NIC format. New NIC should be 12 digits';
      return;
    }

    if (trimmedNIC.length === 11 || trimmedNIC.length > 12) {
      this.nicError = 'Invalid NIC format';
      return;
    }

    // Validate Farm ID
    if (!this.newFarmerFarmId.trim()) {
      this.farmIdError = 'Farm ID is required';
      return;
    }

    this.isLoading = true;

    const addFarmerData = {
      nic: this.newFarmerNIC.trim(),
      farmId: this.newFarmerFarmId.trim()
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
          this.fetchClusterUsers();
          this.closeAddFarmerModal();
        },
        (error) => {
          this.isLoading = false;
          const errorMessage = error.error?.message || 'Failed to add farmer';

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

  isAddFarmerFormValid(): boolean {
    const trimmedNIC = this.newFarmerNIC.trim();
    const isValidLength = trimmedNIC.length === 10 || trimmedNIC.length === 12;
    const isValidFormat =
      (trimmedNIC.length === 10 && /^\d{9}[vVxX]$/i.test(trimmedNIC)) ||
      (trimmedNIC.length === 12 && /^\d{12}$/.test(trimmedNIC));

    return isValidLength &&
      isValidFormat &&
      this.newFarmerFarmId.trim().length > 0 &&
      !this.isLoading;
  }

  private showErrorPopup(title: string, message: string) {
    Swal.fire({
      title: title,
      text: message,
      icon: 'error',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
  }
}