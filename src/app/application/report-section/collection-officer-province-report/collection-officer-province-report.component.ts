import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import jsPDF from 'jspdf';

interface IProvinceReport {
  cropName: string,
  quality: string,
  province: string,
  totPrice: string,
  totWeight: string
}

@Component({
  selector: 'app-collection-officer-province-report',
  standalone: true,
  imports: [DropdownModule, NgxPaginationModule, FormsModule, CommonModule, CanvasJSAngularChartsModule],
  templateUrl: './collection-officer-province-report.component.html',
  styleUrl: './collection-officer-province-report.component.css'
})
export class CollectionOfficerProvinceReportComponent implements OnInit {
  province: any[] = []
  selectedProvince: any = { name: 'Western', code: 'WEST' }
  reportDetails: IProvinceReport[] = [];
  chartOptions: any;

  constructor(private collectionOfficerSrv: CollectionOfficerReportService) { }


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
      { name: 'Sabaragamuwa', code: 'SAB' }
    ];

    this.fetchAllProvinceReportDetails(this.selectedProvince.name)

  }

  fetchAllProvinceReportDetails(province: string) {
    this.collectionOfficerSrv.getProvinceReport(province).subscribe((response) => {
      console.log(response);
      this.reportDetails = response
      this.updateChart();
    },
      (error) => {
        console.log('Error: ', error);
      });
  }


  applyFilters() {
    if (this.selectedProvince) {
      console.log('Filtering by district:', this.selectedProvince.name);
      this.fetchAllProvinceReportDetails(this.selectedProvince.name);
    } else {
      console.log('No district selected');
    }
  }

  groupByCrop(reportDetails: IProvinceReport[]) {
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
  
    // Title
    doc.setFontSize(14);
    doc.text(`${this.selectedProvince.name} - Province Report`, 105, 15, { align: 'center' });
  
    // Chart
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
    doc.text("Total Weight (Kg)", startX + chartWidth / 2, currentY + 5, { align: 'center' });
  
    const tableStartY = currentY + 20; 
    const cellPadding = 5;
    const cellHeight = 8;
    const tableColWidths = [50, 30, 30, 30, 30];
    let rowY = tableStartY;
  

    const headers = ['Crop', 'Grade A', 'Grade B', 'Grade C', 'Total'];
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    headers.forEach((header, index) => {
      const cellX = startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.rect(cellX, rowY, tableColWidths[index], cellHeight); 
      doc.text(header, cellX + cellPadding, rowY + cellHeight / 2 + 3);
    });
  
    rowY += cellHeight;
  
    groupedData.forEach((crop) => {
      const cropValues = [
        crop.cropName,
        crop.gradeA ? `${crop.gradeA.totWeight} kg` : '-',
        crop.gradeB ? `${crop.gradeB.totWeight} kg` : '-',
        crop.gradeC ? `${crop.gradeC.totWeight} kg` : '-',
        `${crop.totalWeight} kg`
      ];
  
      cropValues.forEach((value, index) => {
        const cellX = startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
        doc.rect(cellX, rowY, tableColWidths[index], cellHeight); 
        doc.text(value, cellX + cellPadding, rowY + cellHeight / 2 + 3);
      });
  
      rowY += cellHeight;
    });
  
    // Save PDF
    doc.save(`${this.selectedProvince.name}_Province_Report.pdf`);
  }
  


}
