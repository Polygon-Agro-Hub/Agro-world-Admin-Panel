import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import Swal from 'sweetalert2';

// PrimeNG imports
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-assign-cities',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    LoadingSpinnerComponent,
    DropdownModule
  ],
  templateUrl: './assign-cities.component.html',
  styleUrl: './assign-cities.component.css'
})
export class AssignCitiesComponent implements OnInit {
  selectDistrict: any = null;
  selectProvince: any = null;
  provinces: any[] = [];
  filteredDistricts: any[] = [];
  citiesArr: Cities[] = [];
  centersArr: Centers[] = [];

  centersArrWithDups: Centers[] = [];
  
  // Store assignments (cityId -> centerId)
  assignments: Map<number, number> = new Map();
  
  districts = [
    { name: 'Ampara', province: 'Eastern' },
    { name: 'Anuradhapura', province: 'North Central' },
    { name: 'Badulla', province: 'Uva' },
    { name: 'Batticaloa', province: 'Eastern' },
    { name: 'Colombo', province: 'Western' },
    { name: 'Galle', province: 'Southern' },
    { name: 'Gampaha', province: 'Western' },
    { name: 'Hambantota', province: 'Southern' },
    { name: 'Jaffna', province: 'Northern' },
    { name: 'Kalutara', province: 'Western' },
    { name: 'Kandy', province: 'Central' },
    { name: 'Kegalle', province: 'Sabaragamuwa' },
    { name: 'Kilinochchi', province: 'Northern' },
    { name: 'Kurunegala', province: 'North Western' },
    { name: 'Mannar', province: 'Northern' },
    { name: 'Matale', province: 'Central' },
    { name: 'Matara', province: 'Southern' },
    { name: 'Monaragala', province: 'Uva' },
    { name: 'Mullaitivu', province: 'Northern' },
    { name: 'Nuwara Eliya', province: 'Central' },
    { name: 'Polonnaruwa', province: 'North Central' },
    { name: 'Puttalam', province: 'North Western' },
    { name: 'Rathnapura', province: 'Sabaragamuwa' },
    { name: 'Trincomalee', province: 'Eastern' },
    { name: 'Vavuniya', province: 'Northern' },
  ];

  isLoading: boolean = false;
  hasData: boolean = false;

  constructor(
    private router: Router,
    private distributionHubSrv: DistributionHubService,
    private location: Location,
  ) { }

  ngOnInit(): void {
    // Convert provinces to objects for PrimeNG dropdown
    const provinceNames = [...new Set(this.districts.map(district => district.province))];
    provinceNames.sort();
    
    this.provinces = provinceNames.map(province => ({ 
      name: province, 
      value: province 
    }));
  }

  fetchData() {
    this.isLoading = true;
    this.hasData = false;
    
    // Extract string values for the service call
    const provinceName = this.selectProvince?.value || '';
    const districtName = this.selectDistrict?.name || '';
    
    this.distributionHubSrv.getAssignForCityes(provinceName, districtName).subscribe(
      (res) => {
        this.citiesArr = res.cities;

        this.centersArrWithDups = (res.centers);
        
        // Filter out duplicate centers by id
        this.centersArr = this.removeDuplicateCenters(res.centers);
        
        this.isLoading = false;
        this.hasData = true;
        
        this.initializeAssignments();
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
        this.hasData = false;
      }
    );
  }

  removeDuplicateCenters(centers: Centers[]): Centers[] {
    const uniqueCenters = new Map<number, Centers>();
    
    centers.forEach(center => {
      if (!uniqueCenters.has(center.id)) {
        uniqueCenters.set(center.id, center);
      }
    });
    
    return Array.from(uniqueCenters.values());
  }

  onProvinceChange(): void {
    this.selectStatusChange();
    this.selectDistrict = null;
    if (this.selectProvince) {
      this.filteredDistricts = this.districts.filter(
        district => district.province === this.selectProvince.value
      );
      this.filteredDistricts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.filteredDistricts = [];
    }
  }

  onDistrictChange(): void {
    // You can add any district change logic here if needed
  }

  initializeAssignments(): void {
    this.assignments.clear();
    
    this.citiesArr.forEach(city => {
      this.assignments.set(city.id, -1);
    });
    
    this.centersArrWithDups.forEach(center => {
      if (center.ownCityId) {
        const cityId = parseInt(center.ownCityId, 10);
        if (!isNaN(cityId) && this.assignments.has(cityId)) {
          this.assignments.set(cityId, center.id);
        }
      }
    });
    
  }

  isCityAssignedToCenter(cityId: number, centerId: number): boolean {
    return this.assignments.get(cityId) === centerId;
  }

  isToggleDisabled(cityId: number, centerId: number): boolean {
    const assignedCenterId = this.assignments.get(cityId);
    return assignedCenterId !== -1 && assignedCenterId !== centerId;
  }

  toggleAssignment(cityId: number, centerId: number, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    const previousCenterId = this.assignments.get(cityId);
    
    if (isChecked) {
      this.assignments.set(cityId, centerId);
      this.saveAssignment(cityId, centerId);
    } else {
      this.assignments.set(cityId, -1);
      this.removeAssignment(cityId, previousCenterId as any);
    }
    
  }

  saveAssignment(cityId: number, centerId: number): void {
    this.isLoading = true;
    
    const assignmentToSave = { cityId, centerId };
    
    
    this.distributionHubSrv.AssigCityToDistributedCenter(assignmentToSave).subscribe(
      (res) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: 'City assigned to centre successfully!',
          icon: 'success',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to assign city to centre',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        this.assignments.set(cityId, -1);
      }
    );
  }

  removeAssignment(cityId: number, centerId: number): void {
    this.isLoading = true;
    
    const assignmentToRemove = { cityId, centerId };
    
    
    this.distributionHubSrv.removeAssigCityToDistributedCenter(assignmentToRemove).subscribe(
      (res) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success',
          text: 'City removed from centre successfully!',
          icon: 'success',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          title: 'Error',
          text: 'Failed to remove city from centre',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        this.assignments.set(cityId, centerId);
      }
    );
  }

  selectStatusChange(){
    this.hasData = false;
  }
}

interface Cities {
  id: number;
  city: string;
}

interface Centers {
  id: number;
  regCode: string;
  ownCityId: string;
}