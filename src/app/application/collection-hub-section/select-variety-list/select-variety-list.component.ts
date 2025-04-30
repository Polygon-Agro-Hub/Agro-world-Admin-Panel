import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { TargetService } from '../../../services/target-service/target.service';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-select-variety-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './select-variety-list.component.html',
  styleUrl: './select-variety-list.component.css',
})
export class SelectVarietyListComponent {
  @Input() centerDetails!: CenterDetails;
  cropsArr: CenterCrops[] = [];
  hasData: boolean = true;
  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  cropCount: number = 0;
  searchText: string = '';
  isLoading = false;

  constructor(private TargetSrv: TargetService) {}

  ngOnInit(): void {
    this.fetchCenterCrops();
  }

  fetchCenterCrops(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    search: string = this.searchText
  ) {
    this.isLoading = true;
    this.TargetSrv.getCenterCrops(
      this.centerDetails.centerId,
      page,
      limit,
      search
    ).subscribe((res) => {
      this.isLoading = false;
      this.cropsArr = res.items;
      this.cropCount = res.items.length;
      this.hasData = this.cropsArr.length > 0 ? true : false;
      this.totalItems = res.total;
    });
  }

  onSearchVarity() {
    this.fetchCenterCrops();
  }

  offSearchVarity() {
    this.searchText = '';
    this.fetchCenterCrops();
  }

  onAdd(isAssing: number, cropId: number) {
    let isSelected = 0;
    if (isAssing === 1) {
      isSelected = 0;
    } else {
      isSelected = 1;
    }

    let data = {
      centerId: this.centerDetails.centerId,
      isAssign: isSelected,
      cropId: cropId,
    };

    // Show loading indicator
    Swal.fire({
      title: 'Processing...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.TargetSrv.addORremoveCenterCrops(data).subscribe(
      (res) => {
        Swal.close(); // Close loading indicator

        if (res.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text:
              isSelected === 1
                ? 'Crop added successfully'
                : 'Crop removed successfully',
            timer: 2000,
            showConfirmButton: false,
          });
          this.fetchCenterCrops();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: res.message || 'Operation failed',
            timer: 2000,
          });
        }
      },
      (error) => {
        Swal.close(); // Close loading indicator
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'An error occurred',
          timer: 2000,
        });
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchCenterCrops();
  }
}

class CenterDetails {
  centerId!: number;
  centerName!: string;
  regCode!: string;
}

class CenterCrops {
  cropNameEnglish!: string;
  varietyNameEnglish!: string;
  cropId!: number;
  isAssign: number = 0;
}
