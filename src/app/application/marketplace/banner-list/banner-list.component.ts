import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
import { Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environment/environment';
import Swal from 'sweetalert2';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [LoadingSpinnerComponent,
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
  styleUrl: './banner-list.component.css'
})
export class BannerListComponent {
   isRetail = true;
   isLoading = false;
   ViewRetailAddBanner: boolean = false;
   indexRetail!: number;
   bannerName: string = '';
   selectedFile: File | null = null;
     feebackList: any[] = [];

    constructor(
      private http: HttpClient,
      private router: Router,
      public tokenService: TokenService,
      public permissionService: PermissionService,
      private marketPlaceSrv: MarketPlaceService,
      private plantcareUsersService: PlantcareUsersService,
    ) { }


  ngOnInit() {
    this.loadNextNumberRetail();
     this.getAllFeedbacks();

  }


    back(): void {
    this.router.navigate(['/dispatch']);
  }

    toogleRetail(isRetail: boolean) {
    this.isRetail = isRetail;
  }

  addBannerRetail(): void {
     this.ViewRetailAddBanner = true;
  }

  cancelUploadRetail(): void {
     this.ViewRetailAddBanner = false;
  }


  addBannerWhole(): void {
    
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
        .get<any>(`${environment.API_URL}market-place/next-reatil-banner-number`, { headers })
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



  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }



    uploadBanner() {
    if (!this.bannerName || !this.selectedFile) {
      Swal.fire('Missing Data', 'Please enter a banner name and select an image.', 'warning');
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
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', 'Failed to upload banner.', 'error');
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
    this.http
      .get<any>(`${environment.API_URL}market-place/get-all-banners`, {
        headers,
      })
      .subscribe(
        (response) => {
          this.feebackList = response.banners;
        },
        () => {}
      );
  }

    drop(event: CdkDragDrop<any[]>) {
      moveItemInArray(this.feebackList, event.previousIndex, event.currentIndex);
      const updatedFeedbacks = this.feebackList.map((item, index) => ({
        id: item.id,
        orderNumber: index + 1,
      }));
      this.plantcareUsersService.updateFeedbackOrder(updatedFeedbacks).subscribe({
        next: (response: any) => {
          if (response.status) {
            this.feebackList.forEach((item, index) => {
              item.orderNumber = index + 1;
            });
            Swal.fire(
              'Success',
              'Feedback order updated successfully',
              'success'
            );
          } else {
            Swal.fire('Error', 'Failed to update feedback order', 'error');
            this.getAllFeedbacks();
          }
        },
        error: () => {
          Swal.fire(
            'Error',
            'An error occurred while updating feedback order',
            'error'
          );
          this.getAllFeedbacks();
        },
      });
    }


      getColorByOrderNumber(orderNumber: number): string {
    const colors: { [key: number]: string } = {
      1: '#FFF399',
      2: '#FFD462',
      3: '#FF8F61',
      4: '#FE7200',
      5: '#FF3B33',
      6: '#CD0800',
      7: '#850002',
      8: '#51000B',
      9: '#3B0214',
      10: '#777777',
    };
    return colors[orderNumber] || '#FFFFFF';
  }

    deleteFeedback(feedbackId: number): void {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete the feedback and reorder subsequent feedback entries.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
      }).then((result) => {
        if (result.isConfirmed) {
          this.plantcareUsersService.deleteFeedback(feedbackId).subscribe({
            next: () => {
              Swal.fire('Deleted!', 'Feedback has been deleted.', 'success');
              this.getAllFeedbacks();
              // this.loadNextNumber();
            },
            error: () => {
              Swal.fire('Error!', 'Failed to delete feedback.', 'error');
            },
          });
        }
      });
    }


}
