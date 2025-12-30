import { Component } from '@angular/core';
import { DestributionService } from '../../../services/destribution-service/destribution-service.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';

interface DistributedVehicle {
  insNo: string | null;
  vType: string | null;
  vCapacity: string | null;
  regCode: string | null;
  centerName: string | null;
  empId: string;
  createdAt: string;
}

@Component({
  selector: 'app-view-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    NgxPaginationModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-vehicles.component.html',
  styleUrl: './view-vehicles.component.css',
})
export class ViewVehiclesComponent {
  isLoading = false;

  items: DistributedVehicle[] = [];

  page = 1;
  itemsPerPage = 10;
  totalItems = 0;

  centerName?: string;
  vehicleType?: string;
  searchText = '';

  centreOptions: { label: string; value: string }[] = [];
  vehicleTypeOptions: { label: string; value: string }[] = [];

  constructor(private distService: DestributionService,private distHubService: DistributionHubService) {}

  ngOnInit(): void {
    this.loadCenters();
    this.loadVehicleTypes();
    this.loadData();
  }

  loadCenters() {
    this.distHubService.getAllCentersForVehicles().subscribe({
      next: (res) => {
        if (res && res.items && res.items.length > 0) {
          const uniqueCenters = [...new Set(
            res.items
              .map((item: any) => item.centerName)
              .filter((name: string) => name !== null && name !== undefined && name !== '')
          )] as string[];
          
          this.centreOptions = uniqueCenters.map((name) => ({
            label: name,
            value: name
          }));
        }
      },
      error: (err) => {
        console.error('Error loading centers:', err);
        this.centreOptions = [];
      }
    });
  }

  loadVehicleTypes() {
    this.distHubService.getAllVehicleTypes().subscribe({
      next: (res) => {
        if (res && res.items && res.items.length > 0) {
          const uniqueTypes = [...new Set(
            res.items
              .map((item: any) => item.vType)
              .filter((type: string) => type !== null && type !== undefined && type !== '')
          )] as string[];
          
          this.vehicleTypeOptions = uniqueTypes.map((type) => ({
            label: type,
            value: type
          }));
        }
      },
      error: (err) => {
        console.error('Error loading vehicle types:', err);
        this.vehicleTypeOptions = [];
      }
    });
  }

  loadData(page: number = this.page) {
    this.isLoading = true;

    this.distService
      .getDistributedVehicles(
        page,
        this.itemsPerPage,
        this.centerName,
        this.vehicleType,
        this.searchText?.trim()
      )
      .subscribe({
        next: (res) => {
          this.items = res.items || [];
          this.totalItems = res.total || 0;
          this.isLoading = false;
        },
        error: () => {
          this.items = [];
          this.totalItems = 0;
          this.isLoading = false;
        },
      });
  }

  applyFilters() {
    this.page = 1;
    this.loadData(this.page);
  }

  search() {
    this.page = 1;
    this.loadData();
  }

  clearSearch() {
    this.searchText = '';
    this.applyFilters();
  }

  onPageChange(page: number) {
    this.page = page;
    this.loadData(this.page);
  }

  back() {
    window.history.back();
  }
}
