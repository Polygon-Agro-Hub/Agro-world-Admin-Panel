import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../services/collection-officer/collection-officer-report.service';
import { CommonModule } from '@angular/common';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import jsPDF from 'jspdf';

interface IdistrictReport {
  cropName: string,
  quality: string,
  district: string,
  totPrice: string,
  totWeight: string
}

@Component({
  selector: 'app-collectionofficer-district-report',
  standalone: true,
  imports: [DropdownModule, NgxPaginationModule, FormsModule, CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './collectionofficer-district-report.component.html',
  styleUrls: ['./collectionofficer-district-report.component.css']
})
export class CollectionofficerDistrictReportComponent implements OnInit {
  districts: any[] = [];
  selectedDistrict: any = { name: 'Colombo', code: 'COL' };
  reportDetails: IdistrictReport[] = [];
  chartOptions: any;

  constructor(private collectionOfficerSrv: CollectionOfficerReportService) { }

  ngOnInit(): void {
    this.districts = [
      { name: 'Ampara', code: 'AMP' },
      { name: 'Anuradhapura', code: 'ANU' },
      { name: 'Badulla', code: 'BAD' },
      { name: 'Batticaloa', code: 'BAT' },
      { name: 'Colombo', code: 'COL' },
      { name: 'Galle', code: 'GAL' },
      { name: 'Gampaha', code: 'GAM' },
      { name: 'Hambantota', code: 'HAM' },
      { name: 'Jaffna', code: 'JAF' },
      { name: 'Kalutara', code: 'KAL' },
      { name: 'Kandy', code: 'KAN' },
      { name: 'Kegalle', code: 'KEG' },
      { name: 'Kilinochchi', code: 'KIL' },
      { name: 'Kurunegala', code: 'KUR' },
      { name: 'Mannar', code: 'MAN' },
      { name: 'Matale', code: 'MAT' },
      { name: 'Matara', code: 'MTR' },
      { name: 'Moneragala', code: 'MON' },
      { name: 'Mullaitivu', code: 'MUL' },
      { name: 'Nuwara Eliya', code: 'NUE' },
      { name: 'Polonnaruwa', code: 'POL' },
      { name: 'Puttalam', code: 'PUT' },
      { name: 'Ratnapura', code: 'RAT' },
      { name: 'Trincomalee', code: 'TRI' },
      { name: 'Vavuniya', code: 'VAV' }
    ];

    this.fetchAllDistrictReportDetails(this.selectedDistrict.name);
  }

  fetchAllDistrictReportDetails(district: string) {
    console.log("Fetching report for district:", district);
    this.collectionOfficerSrv.getDistrictReport(district).subscribe((response) => {
      console.log(response);
      this.reportDetails = response;
      this.updateChart();
    },
      (error) => {
        console.log('Error: ', error);
      });
  }

  applyFilters() {
    if (this.selectedDistrict) {
      console.log('Filtering by district:', this.selectedDistrict.name);
      this.fetchAllDistrictReportDetails(this.selectedDistrict.name);
    } else {
      console.log('No district selected');
    }
  }

  groupByCrop(reportDetails: IdistrictReport[]) {
    const groupedReports: any[] = [];

    reportDetails.forEach((report) => {
      const existingCrop = groupedReports.find((r) => r.cropName === report.cropName);

      if (existingCrop) {
        existingCrop[`grade${report.quality}`] = report;
        existingCrop.totalWeight += parseFloat(report.totWeight);
      } else {
        groupedReports.push({
          cropName: report.cropName,
          [`grade${report.quality}`]: report,
          totalWeight: parseFloat(report.totWeight)
        });
      }
    });

    return groupedReports;
  }

  updateChart() {
    const groupedData = this.groupByCrop(this.reportDetails);

    const gradeAData = groupedData
      .filter(crop => crop.gradeA)
      .map((crop) => ({
        label: crop.cropName,
        y: parseFloat(crop.gradeA.totWeight),
        color: "#FF9263"
      }));

    const gradeBData = groupedData
      .filter(crop => crop.gradeB)
      .map((crop) => ({
        label: crop.cropName,
        y: parseFloat(crop.gradeB.totWeight),
        color: "#5F75E9"
      }));

    const gradeCData = groupedData
      .filter(crop => crop.gradeC)
      .map((crop) => ({
        label: crop.cropName,
        y: parseFloat(crop.gradeC.totWeight),
        color: "#3DE188"
      }));

    this.chartOptions = {
      animationEnabled: true,
      axisX: {
        title: 'Crops',
        reversed: true
      },
      axisY: {
        title: 'Total Weight (Kg)',
        includeZero: true
      },
      data: [
        {
          type: 'stackedBar',
          name: "Grade A",
          showInLegend: true,
          dataPoints: gradeAData
        },
        {
          type: 'stackedBar',
          name: "Grade B",
          showInLegend: true,
          dataPoints: gradeBData
        },
        {
          type: 'stackedBar',
          name: "Grade C",
          showInLegend: true,
          dataPoints: gradeCData
        }
      ]
    };
  }

  exportToPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const startX = 30;
    const startY = 30;
    const barHeight = 10;
    const gap = 20;
    const chartWidth = 140;
  
    doc.setFontSize(14);
    doc.text(`${this.selectedDistrict.name} - Stacked Bar Chart`, 105, 15, { align: 'center' });
  
    const groupedData = this.groupByCrop(this.reportDetails);
    const colors = {
      gradeA: "#FF9263",
      gradeB: "#5F75E9",
      gradeC: "#3DE188"
    };
    const maxWeight = Math.max(...groupedData.map(crop => crop.totalWeight));
    let currentY = startY;
  
    groupedData.forEach((crop) => {
      let currentX = startX;
      const labelYOffset = currentY + barHeight / 2 + 3;
  
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(crop.cropName, startX - 20, labelYOffset);
  
      (['A', 'B', 'C'] as const).forEach((grade) => {
        const gradeKey = `grade${grade}` as 'gradeA' | 'gradeB' | 'gradeC';
        const gradeData = crop[gradeKey];
  
        if (gradeData) {
          const barWidth = (parseFloat(gradeData.totWeight) / maxWeight) * chartWidth;
          doc.setFillColor(colors[gradeKey]);
          doc.rect(currentX, currentY, barWidth, barHeight, 'F');
  
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(
            `${gradeData.totWeight} kg`,
            currentX + barWidth / 2,
            currentY + barHeight / 2 + 3,
            { align: 'center' }
          );
          currentX += barWidth;
        }
      });
  
      currentY += gap;
    });
  
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("Total Weight (Kg)", startX + chartWidth / 2, currentY + 10, { align: 'center' });
  
    doc.save(`${this.selectedDistrict.name}_Report_StackedBarChart.pdf`);
  }
  




}
