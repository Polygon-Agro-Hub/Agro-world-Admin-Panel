import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    CommonModule,
    HttpClientModule,
    NgxPaginationModule,
    DropdownModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
  ],
  templateUrl: './banner-list.component.html',
  styleUrl: './banner-list.component.css',
})
export class BannerListComponent {
  isRetail = true;
  isLoading = false;
  ViewRetailAddBanner: boolean = false;
  ViewWholesaleAddBanner: boolean = false;
  indexRetail!: number;
  indexWholesale!: number;
  bannerName: string = '';
  bannerNameWholesale: string = '';
  selectedFile: File | null = null;
  selectedFileWholesale: File | null = null;
  feebackList: any[] = [];
  feebackListWhole: any[] = [];
  maxBannersReached = false;
  maxBannersReachedWholesale = false;

  selectedWholesaleImageUrl: string | null = null;
  isDragOver = false;

  selectedRetailImageUrl: string | null = null;
  isDragOverReatil = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private marketPlaceSrv: MarketPlaceService,
    private plantcareUsersService: PlantcareUsersService
  ) {}

  ngOnInit() {
    this.loadNextNumberRetail();
    this.loadNextNumberWholesale();
    this.getAllFeedbacks();
    this.getAllFeedbacksWhole();
  }



  back(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'You may lose the added data after going back!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Go Back',
    cancelButtonText: 'No, Stay Here',
  }).then((result) => {
    if (result.isConfirmed) {
     this.router.navigate(['/market/action']);
    }
  });
}


  toogleRetail(isRetail: boolean) {
    this.isRetail = isRetail;
  }

  addBannerRetail(): void {
    this.ViewRetailAddBanner = true;
  }

  addBannerWholesale(): void {
    this.ViewWholesaleAddBanner = true;
  }

  cancelUploadRetail(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'Your selected image and data will be lost!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No, Keep Editing',
  }).then((result) => {
    if (result.isConfirmed) {
      this.bannerName = '';
      this.selectedFile = null;
      this.selectedRetailImageUrl = null;
      this.ViewRetailAddBanner = false;
    }
  });
}
  cancelUploadWholesale(): void {
  Swal.fire({
    icon: 'warning',
    title: 'Are you sure?',
    text: 'Your selected image and data will be lost!',
    showCancelButton: true,
    confirmButtonText: 'Yes, Cancel',
    cancelButtonText: 'No, Keep Editing',
  }).then((result) => {
    if (result.isConfirmed) {
   this.bannerNameWholesale = '';
    this.selectedFileWholesale = null;
    this.selectedWholesaleImageUrl = null;
    this.ViewWholesaleAddBanner = false;
    }
  });
}




  loadNextNumberRetail() {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.isLoading = true;
    this.http
      .get<any>(
        `${environment.API_URL}market-place/next-reatil-banner-number`,
        { headers }
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.indexRetail = data.nextOrderNumber;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  loadNextNumberWholesale() {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.isLoading = true;
    this.http
      .get<any>(
        `${environment.API_URL}market-place/next-wholesale-banner-number`,
        { headers }
      )
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.indexWholesale = data.nextOrderNumber;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  //   onFileSelectedWholesale(event: any) {
  //   this.selectedFileWholesale = event.target.files[0];
  // }

  // onFileSelectedWholesale(event: Event): void {
  //   const input = event.target as HTMLInputElement | null;
  //   if (input && input.files && input.files[0]) {
  //     this.selectedFileWholesale = input.files[0];
  //     const file = input.files[0];
  //     this.previewImage(file);
  //     // You can also store file for later upload
  //   }
  // }

  onFileSelectedWholesale(event: Event): void {
  const input = event.target as HTMLInputElement | null;

  if (input && input.files && input.files[0]) {
    const file = input.files[0];
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      URL.revokeObjectURL(objectUrl); // Cleanup memory

      // Allow both 1200×450 and 1200×451
      const isValidSize = (width === 1200 && height === 450);

      if (isValidSize) {
        this.selectedFileWholesale = file;
        this.previewImage(file);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Image Dimensions',
          text: 'Please select an Image with dimensions 1200 × 450 px',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
        input.value = ''; // Clear file input
      }
    };

    img.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Could not load the selected image. Please choose a valid image file.',
        confirmButtonColor: '#d33',
      });
      URL.revokeObjectURL(objectUrl);
      input.value = '';
    };

    img.src = objectUrl;
  }
}

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDropWholesale(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.previewImage(file);
      }
    }
  }

  previewImage(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedWholesaleImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  // onFileSelectedRetail(event: Event): void {
  //   const input = event.target as HTMLInputElement | null;
  //   if (input && input.files && input.files[0]) {
  //     this.selectedFile = input.files[0];
  //     const file = input.files[0];
  //     this.previewImageRetail(file);
  //     // You can also store file for later upload
  //   }
  // }

  onFileSelectedRetail(event: Event): void {
  const input = event.target as HTMLInputElement | null;

  if (input && input.files && input.files[0]) {
    const file = input.files[0];
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const width = img.width;
      const height = img.height;

      URL.revokeObjectURL(objectUrl); // Cleanup memory

      // Allow both 1200×450 and 1200×451
      const isValidSize = (width === 1200 && height === 450);

      if (isValidSize) {
        this.selectedFile = file;
        this.previewImageRetail(file);
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Invalid Image Dimensions',
          text: 'Please select an Image with dimensions 1200 × 450 px',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
        input.value = ''; // Clear file input
      }
    };

    img.onerror = () => {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        text: 'Could not load the selected image. Please choose a valid image file.',
        confirmButtonColor: '#d33',
      });
      URL.revokeObjectURL(objectUrl);
      input.value = '';
    };

    img.src = objectUrl;
  }
}

  onDragLeaveRetail(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverReatil = false;
  }

  onDropRetail(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverReatil = false;

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.previewImageRetail(file);
      }
    }
  }

  previewImageRetail(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.selectedRetailImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDragOverRetail(event: DragEvent): void {
    event.preventDefault();
    this.isDragOverReatil = true;
  }

  uploadBanner() {
    this.isLoading = true;
    if (!this.bannerName || !this.selectedFile) {
      console.log(
        'this.bannerName',
        this.bannerName,
        'this.selectedFile',
        this.selectedFile
      );
      this.isLoading = false;
      Swal.fire(
        'Missing Data',
        'Please enter a banner name and select an image.',
        'warning'
      );
      return;
    }

    const formData = new FormData();
    formData.append('index', this.indexRetail.toString());
    formData.append('name', this.bannerName);
    formData.append('image', this.selectedFile);

    this.marketPlaceSrv.uploadRetailBanner(formData).subscribe({
      next: (response) => {
        Swal.fire('Success', 'Banner uploaded successfully!', 'success');
        this.ViewRetailAddBanner = false;
        this.getAllFeedbacks();
        this.isLoading = false;
        this.bannerName = '';
        this.selectedFile = null;
        this.selectedRetailImageUrl = null;
        this.ViewRetailAddBanner = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to upload banner.', 'error');
        this.ViewRetailAddBanner = false;
        this.getAllFeedbacks();
        this.isLoading = false;
        this.bannerName = '';
        this.selectedFile = null;
        this.selectedRetailImageUrl = null;
        this.ViewRetailAddBanner = false;
      },
    });
  }

  uploadBannerWholesale() {
    this.isLoading = true;
    if (!this.bannerNameWholesale || !this.selectedFileWholesale) {
      this.isLoading = false;
      Swal.fire(
        'Missing Data',
        'Please enter a banner name and select an image.',
        'warning'
      );
      return;
    }

    const formData = new FormData();
    formData.append('index', this.indexWholesale.toString());
    formData.append('name', this.bannerNameWholesale);
    formData.append('image', this.selectedFileWholesale!);

    this.marketPlaceSrv.uploadRetailBannerWholesale(formData).subscribe({
      next: (response) => {
        Swal.fire('Success', 'Banner uploaded successfully!', 'success');
        this.ViewWholesaleAddBanner = false;
        this.getAllFeedbacksWhole();
        this.isLoading = false;
        this.bannerNameWholesale = '';
        this.selectedFileWholesale = null;
        this.selectedWholesaleImageUrl = null;
        this.ViewWholesaleAddBanner = false;
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to upload banner.', 'error');
        this.ViewWholesaleAddBanner = false;
        this.getAllFeedbacksWhole();
        this.isLoading = false;
        this.bannerNameWholesale = '';
        this.selectedFileWholesale = null;
        this.selectedWholesaleImageUrl = null;
        this.ViewWholesaleAddBanner = false;
      },
    });
  }

  getAllFeedbacks() {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.isLoading = true;
    this.http
      .get<any>(`${environment.API_URL}market-place/get-all-banners`, {
        headers,
      })
      .subscribe(
        (response) => {
          this.feebackList = response.banners;
          this.maxBannersReached = this.feebackList.length >= 5;
          this.isLoading = false;
        },
        () => {}
      );
  }

  getAllFeedbacksWhole() {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.isLoading = true;
    this.http
      .get<any>(
        `${environment.API_URL}market-place/get-all-banners-wholesale`,
        {
          headers,
        }
      )
      .subscribe(
        (response) => {
          this.feebackListWhole = response.banners;
          this.maxBannersReachedWholesale = this.feebackListWhole.length >= 5;
          this.isLoading = false;
        },
        () => {}
      );
  }
  drop(event: CdkDragDrop<any[]>) {
    this.isLoading = true;
    moveItemInArray(this.feebackList, event.previousIndex, event.currentIndex);
    const updatedFeedbacks = this.feebackList.map((item, index) => ({
      id: item.id,
      orderNumber: index + 1,
    }));
    this.marketPlaceSrv.updateBannerOrder(updatedFeedbacks).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.feebackList.forEach((item, index) => {
            item.orderNumber = index + 1;
          });
          // Swal.fire(
          //   'Success',
          //   'Feedback order updated successfully',
          //   'success'
          // );
          this.getAllFeedbacks();
          this.getAllFeedbacksWhole();
          this.isLoading = false;
        } else {
          Swal.fire('Error', 'Failed to update feedback order', 'error');
          this.getAllFeedbacks();
          this.getAllFeedbacksWhole();
          this.isLoading = false;
        }
      },
      error: () => {
        Swal.fire(
          'Error',
          'An error occurred while updating feedback order',
          'error'
        );
        this.getAllFeedbacks();
        this.getAllFeedbacksWhole();
        this.isLoading = false;
      },
    });
  }

  dropWhole(event: CdkDragDrop<any[]>) {
    this.isLoading = true;
    moveItemInArray(
      this.feebackListWhole,
      event.previousIndex,
      event.currentIndex
    );
    const updatedFeedbacks = this.feebackListWhole.map((item, index) => ({
      id: item.id,
      orderNumber: index + 1,
    }));
    this.marketPlaceSrv.updateBannerOrder(updatedFeedbacks).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.feebackListWhole.forEach((item, index) => {
            item.orderNumber = index + 1;
          });
          // Swal.fire(
          //   'Success',
          //   'Feedback order updated successfully',
          //   'success'
          // );
          this.getAllFeedbacks();
          this.getAllFeedbacksWhole();
          this.isLoading = false;
        } else {
          Swal.fire('Error', 'Failed to update feedback order', 'error');
          this.getAllFeedbacks();
          this.getAllFeedbacksWhole();
          this.isLoading = false;
        }
      },
      error: () => {
        Swal.fire(
          'Error',
          'An error occurred while updating feedback order',
          'error'
        );
        this.getAllFeedbacks();
        this.getAllFeedbacksWhole();
        this.isLoading = false;
      },
    });
  }

  deletebannerRetail(feedbackId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the banner and reorder subsequent banner entries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.marketPlaceSrv.deleteBannerRetail(feedbackId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
            this.loadNextNumberRetail();
            this.loadNextNumberWholesale();
            this.getAllFeedbacks();
            this.getAllFeedbacksWhole();
            // this.loadNextNumber();
          },
          error: () => {
            Swal.fire('Error!', 'Failed to delete Banner.', 'error');
            this.loadNextNumberRetail();
            this.loadNextNumberWholesale();
            this.getAllFeedbacks();
            this.getAllFeedbacksWhole();
          },
        });
      }
    });
  }

  deletebannerWhole(feedbackId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the banner and reorder subsequent banner entries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.marketPlaceSrv.deleteBannerWhole(feedbackId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Banner has been deleted.', 'success');
            this.loadNextNumberRetail();
            this.loadNextNumberWholesale();
            this.getAllFeedbacks();
            this.getAllFeedbacksWhole();
          },
          error: () => {
            Swal.fire('Error!', 'Failed to delete Banner.', 'error');
            this.loadNextNumberRetail();
            this.loadNextNumberWholesale();
            this.getAllFeedbacks();
            this.getAllFeedbacksWhole();
          },
        });
      }
    });
  }
}
