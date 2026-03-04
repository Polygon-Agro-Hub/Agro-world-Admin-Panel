import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, Input, OnInit } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { ThemeService } from '../../../services/theme.service';
import { ViewChild, ElementRef } from '@angular/core';

interface IProvinceReport {
  cropName: string;
  district: string;
  qtyA: number;
  qtyB: number;
  qtyC: number;
  priceA: number;
  priceB: number;
  priceC: number;
}

@Component({
  selector: 'app-collection-officer-province-report',
  standalone: true,
  imports: [
    DropdownModule,
    NgxPaginationModule,
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './collection-officer-province-report.component.html',
  styleUrl: './collection-officer-province-report.component.css',
})
export class CollectionOfficerProvinceReportComponent implements OnInit {
  
  province: any[] = [];
  selectedProvince: any = { name: 'Western', code: 'WEST' };
  reportDetails: IProvinceReport[] = [];
  chartOptions: any;
  loadingChart = true;
  loadingTable = true;
  isDownloading = false;

  provinceChart!: Chart;

  ngAfterViewInit() {
    this.updateChart();
  }

  constructor(
    private collectionOfficerSrv: CollectionOfficerReportService,
    private router: Router,
    private themeService: ThemeService
  ) {}

  back(): void {
    this.router.navigate(['reports']);
  }

  ngOnInit(): void {
    this.province = [
      { name: 'Western', code: 'WEST' },
      { name: 'Central', code: 'CENT' },
      { name: 'Southern', code: 'SOUTH' },
      { name: 'Northern', code: 'NORTH' },
      { name: 'Eastern', code: 'EAST' },
      { name: 'North Western', code: 'NW' },
      { name: 'North Central', code: 'NC' },
      { name: 'Uva', code: 'UVA' },
      { name: 'Sabaragamuwa', code: 'SAB' },
    ];

    this.fetchAllProvinceReportDetails(this.selectedProvince.name);
  }


  fetchAllProvinceReportDetails(district: string) {
    this.loadingChart = true;
    this.loadingTable = true;

    this.collectionOfficerSrv.getProvinceReport(district).subscribe(
      (response) => {
        this.reportDetails = response.map((item) => ({
          ...item,
          qtyA: Number(item.qtyA) || 0,
          qtyB: Number(item.qtyB) || 0,
          qtyC: Number(item.qtyC) || 0,
        }));
        this.loadingTable = false;
        this.updateChart();
      },
      (error) => {}
    );
  }

  applyFilters() {
    if (this.selectedProvince) {
      this.fetchAllProvinceReportDetails(this.selectedProvince.name);
    }
  }

  updateChart() {
    if (this.provinceChart) {
      this.provinceChart.destroy(); // destroy old chart before re-render
    }
  
    const labels = this.reportDetails.map(crop => crop.cropName);
  
    const gradeAData = this.reportDetails.map(crop => crop.qtyA || 0);
    const gradeBData = this.reportDetails.map(crop => crop.qtyB || 0);
    const gradeCData = this.reportDetails.map(crop => crop.qtyC || 0);
  
    this.provinceChart = new Chart('provinceBarChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Grade A',
            data: gradeAData,
            backgroundColor: '#FF9263',
          },
          {
            label: 'Grade B',
            data: gradeBData,
            backgroundColor: '#5F75E9',
          },
          {
            label: 'Grade C',
            data: gradeCData,
            backgroundColor: '#3DE188',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y', 
        plugins: {
          title: {
            display: true,
            text: `${this.selectedProvince.name} - Crop Weights`,
            padding: {
              top: 10,
              bottom: 30  
            },
            font: {
              size: 18,
              weight: 600
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 30,   
              color: '#000000',
              font: {
                size: 14,
                weight: 400
              }
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Total Weight (Kg)',
              color: '#000000',
              font: {
                size: 12,
              },
              padding: 20   
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Crops',
              color: '#000000',
              font: {
                size: 12,
                weight: 600
              },
              padding: 20 
            }
          }
        }
      }
    });
  
    this.loadingChart = false;
    console.log('loadingChart', this.loadingChart)
  }
  
}
