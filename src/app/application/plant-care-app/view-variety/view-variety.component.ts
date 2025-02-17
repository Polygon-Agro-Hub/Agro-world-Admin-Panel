import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { CropCalendarService } from '../../../services/plant-care/crop-calendar.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

interface NewCropGroup {
  id: number;
  cropGroupId: string;
  varietyNameEnglish: string;
  varietyNameSinhala: string;
  varietyNameTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  image: string;
  bgColor: string;
  createdAt: string;
}

@Component({
  selector: 'app-view-variety',
  standalone: true,
  imports: [
    LoadingSpinnerComponent,
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
  ],
  templateUrl: './view-variety.component.html',
  styleUrl: './view-variety.component.css',
})
export class ViewVarietyComponent {
  newCropGroup: NewCropGroup[] = [];
  hasData: boolean = true;
  isLoading = true;
  itemId: number | null = null;
  name!: string;
  total: number | null = null;

  constructor(
    private cropCalendarService: CropCalendarService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
      this.name = params['name'];
      console.log('Received item ID:', this.itemId);
    });
    this.getAllVarietiesByGroup(this.itemId);
  }

  getAllVarietiesByGroup(id: any) {
    this.cropCalendarService.getVarietiesByGroup(id).subscribe(
      (data) => {
        this.isLoading = false;
        this.newCropGroup = data.groups;
        console.log(this.newCropGroup);
        this.hasData = this.newCropGroup.length > 0;
        this.total = this.newCropGroup.length;
      },
      (error) => {
        console.error('Error fetch news:', error);
        if (error.status === 401) {
          this.isLoading = false;
        }
      }
    );
  }

  deleteCropCalender(id: any) {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you really want to delete this crop variety item? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.cropCalendarService.deleteCropVariety(id).subscribe(
          (data: any) => {
            if (data) {
              Swal.fire(
                'Deleted!',
                'The crop variety item has been deleted.',
                'success'
              );
              this.getAllVarietiesByGroup(this.itemId);
            }
          },
          (error) => {
            console.error('Error deleting crop variety:', error);
            Swal.fire(
              'Error!',
              'There was an error deleting the crop variety.',
              'error'
            );
          }
        );
      }
    });
  }

  editVarity(id: number) {
    this.router.navigate(['/admin/plant-care/action/create-crop-variety'], {
      queryParams: { id },
    });
  }
}
