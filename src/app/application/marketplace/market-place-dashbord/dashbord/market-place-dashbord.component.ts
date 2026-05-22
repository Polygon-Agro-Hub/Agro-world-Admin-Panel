import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DashbordFirstRowComponent } from '../dashbord-components/dashbord-first-row/dashbord-first-row.component';
import { DashbordAreaChartComponent } from '../dashbord-components/dashbord-area-chart/dashbord-area-chart.component';
import { DashbordPieChartComponent } from '../dashbord-components/dashbord-pie-chart/dashbord-pie-chart.component';
import { DashbordSecondRowComponent } from '../dashbord-components/dashbord-second-row/dashbord-second-row.component';
import { DashbordTableComponent } from '../dashbord-components/dashbord-table/dashbord-table.component';
import { MarketPlaceService } from '../../../../services/market-place/market-place.service';
import { Router } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-market-place-dashbord',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    DashbordFirstRowComponent,
    DashbordAreaChartComponent,
    DashbordPieChartComponent,
    DashbordSecondRowComponent,
    DashbordTableComponent,
  ],
  templateUrl: './market-place-dashbord.component.html',
  styleUrl: './market-place-dashbord.component.css',
})
export class MarketPlaceDashbordComponent implements OnInit {
  @ViewChild('reportSection', { static: false }) reportSection!: ElementRef;

  responceData!: Responce;
  isLoading: boolean = true;
  isDownloading: boolean = false;

  constructor(
    private marketSrv: MarketPlaceService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.marketSrv.getMarketPlaceDashbordDetails().subscribe((res) => {
      this.isLoading = false;
      console.log(res);
      this.responceData = res;
    });
  }

  async captureScreenshot(): Promise<void> {
    this.isDownloading = true;

    try {
      const element = this.reportSection.nativeElement;

      // Hide no-print elements before capture
      const noPrintElements = element.querySelectorAll('.no-print');
      noPrintElements.forEach((el: HTMLElement) => (el.style.display = 'none'));

      const canvas = await html2canvas(element, {
        scale: 1, // reduced from 2 → smaller file
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      // Restore hidden elements after capture
      noPrintElements.forEach((el: HTMLElement) => (el.style.display = ''));

      // Compress: use JPEG instead of PNG — much smaller
      const imgData = canvas.toDataURL('image/jpeg', 0.7); // 0.7 = 70% quality

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      let remainingHeight = canvasHeight;
      let sourceY = 0;
      let isFirstPage = true;

      while (remainingHeight > 0) {
        if (!isFirstPage) pdf.addPage();

        const sliceHeight = Math.min(
          (contentHeight / contentWidth) * canvasWidth,
          remainingHeight,
        );

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvasWidth;
        pageCanvas.height = sliceHeight;

        const pageCtx = pageCanvas.getContext('2d')!;
        pageCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          sliceHeight,
          0,
          0,
          canvasWidth,
          sliceHeight,
        );

        // JPEG at 70% quality for small size
        const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.7);
        const imgHeightMm = (sliceHeight * contentWidth) / canvasWidth;

        pdf.addImage(
          pageImgData,
          'JPEG',
          margin,
          margin,
          contentWidth,
          imgHeightMm,
        );

        sourceY += sliceHeight;
        remainingHeight -= sliceHeight;
        isFirstPage = false;
      }

      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text(
        `Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        margin,
        pageHeight - 4,
      );

      pdf.save(
        `market_place_report_${new Date().toISOString().slice(0, 10)}.pdf`,
      );
    } finally {
      this.isDownloading = false;
    }
  }
}

interface Responce {
  firstRow: FirstRow;
  secondRow: secondRow;
  areaData: {
    months: string[];
    salesCount: number[];
    total: any[];
  };
  pieData: {
    category: string[];
    count: number[];
  };
  orders: Order[];
}

interface FirstRow {
  todaySalses: SalesDayCount;
  yesterdaySalses: SalesDayCount;
  thisMonthSales: SalesDayCount;
  newUserCount: UserCount;
}

interface secondRow {
  salsesAnalize: AnalyzeReport;
  totalSales: SalesDayCount;
  totUsers: UserCount;
}

interface SalesDayCount {
  count: number;
  total: number;
  percentage: number;
  previousPeriodCount: number;
}

interface UserCount {
  userCount: number;
  percentage: number;
}

interface AnalyzeReport {
  amount: number;
  precentage: number;
}

interface Order {
  id: number;
  invNo: string;
  createdAt: string;
  paymentMethod: string;
  status: string;
  fullTotal: number;
  firstName: string;
  lastName: string;
  percentage: number;
}
