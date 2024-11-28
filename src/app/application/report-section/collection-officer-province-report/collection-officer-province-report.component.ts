import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CanvasJSAngularChartsModule } from '@canvasjs/angular-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { DropdownModule } from 'primeng/dropdown';
import { CollectionOfficerReportService } from '../../../services/collection-officer/collection-officer-report.service';
import jsPDF from 'jspdf';

interface IProvinceReport {
  cropName: string
  district: string
  qtyA: number
  qtyB: number
  qtyC: number
  priceA: number
  priceB: number
  priceC: number
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

  fetchAllProvinceReportDetails(district: string) {
    console.log(district);
    
    this.collectionOfficerSrv.getProvinceReport(district).subscribe(
      (response) => {
        this.reportDetails = response.map((item) => ({
          ...item,
          qtyA: Number(item.qtyA) || 0,
          qtyB: Number(item.qtyB) || 0,
          qtyC: Number(item.qtyC) || 0,
        }));
        this.updateChart()
      },
      (error) => {
        console.log('Error: ', error);
      }
    );
  }


  applyFilters() {
    if (this.selectedProvince) {
      console.log('Filtering by district:', this.selectedProvince.name);
      this.fetchAllProvinceReportDetails(this.selectedProvince.name);
    } else {
      console.log('No district selected');
    }
  }

  updateChart() {
    const gradeAData = this.reportDetails.map((crop) => ({
      label: crop.cropName,
      y: crop.qtyA || 0,
      color: "#FF9263"
    }));

    const gradeBData = this.reportDetails.map((crop) => ({
      label: crop.cropName,
      y: crop.qtyB || 0,
      color: "#5F75E9"
    }));

    const gradeCData = this.reportDetails.map((crop) => ({
      label: crop.cropName,
      y: crop.qtyC || 0,
      color: "#3DE188"
    }));

    this.chartOptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
        text: `${this.selectedProvince.name} - Crop Weights`
      },
      axisX: {
        title: "Crops",
        reversed: true
      },
      axisY: {
        title: "Total Weight (Kg)",
        includeZero: true
      },
      data: [
        {
          type: "stackedBar",
          name: "Grade A",
          showInLegend: true,
          dataPoints: gradeAData
        },
        {
          type: "stackedBar",
          name: "Grade B",
          showInLegend: true,
          dataPoints: gradeBData
        },
        {
          type: "stackedBar",
          name: "Grade C",
          showInLegend: true,
          dataPoints: gradeCData
        }
      ]
    };
  }

  exportToPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const startX = 30;
    const startY = 30;
    const barHeight = 10;
    const gap = 15;
    const chartWidth = 140;
    const titleFontSize = 14;
    const contentFontSize = 10;
    const colors = {
      gradeA: "#FF9263",
      gradeB: "#5F75E9",
      gradeC: "#3DE188"
    };

    // Title
    doc.setFontSize(titleFontSize);
    doc.text(`${this.selectedProvince.name} - Crop Grade Report`, pageWidth / 2, 20, { align: 'center' });

    // Ensure reportDetails is populated
    if (!this.reportDetails || this.reportDetails.length === 0) {
      doc.setFontSize(contentFontSize);
      doc.text("No data available to display.", startX, startY);
      doc.save(`${this.selectedProvince.name}_Report.pdf`);
      return;
    }

    // Calculate total weights and group data for visualization
    const groupedData = this.reportDetails.map((crop) => ({
      cropName: crop.cropName,
      gradeA: crop.qtyA || 0,
      gradeB: crop.qtyB || 0,
      gradeC: crop.qtyC || 0,
      totalWeight: (crop.qtyA || 0) + (crop.qtyB || 0) + (crop.qtyC || 0)
    }));

    const maxWeight = Math.max(...groupedData.map(crop => crop.totalWeight));

    // Draw chart bars for each crop
    let currentY = startY;
    groupedData.forEach((crop) => {
      let currentX = startX;
      const labelYOffset = currentY + barHeight / 2 + 3;

      // Crop Name Label
      doc.setFontSize(contentFontSize);
      doc.setTextColor(0, 0, 0);
      doc.text(crop.cropName, startX - 20, labelYOffset);

      // Draw bars for each grade
      (['A', 'B', 'C'] as const).forEach((grade, idx) => {
        const gradeKey = `grade${grade}` as 'gradeA' | 'gradeB' | 'gradeC';
        const gradeWeight = crop[gradeKey];
        if (gradeWeight > 0) {
          const barWidth = (gradeWeight / maxWeight) * chartWidth;
          doc.setFillColor(colors[gradeKey]);
          doc.rect(currentX, currentY, barWidth, barHeight, 'F');

          // Display weight inside the bar
          doc.setTextColor(255, 255, 255);
          doc.setFontSize(8);
          doc.text(
            `${gradeWeight} kg`,
            currentX + barWidth / 2,
            currentY + barHeight / 2 + 3,
            { align: 'center' }
          );
          currentX += barWidth;
        }
      });

      currentY += gap;
    });

    // Draw table header
    const tableStartY = currentY + 20;
    const cellPadding = 5;
    const cellHeight = 8;
    const tableColWidths = [50, 30, 30, 30, 30];
    let rowY = tableStartY;

    const headers = ['Crop', 'Grade A', 'Grade B', 'Grade C', 'Total'];
    doc.setFontSize(contentFontSize);
    doc.setTextColor(0, 0, 0);
    headers.forEach((header, index) => {
      const cellX = startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
      doc.rect(cellX, rowY, tableColWidths[index], cellHeight); // Draw header cell
      doc.text(header, cellX + cellPadding, rowY + cellHeight / 2 + 3);
    });

    rowY += cellHeight;

    // Draw table rows
    groupedData.forEach((crop) => {
      const cropValues = [
        crop.cropName,
        crop.gradeA ? `${crop.gradeA} kg` : '-',
        crop.gradeB ? `${crop.gradeB} kg` : '-',
        crop.gradeC ? `${crop.gradeC} kg` : '-',
        `${crop.totalWeight} kg`
      ];

      cropValues.forEach((value, index) => {
        const cellX = startX + tableColWidths.slice(0, index).reduce((a, b) => a + b, 0);
        doc.rect(cellX, rowY, tableColWidths[index], cellHeight); // Draw data cell
        doc.text(value, cellX + cellPadding, rowY + cellHeight / 2 + 3);
      });

      rowY += cellHeight;
    });

    // Save the PDF
    doc.save(`${this.selectedProvince.name}_CropGradeReport.pdf`);
  }



}
