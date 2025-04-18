import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  EventEmitter,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  imports: [ChartModule, DropdownModule, FormsModule, CommonModule],
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css'],
})
export class DashbordAreaChartComponent implements OnChanges {
  @Output() districtSelected = new EventEmitter<string>();

  data: any;
  options: any;
  qrUsers: number = 0;
  allusers: number = 0;

  district = [
    { districtName: 'All' },
    { districtName: 'Colombo' },
    { districtName: 'Kalutara' },
    { districtName: 'Gampaha' },
    { districtName: 'Kandy' },
    { districtName: 'Matale' },
    { districtName: 'Nuwara Eliya' },
    { districtName: 'Galle' },
    { districtName: 'Matara' },
    { districtName: 'Hambantota' },
    { districtName: 'Jaffna' },
    { districtName: 'Mannar' },
    { districtName: 'Vavuniya' },
    { districtName: 'Kilinochchi' },
    { districtName: 'Mullaitivu' },
    { districtName: 'Batticaloa' },
    { districtName: 'Ampara' },
    { districtName: 'Trincomalee' },
    { districtName: 'Badulla' },
    { districtName: 'Moneragala' },
    { districtName: 'Kurunegala' },
    { districtName: 'Puttalam' },
    { districtName: 'Anuradhapura' },
    { districtName: 'Polonnaruwa' },
    { districtName: 'Rathnapura' },
    { districtName: 'Kegalle' },
  ];

  loading: boolean = true;

  constructor(private dashbordService: PlantcareDashbordService) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData(district?: string): void {
    const apiDistrict = district === 'All' ? undefined : district;
    this.loading = true; // Show skeleton
    this.dashbordService.getDashboardData(apiDistrict).subscribe(
      (data: any) => {
        console.log('These are the data', data);

        if (data && data.data) {
          if (district && district !== 'All') {
            // For specific districts, use farmerRegistrationCounts
            const registeredCount =
              data.data.farmerRegistrationCounts.registered_count;
            const unregisteredCount =
              data.data.farmerRegistrationCounts.unregistered_count;
            this.initializeChart(registeredCount, unregisteredCount, true);
            this.loading = false; 
          } else {
            // For "All" districts, use qrUsers and allusers
            this.qrUsers = data.data.qrUsers;
            this.allusers = data.data.allusers;
            this.initializeChart(
              this.qrUsers,
              this.allusers - this.qrUsers,
              false
            );
            this.loading = false; 
          }
        }
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
      }
    );
  }

  onDistrictChange(event: any): void {
    const selectedDistrict = event.value ? event.value.districtName : 'All';
    this.districtSelected.emit(
      selectedDistrict === 'All' ? null : selectedDistrict
    );
    this.fetchDashboardData(selectedDistrict);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['qrUsers'] && changes['qrUsers'].currentValue !== undefined) ||
      (changes['allusers'] && changes['allusers'].currentValue !== undefined)
    ) {
      this.initializeChart(this.qrUsers, this.allusers - this.qrUsers, false);
    }
  }

  initializeChart(
    registeredCount: number,
    unregisteredCount: number,
    isDistrictSelected: boolean
  ): void {
    const maxYValue = Math.ceil(
      Math.max(registeredCount, unregisteredCount) * 1.2
    );

    this.data = {
      labels: isDistrictSelected
        ? ['Registered', 'Unregistered']
        : ['QR Registered', 'Unregistered'],
      datasets: [
        {
          label: 'Count',
          data: [registeredCount, unregisteredCount],
          backgroundColor: [
            'rgba(144, 238, 144, 0.5)',
            'rgba(173, 216, 230, 0.5)',
          ],
          borderColor: ['rgba(34, 139, 34, 1)', 'rgba(70, 130, 180, 1)'],
          borderWidth: 1,
        },
      ],
    };

    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          max: maxYValue,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: function (context: { dataset: { label: any }; raw: any }) {
              return `${context.dataset.label}: ${context.raw}`;
            },
          },
        },
      },
      height: 500,
    };
  }
  
}
