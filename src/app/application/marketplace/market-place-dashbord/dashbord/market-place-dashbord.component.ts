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
    noPrintElements.forEach((el: Element) => ((el as HTMLElement).style.display = 'none'));

    // ── Directly target status badge elements and save original styles ──
    const statusCells = element.querySelectorAll('td:last-child');
    const originalStyles: { el: HTMLElement; styles: Partial<CSSStyleDeclaration> }[] = [];

    statusCells.forEach((td: Element) => {
      const tdEl = td as HTMLElement;
      // Center the td
      tdEl.style.textAlign = 'center';
      tdEl.style.verticalAlign = 'middle';

      // Target all descendants inside the badge
      const innerEls = tdEl.querySelectorAll('*');
      innerEls.forEach((inner: Element) => {
        const innerEl = inner as HTMLElement;
        originalStyles.push({
          el: innerEl,
          styles: {
            backgroundColor: innerEl.style.backgroundColor,
            background:       innerEl.style.background,
            border:           innerEl.style.border,
            boxShadow:        innerEl.style.boxShadow,
            borderRadius:     innerEl.style.borderRadius,
            color:            innerEl.style.color,
            padding:          innerEl.style.padding,
            marginLeft:       innerEl.style.marginLeft,
            marginRight:      innerEl.style.marginRight,
          },
        });
        innerEl.style.backgroundColor = 'transparent';
        innerEl.style.background       = 'none';
        innerEl.style.border           = 'none';
        innerEl.style.boxShadow        = 'none';
        innerEl.style.borderRadius     = '0';
        innerEl.style.color            = '#000000';
        innerEl.style.padding          = '0';
        innerEl.style.marginLeft       = 'auto';
        innerEl.style.marginRight      = 'auto';
      });
    });

    // Small delay for styles to apply
    await new Promise((r) => setTimeout(r, 80));

    const canvas = await html2canvas(element, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      scrollX: 0,
      scrollY: -window.scrollY,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    });

    // ── Restore all original styles ──
    originalStyles.forEach(({ el, styles }) => {
      el.style.backgroundColor = styles.backgroundColor || '';
      el.style.background       = styles.background       || '';
      el.style.border           = styles.border           || '';
      el.style.boxShadow        = styles.boxShadow        || '';
      el.style.borderRadius     = styles.borderRadius     || '';
      el.style.color            = styles.color            || '';
      el.style.padding          = styles.padding          || '';
      el.style.marginLeft       = styles.marginLeft       || '';
      el.style.marginRight      = styles.marginRight      || '';
    });

    // Restore no-print elements
    noPrintElements.forEach((el: HTMLElement) => (el.style.display = ''));

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth  = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin     = 8;
    const contentW   = pageWidth - 2 * margin;

    const canvasWidth  = canvas.width;
    const canvasHeight = canvas.height;

    const footerSpace = 8;
    const usablePageH = pageHeight - 2 * margin - footerSpace;
    const pxPerPageH  = (usablePageH / contentW) * canvasWidth;

    let sourceY     = 0;
    let isFirstPage = true;

    while (sourceY < canvasHeight) {
      if (!isFirstPage) pdf.addPage();

      const sliceH = Math.min(pxPerPageH, canvasHeight - sourceY);

      const pageCanvas    = document.createElement('canvas');
      pageCanvas.width    = canvasWidth;
      pageCanvas.height   = sliceH;
      const pageCtx       = pageCanvas.getContext('2d')!;

      pageCtx.fillStyle = '#ffffff';
      pageCtx.fillRect(0, 0, canvasWidth, sliceH);
      pageCtx.drawImage(
        canvas,
        0, sourceY, canvasWidth, sliceH,
        0, 0,       canvasWidth, sliceH,
      );

      const pageImgData = pageCanvas.toDataURL('image/jpeg', 0.7);
      const imgHeightMm = (sliceH / canvasWidth) * contentW;

      pdf.addImage(pageImgData, 'JPEG', margin, margin, contentW, imgHeightMm);

      pdf.setFontSize(7);
      pdf.setTextColor(160);
      pdf.text(
        `Report generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        margin,
        pageHeight - margin,
      );

      sourceY     += sliceH;
      isFirstPage  = false;
    }

    pdf.save(`market_place_report_${new Date().toISOString().slice(0, 10)}.pdf`);

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
