import {
  Component,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  EventEmitter,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { DropdownModule } from 'primeng/dropdown';
import { PlantcareDashbordService } from '../../../../../services/plant-care/plantcare-dashbord.service';
import { ThemeService } from '../../../../../services/theme.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  imports: [ChartModule, DropdownModule, FormsModule, CommonModule],
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css'],
})
export class DashbordAreaChartComponent implements OnChanges, OnInit, OnDestroy {
  @Output() districtSelected = new EventEmitter<string>();

  data: any;
  options: any;
  qrUsers: number = 0;
  allusers: number = 0;
  showClearButton: boolean = false;
  loading: boolean = true;
  private themeSubscription?: Subscription;

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

  selectedDistrict: any = { districtName: 'All' };

  constructor(
    private dashbordService: PlantcareDashbordService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    // Sort districts alphabetically, keeping "All" at the top
    const allDistrict = this.district.find(d => d.districtName === 'All');
    const otherDistricts = this.district
      .filter(d => d.districtName !== 'All')
      .sort((a, b) => a.districtName.localeCompare(b.districtName));
    this.district = [allDistrict!, ...otherDistricts];

    // Initialize chart with current theme
    this.updateChartTheme();
    
    // Subscribe to theme changes
    this.subscribeToThemeChanges();

    this.fetchDashboardData();
  }

  ngOnDestroy(): void {
    if (this.themeSubscription) {
      this.themeSubscription.unsubscribe();
    }
  }

  private subscribeToThemeChanges(): void {
    // Subscribe to theme changes using the ThemeService
    this.themeSubscription = this.themeService.themeChanged$.subscribe(() => {
      this.updateChartTheme();
    });
  }

  private updateChartTheme(): void {
    const isDark = this.themeService.isDarkTheme();
    
    if (this.options) {
      // Update chart colors based on theme
      const textColor = isDark ? '#ffffff' : '#333333';
      const gridColor = isDark ? '#374151' : '#e5e7eb';
      const tooltipBgColor = isDark ? '#1f2937' : '#ffffff';
      const tooltipTextColor = isDark ? '#ffffff' : '#333333';

      this.options.scales.x.ticks.color = textColor;
      this.options.scales.y.ticks.color = textColor;
      this.options.scales.x.grid.color = gridColor;
      this.options.scales.y.grid.color = gridColor;
      
      // Update tooltip colors
      this.options.plugins.tooltip.backgroundColor = tooltipBgColor;
      this.options.plugins.tooltip.titleColor = tooltipTextColor;
      this.options.plugins.tooltip.bodyColor = tooltipTextColor;
      this.options.plugins.tooltip.borderColor = gridColor;
      this.options.plugins.tooltip.borderWidth = 1;

      // Force chart to re-render
      this.options = { ...this.options };
    }
  }

  fetchDashboardData(district?: string): void {
    const apiDistrict = district === 'All' ? undefined : district;
    this.loading = true;
    this.dashbordService.getDashboardData(apiDistrict).subscribe(
      (data: any) => {
        if (data && data.data) {
          if (district && district !== 'All') {
            const registeredCount =
              data.data.farmerRegistrationCounts.registered_count;
            const unregisteredCount =
              data.data.farmerRegistrationCounts.unregistered_count;
            this.initializeChart(registeredCount, unregisteredCount, true);
          } else {
            this.qrUsers = data.data.qrUsers;
            this.allusers = data.data.allusers;
            this.initializeChart(
              this.qrUsers,
              this.allusers - this.qrUsers,
              false
            );
          }
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error fetching dashboard data:', error);
        this.loading = false;
      }
    );
  }

  onDistrictChange(event: any): void {
    if (!event.value) {
      this.selectedDistrict = { districtName: 'All' };
      this.showClearButton = false;
    } else {
      this.selectedDistrict = event.value;
      this.showClearButton = event.value.districtName !== 'All';
    }

    const selectedDistrict = this.selectedDistrict.districtName;
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

    // Get current theme colors
    const isDark = this.themeService.isDarkTheme();
    const textColor = isDark ? '#ffffff' : '#333333';
    const gridColor = isDark ? '#374151' : '#e5e7eb';
    const tooltipBgColor = isDark ? '#1f2937' : '#ffffff';
    const tooltipTextColor = isDark ? '#ffffff' : '#333333';

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
        x: {
          ticks: {
            color: textColor,
          },
          grid: {
            color: gridColor,
          },
        },
        y: {
          beginAtZero: true,
          max: maxYValue,
          ticks: {
            color: textColor,
          },
          grid: {
            color: gridColor,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          backgroundColor: tooltipBgColor,
          titleColor: tooltipTextColor,
          bodyColor: tooltipTextColor,
          borderColor: gridColor,
          borderWidth: 1,
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