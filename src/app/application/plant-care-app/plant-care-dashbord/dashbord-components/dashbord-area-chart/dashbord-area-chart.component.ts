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

@Component({
  selector: 'app-dashbord-area-chart',
  standalone: true,
  imports: [ChartModule, DropdownModule],
  templateUrl: './dashbord-area-chart.component.html',
  styleUrls: ['./dashbord-area-chart.component.css'],
})
export class DashbordAreaChartComponent implements OnChanges {
  @Input() qrUsers: number = 0;
  @Input() allusers: number = 0;
  @Output() districtSelected = new EventEmitter<string>();

  data: any;
  options: any;

  district = [
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

  onDistrictChange(event: any): void {
    const selectedDistrict = event.value ? event.value.districtName : null;
    this.districtSelected.emit(selectedDistrict);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['qrUsers'] && changes['qrUsers'].currentValue !== undefined) ||
      (changes['allusers'] && changes['allusers'].currentValue !== undefined)
    ) {
      this.initializeChart(this.qrUsers, this.allusers);
    }
  }

  initializeChart(qrUsers: number, allusers: number): void {
    const unregisteredUsers = allusers;
    const maxYValue = Math.ceil(Math.max(qrUsers, unregisteredUsers) * 1.2);

    this.data = {
      labels: ['QR Registered', 'Unregistered'],
      datasets: [
        {
          label: 'Count',
          data: [qrUsers, unregisteredUsers],
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
        },
      },
    };
  }
}
