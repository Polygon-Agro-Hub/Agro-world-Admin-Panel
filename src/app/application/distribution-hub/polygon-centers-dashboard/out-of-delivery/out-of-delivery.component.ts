import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';
import { DestributionService } from '../../../../services/destribution-service/destribution-service.service';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-out-of-delivery',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    CalendarModule,
    DropdownModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './out-of-delivery.component.html',
  styleUrl: './out-of-delivery.component.css',
})
export class OutOfDeliveryComponent implements OnChanges {
  @Input() centerObj!: CenterDetails;
  orderArr: Orders[] = [];
  filteredOrders: Orders[] = [];
  orderCount: number = 0;
  selectDate: Date | null = null;
  selectStatus: string = '';
  searchText: string = '';
  isLoading = false;
  hasData: boolean = false;

  statusOptions = [
    { label: 'Late', value: 'Late' },
    { label: 'On Time', value: 'On Time' },
  ]

  constructor(
    private router: Router,
    private DestributionSrv: DestributionService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['centerObj'] && this.centerObj) {
      this.fetchData();
    }
  }

  onStatusChange() {
    this.fetchData();
  }

  onDateSelect() {
    this.fetchData();
  }

  onSearch() {
    this.searchText = this.searchText.trim();
    this.fetchData();
  }

  clearSearch() {
    this.searchText = '';
    this.fetchData();
  }

  clearDate() {
    this.selectDate = null;
    this.fetchData();
  }

  downloadPDF() {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Out for Delivery Report', 14, 20);
    
    // Add center information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Centre: ${this.centerObj.centerRegCode} ${this.centerObj.centerName}`, 14, 30);
    
    // Add filter information if applied
    let yPos = 38;
    if (this.selectStatus) {
      doc.setFontSize(10);
      doc.text(`Status Filter: ${this.selectStatus}`, 14, yPos);
      yPos += 6;
    }
    if (this.selectDate) {
      doc.setFontSize(10);
      doc.text(`Date Filter: ${this.selectDate.toISOString().split('T')[0]}`, 14, yPos);
      yPos += 6;
    }
    if (this.searchText) {
      doc.setFontSize(10);
      doc.text(`Search: ${this.searchText}`, 14, yPos);
      yPos += 6;
    }
    
    doc.setFontSize(11);
    doc.text(`Total Orders: ${this.orderCount}`, 14, yPos);
    yPos += 8;
    
    // Prepare table data
    const tableData = this.filteredOrders.map((item, index) => [
      (index + 1).toString(),
      item.invNo,
      `${item.firstNameEnglish} ${item.lastNameEnglish}`,
      'Today 8-12 AM',
      this.formatTime(item.outDlvrDate),
      item.outDlvrStatus
    ]);
    
    // Add table
    autoTable(doc, {
      head: [['No', 'Order ID', 'Completed By', 'Delivery Time Slot', 'Out Time', 'Status']],
      body: tableData,
      startY: yPos,
      theme: 'grid',
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        textColor: [0, 0, 0],
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center', cellWidth: 30 },
        2: { halign: 'left', cellWidth: 45 },
        3: { halign: 'center', cellWidth: 35 },
        4: { halign: 'center', cellWidth: 30 },
        5: { halign: 'center', cellWidth: 25 }
      },
      didParseCell: (data) => {
        // Make status column bold
        if (data.column.index === 5 && data.section === 'body') {
          data.cell.styles.fontStyle = 'bold';
        }
      },
      margin: { top: 10 },
    });
    
    // Add footer with generation date
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Generated on: ${new Date().toLocaleString()}`,
        14,
        doc.internal.pageSize.height - 10
      );
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 30,
        doc.internal.pageSize.height - 10
      );
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `Out_For_Delivery_${this.centerObj.centerRegCode}_${timestamp}.pdf`;
    
    // Save the PDF
    doc.save(fileName);
  }

  // Helper function to format time
  private formatTime(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  fetchData() {
    this.isLoading = true;
    
    const dateParam = this.selectDate ? this.selectDate.toISOString().split('T')[0] : '';
    
    this.DestributionSrv.getCenterOutForDlvryOrders(
      this.centerObj.centerId, 
      dateParam,
      this.selectStatus, 
      this.searchText
    ).subscribe(
      (res) => {
        this.orderArr = res.data || [];
        console.log('Fetched data:', this.orderArr);
        this.filteredOrders = [...this.orderArr];
        this.orderCount = this.filteredOrders.length;
        this.hasData = this.filteredOrders.length > 0;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching data:', error);
        this.isLoading = false;
        this.hasData = false;
      }
    );
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Remove spaces from the beginning and end
    this.searchText = input.value.trim();
    
    // Optional: Also prevent multiple consecutive spaces
    this.searchText = this.searchText.replace(/\s+/g, ' ');
  }
}

interface CenterDetails {
  centerId: number;
  centerName: string;
  centerRegCode: string;
}

class Orders {
  id!: number
  invNo!: string 
  firstNameEnglish!: string
  lastNameEnglish!: string 
  sheduleDate!: string 
  outDlvrDate!: string 
  outDlvrStatus!: string 
}