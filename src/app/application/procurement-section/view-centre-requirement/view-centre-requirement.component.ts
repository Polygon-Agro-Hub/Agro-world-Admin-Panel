import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { ProcumentsService } from '../../../services/procuments/procuments.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DistributionOrder {
  cropNameEnglish: string;
  varietyNameEnglish: string;
  quantity: number;
  sheduleDate: string;
  regCode: string;
  centerName: string;
}

interface Center {
  id: number;
  centerName: string; 
}

@Component({
  selector: 'app-view-centre-requirement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    CalendarModule,
    DropdownModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './view-centre-requirement.component.html',
  styleUrl: './view-centre-requirement.component.css'
})
export class ViewCentreRequirementComponent implements OnInit {
  isLoading: boolean = false;
  isDownloading: boolean = false;
  
  distributionOrders: DistributionOrder[] = [];
  centers: Center[] = [];
  
  page: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;
  
  // Filter states
  selectedCenter: Center | null = null;
  selectedDeliveryDate: Date | null = null;
  deliveryDateFilter: string = '';
  
  // Search
  search: string = '';

  constructor(
    private procumentsService: ProcumentsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Set default delivery date to current date + 2 days
    this.setDefaultDeliveryDate();
    this.loadCenters();
    this.loadDistributionOrders();
  }

  setDefaultDeliveryDate(): void {
    const today = new Date();
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() + 2);
    
    this.selectedDeliveryDate = defaultDate;
    this.deliveryDateFilter = this.formatDate(defaultDate);
  }

  loadCenters(): void {
    this.procumentsService.getAllCenters().subscribe({
      next: (response) => {
        if (response.success) {
          this.centers = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading centers:', error);
      }
    });
  }

  loadDistributionOrders(): void {
    this.isLoading = true;
    
    const centerId = this.selectedCenter ? this.selectedCenter.id.toString() : '';
    
    this.procumentsService
      .getDistributionOrders(
        this.page,
        this.itemsPerPage,
        centerId,
        this.deliveryDateFilter,
        this.search
      )
      .subscribe({
        next: (response) => {
          this.distributionOrders = response.items || [];
          this.totalItems = response.total || 0;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading distribution orders:', error);
          this.isLoading = false;
        }
      });
  }

  // Delivery Date Change Handler
  onDeliveryDateChange(): void {
    if (this.selectedDeliveryDate) {
      this.deliveryDateFilter = this.formatDate(this.selectedDeliveryDate);
    } else {
      this.deliveryDateFilter = '';
    }
    this.page = 1;
    this.loadDistributionOrders();
  }

  // Center Filter
  applyCenterFilter(): void {
    this.page = 1;
    this.loadDistributionOrders();
  }

  // Search
  applySearch(): void {
    this.page = 1;
    this.loadDistributionOrders();
  }

  clearSearch(): void {
    this.search = '';
    this.page = 1;
    this.loadDistributionOrders();
  }

  // Pagination
  onPageChange(newPage: number): void {
    this.page = newPage;
    this.loadDistributionOrders();
  }

  // Download PDF
  downloadTemplate1(): void {
    if (this.distributionOrders.length === 0) {
      alert('No data available to download');
      return;
    }

    this.isDownloading = true;

    try {
      // Create new PDF document
      const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
      
      // Add title
      doc.setFontSize(18);
      doc.text('Distribution Orders Report', 14, 15);
      
      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
      
      // Add filters info if applied
      let yPos = 28;
      if (this.deliveryDateFilter) {
        doc.text(`Delivery Date: ${this.formatDateForDisplay(this.deliveryDateFilter)}`, 14, yPos);
        yPos += 5;
      }
      if (this.selectedCenter) {
        doc.text(`Center: ${this.selectedCenter.centerName}`, 14, yPos);
        yPos += 5;
      }
      if (this.search) {
        doc.text(`Search: ${this.search}`, 14, yPos);
        yPos += 5;
      }

      // Prepare table data
      const tableData = this.distributionOrders.map((item, index) => [
        index + 1,
        item.cropNameEnglish,
        item.varietyNameEnglish,
        item.quantity,
        this.formatDateForExcel(item.sheduleDate),
        item.regCode,
        item.centerName
      ]);

      // Add table
      autoTable(doc, {
        head: [['No', 'Crop', 'Variety', 'Quantity (kg)', 'Scheduled Date', 'Centre Code', 'Centre Name']],
        body: tableData,
        startY: yPos + 5,
        theme: 'grid',
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 35 },
          5: { halign: 'center', cellWidth: 30 },
          6: { cellWidth: 'auto' }
        },
        styles: {
          fontSize: 9,
          cellPadding: 3
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Add footer with page numbers
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      const fileName = `Distribution_Orders_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      this.isDownloading = false;
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
      this.isDownloading = false;
    }
  }

  // Helper methods
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateForExcel(dateString: string): string {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
  }

  formatDateForDisplay(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  back(): void {
    this.router.navigate(['/previous-route']); // Update with your actual route
  }
}