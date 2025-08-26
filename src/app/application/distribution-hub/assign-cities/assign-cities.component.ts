import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { DistributionHubService } from '../../../services/distribution-hub/distribution-hub.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-assign-cities',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent],
  templateUrl: './assign-cities.component.html',
  styleUrl: './assign-cities.component.css'
})
export class AssignCitiesComponent implements OnInit {
  selectDistrict: string = '';
  selectProvince: string = '';
  provinces: string[] = [];
  filteredDistricts: any[] = [];
  citiesArr: Cities[] = [];
  centersArr: Centers[] = [];
  
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
    this.provinces = [...new Set(this.districts.map(district => district.province))];
    this.provinces.sort();
  }

  fetchData() {
    this.isLoading = true;
    this.hasData = false;
    
    this.distributionHubSrv.getAssignForCityes(this.selectProvince, this.selectDistrict).subscribe(
      (res) => {
        console.log(res);
        this.citiesArr = res.cities;
        this.centersArr = res.centers;
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

  onProvinceChange(): void {
    this.selectDistrict = '';
    if (this.selectProvince) {
      this.filteredDistricts = this.districts.filter(
        district => district.province === this.selectProvince
      );
      this.filteredDistricts.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      this.filteredDistricts = [];
    }
  }

  onDistrictChange(): void {
  }

  initializeAssignments(): void {
    this.assignments.clear();
    
    this.citiesArr.forEach(city => {
      this.assignments.set(city.id, -1);
    });
    
    this.centersArr.forEach(center => {
      if (center.ownCityId) {
        const cityId = parseInt(center.ownCityId, 10);
        if (!isNaN(cityId) && this.assignments.has(cityId)) {
          this.assignments.set(cityId, center.id);
        }
      }
    });
    
    console.log('Initialized assignments:', this.assignments);
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
    
    console.log('Updated assignments:', this.assignments);
  }

  saveAssignment(cityId: number, centerId: number): void {
    this.isLoading = true;
    
    const assignmentToSave = { cityId, centerId };
    
    console.log('Saving assignment:', assignmentToSave);
    
    this.distributionHubSrv.AssigCityToDistributedCenter(assignmentToSave).subscribe(
      (res) => {
        this.isLoading = false;
        Swal.fire('Success', 'City assigned to center successfully!', 'success');
      },
      (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to assign city to center', 'error');
        this.assignments.set(cityId, -1);
      }
    );
  }

  removeAssignment(cityId: number, centerId: number): void {
    this.isLoading = true;
    
    const assignmentToRemove = { cityId, centerId };
    
    console.log('Removing assignment:', assignmentToRemove);
    
    this.distributionHubSrv.removeAssigCityToDistributedCenter(assignmentToRemove).subscribe(
      (res) => {
        this.isLoading = false;
        Swal.fire('Success', 'City removed from center successfully!', 'success');
      },
      (error) => {
        this.isLoading = false;
        Swal.fire('Error', 'Failed to remove city from center', 'error');
        this.assignments.set(cityId, centerId);
      }
    );
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