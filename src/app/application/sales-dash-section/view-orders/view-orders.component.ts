import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';

import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { NgxPaginationModule } from 'ngx-pagination';
import Swal from 'sweetalert2';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

import { FormsModule } from '@angular/forms';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';
import { InvoiceService } from '../../../services/invoice/invoice.service';
import { finalize } from 'rxjs';
import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  deliveryMethod: string;
  invoiceDate: string;
  scheduledDate: string;
  paymentMethod: string;
  grandTotal: string;
  familyPackItems: any[];
  additionalItems: any[];
  buildingType: string;
  billingInfo: {
    title: string;
    fullName: string;
    houseNo: string;
    street: string;
    city: string;
    phone: string;
    buildingNo?: string;
    buildingName?: string;
    unitNo?: string;
    floorNo?: string;
  };
  pickupInfo?: {
    centerName: string;
    address: {
      city: string;
      district: string;
      province: string;
      country: string;
    };
  };
  familyPackTotal: string;
  additionalItemsTotal: string;
  deliveryFee: string;
  discount: string;
}

@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [
    HttpClientModule,
    CommonModule,
    LoadingSpinnerComponent,
    NgxPaginationModule,
    FormsModule,
    DropdownModule,
    CalendarModule,
  ],
  templateUrl: './view-orders.component.html',
  styleUrl: './view-orders.component.css',
  providers: [DatePipe],
})
export class ViewOrdersComponent implements OnInit {
  ordersArr: Orders[] = [];

  date: string = '';
  isLoading = false;
  isPopupVisible = false;

  page: number = 1;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  hasData: boolean = true;
  searchText: string = '';
  errorMessage: string | null = null;

  deliveryTypeArr = [
    { deliveryType: 'Once a week', value: 'Once a week' },
    { deliveryType: 'Twice a week', value: 'Twice a week' },
    { deliveryType: 'One Time', value: 'One Time' },
  ];

  paymentStatusArr = [
    { paymentStatus: 'Paid', value: '1' },
    { paymentStatus: 'Pending', value: '0' },
  ];

  orderStatusArr = [
    { orderStatus: 'Assigned', value: 'Ordered' },
    { orderStatus: 'Processing', value: 'Processing' },
    { orderStatus: 'On the way', value: 'On the way' },
    { orderStatus: 'Delivered', value: 'Delivered' },
    { orderStatus: 'Cancelled', value: 'Cancelled' },
  ];

  paymentMethodArr = [
    { paymentMethod: 'Online Payment', value: 'Online Payment' },
    { paymentMethod: 'Pay By Cash', value: 'Pay By Cash' },
  ];

  orderStatusFilter: string = '';
  paymentMethodFilter: string = '';
  paymentStatusFilter: string = '';
  deliveryTypeFilter: string = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router,
    private datePipe: DatePipe,
    private getInvoiceDetails: InvoiceService,
    private salesDashService: SalesDashService
  ) {}

  ngOnInit() {
    this.fetchAllOrders();
  }

  fetchAllOrders(
    page: number = 1,
    limit: number = this.itemsPerPage,
    orderStatus: string = this.orderStatusFilter,
    paymentMethod: string = this.paymentMethodFilter,
    paymentStatus: string = this.paymentStatusFilter,
    deliveryType: string = this.deliveryTypeFilter,
    search: string = this.searchText
  ) {
    this.isLoading = true;
    console.log('date');
    this.salesDashService
      .getAllOrders(
        page,
        limit,
        orderStatus,
        paymentMethod,
        paymentStatus,
        deliveryType,
        search,
        this.date
      )
      .subscribe(
        (data) => {
          console.log(data);
          this.isLoading = false;
          this.ordersArr = data.items.map((order: Orders) => {
            return {
              ...order,
              formattedCreatedDate: this.datePipe.transform(
                order.createdAt,
                'd MMM,  y h:mm a'
              ),
              scheduleDateFormattedSL: this.formatDate(order.scheduleDate),
            };
          });

          this.hasData = this.ordersArr.length > 0;
          this.totalItems = data.total;
          console.log(this.ordersArr);
        },
        (error) => {
          console.error('Error fetch news:', error);
          if (error.status === 401) {
            this.isLoading = false;
          }
        }
      );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllOrders(this.page, this.itemsPerPage); // Include itemsPerPage
  }

  applyOrderStatusFilters() {
    console.log(this.orderStatusFilter);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  applyPaymentMethodFilters() {
    console.log(this.paymentMethodFilter);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  applyPaymentStatusFilters() {
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  applydeliveryTypeFilters() {
    console.log('deliveryTypeFilter', this.deliveryTypeFilter);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  dateFilter() {
    console.log('date', this.date);
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  formatDate(date: Date | string | null): string {
    return date ? this.datePipe.transform(date, 'yyyy-MM-dd') || '' : '';
  }

  formatTotalItems(): string {
    return this.totalItems < 10
      ? '0' + this.totalItems
      : this.totalItems.toString();
  }

  onSearch() {
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  offSearch() {
    this.searchText = '';
    this.fetchAllOrders(
      this.page,
      this.itemsPerPage,
      this.orderStatusFilter,
      this.paymentMethodFilter,
      this.paymentStatusFilter,
      this.deliveryTypeFilter,
      this.searchText
    );
  }

  Back(): void {
    this.router.navigate(['/sales-dash']);
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  downloadInvoice(id: number, tableInvoiceNo: string): void {
    this.isLoading = true;
    console.log(
      'Starting download - Table InvoiceNo:',
      tableInvoiceNo,
      'ID:',
      id
    );

    this.getInvoiceDetails
      .getInvoiceDetails(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Finished loading invoice details');
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('Full API Response:', response);

          const apiInvoiceNo = response.data?.invoice?.invoiceNumber;
          console.log(
            'API InvoiceNo:',
            apiInvoiceNo,
            'Table InvoiceNo:',
            tableInvoiceNo
          );

          const finalInvoiceNo = tableInvoiceNo || apiInvoiceNo || 'N/A';
          console.log('Using InvoiceNo:', finalInvoiceNo);

          if (!finalInvoiceNo || finalInvoiceNo === 'N/A') {
            console.error('No valid invoice number found');
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Could not determine invoice number',
              confirmButtonColor: '#3085d6',
            });
            return;
          }

          const invoiceDetails = response.data?.invoice || {};
          const billingDetails = response.data?.billing || {};

          const invoiceData: InvoiceData = {
            invoiceNumber: finalInvoiceNo,
            deliveryMethod: invoiceDetails.deliveryMethod || 'N/A',
            invoiceDate: invoiceDetails.invoiceDate || 'N/A',
            scheduledDate: invoiceDetails.scheduledDate || 'N/A',
            paymentMethod: invoiceDetails.paymentMethod || 'N/A',
            grandTotal: invoiceDetails.grandTotal || '0.00',
            buildingType: invoiceDetails.buildingType || 'House',
            familyPackItems: response.data?.items?.familyPacks || [],
            additionalItems: response.data?.items?.additionalItems || [],
            billingInfo: {
              title: billingDetails.title || '',
              fullName: billingDetails.firstName || 'N/A',
              houseNo: invoiceDetails.houseNo || 'N/A',
              street: invoiceDetails.streetName || 'N/A',
              city: invoiceDetails.city || 'N/A',
              phone: billingDetails.phone1 || 'N/A',
              buildingNo: invoiceDetails.buildingNo || '',
              buildingName: invoiceDetails.buildingName || '',
              unitNo: invoiceDetails.unitNo || '',
              floorNo: invoiceDetails.floorNo || '',
            },
            pickupInfo: response.data?.pickupCenter
              ? {
                  centerName: response.data.pickupCenter.name || '',
                  address: {
                    city: response.data.pickupCenter.city || '',
                    district: response.data.pickupCenter.district || '',
                    province: response.data.pickupCenter.province || '',
                    country: response.data.pickupCenter.country || '',
                  },
                }
              : undefined,
            familyPackTotal:
              response.data?.items?.familyPacks
                ?.reduce(
                  (sum: number, pack: any) =>
                    sum + parseFloat(pack.amount || '0'),
                  0
                )
                .toFixed(2) || '0.00',
            additionalItemsTotal:
              response.data?.items?.additionalItems
                ?.reduce(
                  (sum: number, item: any) =>
                    sum + parseFloat(item.amount || '0'),
                  0
                )
                .toFixed(2) || '0.00',
            deliveryFee: invoiceDetails.deliveryFee || '0.00',
            discount: invoiceDetails.orderDiscount || '0.00',
          };

          console.log('Final Invoice Data:', invoiceData);
          this.generatePDF(invoiceData);
        },
        error: (error) => {
          console.error('Error fetching invoice details:', error);
          this.errorMessage = 'Failed to download invoice';
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to download invoice. Please try again.',
            confirmButtonColor: '#3085d6',
          });
        },
      });
  }

  async generatePDF(invoice: InvoiceData): Promise<void> {
    // Helper functions
    const parseNum = (value: string | number): number => {
      if (typeof value === 'number') return value;
      if (!value) return 0;
      const cleaned = value
        .toString()
        .replace(/Rs\.?\s?/, '')
        .replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const formatDate = (dateStr: string | undefined): string => {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', {
        timeZone: 'Asia/Colombo',
        dateStyle: 'medium',
      });
    };

    // Create PDF document
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Set document properties
    doc.setProperties({
      title: `Invoice ${invoice.invoiceNumber || 'N/A'}`,
      subject: 'Invoice',
      author: 'Polygon Holdings',
      keywords: 'invoice, receipt',
      creator: 'Polygon Holdings',
    });

    // Load and add logo
    try {
      const logoUrl = await this.getLogoUrl();
      if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', 150, 10, 40, 15);
      }
    } catch (error) {
      console.warn('Could not load logo:', error);
    }

    // Company Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Polygon Holdings (Private) Ltd', 15, 20);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No. 614, Nawam Mawatha, Colombo 02', 15, 25);
    doc.text('Contact No: +94 112 700 900', 15, 30);
    doc.text('info@polygon.lk', 15, 35);

    // Invoice Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(62, 32, 109);
    doc.text('INVOICE', 105, 20, { align: 'center' });

    // Bill To section - Dynamic address display
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 50);
    doc.setFont('helvetica', 'normal');

    const billingName = `${invoice.billingInfo?.title || ''} ${
      invoice.billingInfo?.fullName || ''
    }`.trim();
    doc.text(billingName || 'N/A', 15, 55);

    let yPosition = 60;

    // Display address based on building type
    if (invoice.buildingType === 'Apartment') {
      const aptAddress = [
        `No. ${invoice.billingInfo.houseNo || 'N/A'}`,
        invoice.billingInfo.street || 'N/A',
        invoice.billingInfo.city || 'N/A',
        ...(invoice.billingInfo.buildingName
          ? [`Building: ${invoice.billingInfo.buildingName}`]
          : []),
        ...(invoice.billingInfo.buildingNo
          ? [`Building No: ${invoice.billingInfo.buildingNo}`]
          : []),
        ...(invoice.billingInfo.unitNo
          ? [`Unit No: ${invoice.billingInfo.unitNo}`]
          : []),
        ...(invoice.billingInfo.floorNo
          ? [`Floor No: ${invoice.billingInfo.floorNo}`]
          : []),
      ];

      aptAddress.forEach((line, i) => {
        doc.text(line, 15, yPosition + i * 5);
      });
      yPosition += aptAddress.length * 5;
    } else {
      // House address format
      doc.text(`No. ${invoice.billingInfo.houseNo || 'N/A'}`, 15, yPosition);
      doc.text(invoice.billingInfo.street || 'N/A', 15, yPosition + 5);
      doc.text(invoice.billingInfo.city || 'N/A', 15, yPosition + 10);
      yPosition += 15;
    }

    // Invoice Details
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber || 'N/A', 15, yPosition + 5);
    yPosition += 10;

    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Method:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.deliveryMethod || 'N/A', 15, yPosition + 5);
    yPosition += 10;

    if (
      invoice.deliveryMethod?.toLowerCase() === 'pickup' &&
      invoice.pickupInfo
    ) {
      doc.setFont('helvetica', 'bold');
      doc.text(
        `Center: ${invoice.pickupInfo.centerName || 'N/A'}`,
        15,
        yPosition
      );
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${invoice.pickupInfo.address?.city || 'N/A'}, ${
          invoice.pickupInfo.address?.district || 'N/A'
        }`,
        15,
        yPosition + 5
      );
      doc.text(
        `${invoice.pickupInfo.address?.province || 'N/A'}, ${
          invoice.pickupInfo.address?.country || 'N/A'
        }`,
        15,
        yPosition + 10
      );
      yPosition += 20;
    }

    // Right side details
    const rightYStart = 50;
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 140, rightYStart);
    doc.setFontSize(11);
    doc.text(
      `Rs. ${parseNum(invoice.grandTotal).toFixed(2)}`,
      140,
      rightYStart + 5
    );
    doc.setFontSize(9);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 140, rightYStart + 15);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.paymentMethod || 'N/A', 140, rightYStart + 20);

    doc.setFont('helvetica', 'bold');
    doc.text('Ordered Date:', 140, rightYStart + 30);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.invoiceDate), 140, rightYStart + 35);

    doc.setFont('helvetica', 'bold');
    doc.text('Scheduled Date:', 140, rightYStart + 45);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.scheduledDate), 140, rightYStart + 50);

    // Family Pack Items
    yPosition = Math.max(yPosition, rightYStart + 60);
    if (invoice.familyPackItems && invoice.familyPackItems.length > 0) {
      for (const pack of invoice.familyPackItems) {
        const estimatedPackHeight = 15 + (pack.packageDetails?.length || 0) * 8;

        if (yPosition + estimatedPackHeight > 250) {
          doc.addPage();
          yPosition = 20;
        }

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${pack.name || 'N/A'} (${pack.packageDetails?.length || 0} Items)`,
          15,
          yPosition
        );
        doc.text(`Rs. ${parseNum(pack.amount).toFixed(2)}`, 180, yPosition, {
          align: 'right',
        });
        yPosition += 5;

        doc.setDrawColor(215, 215, 215);
        doc.setLineWidth(0.5);
        doc.line(15, yPosition, 195, yPosition);
        yPosition += 5;

        const packDetailsBody = [
          [
            {
              content: 'Index',
              styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
            },
            {
              content: 'Item Description',
              styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
            },
            {
              content: 'QTY',
              styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
            },
          ],
          ...(pack.packageDetails?.map((detail: any, i: number) => [
            `${i + 1}.`,
            detail.typeName || 'N/A',
            detail.qty || '0',
          ]) || []),
        ];

        (doc as any).autoTable({
          startY: yPosition,
          head: [packDetailsBody[0]],
          body: packDetailsBody.slice(1),
          margin: { left: 15, right: 15 },
          styles: {
            fontSize: 9,
            cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
            lineColor: [209, 213, 219],
            lineWidth: 0.5,
          },
          headStyles: {
            fillColor: [248, 248, 248],
            textColor: 0,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255],
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // Additional Items
    if (invoice.additionalItems && invoice.additionalItems.length > 0) {
      const estimatedAdditionalItemsHeight =
        15 + invoice.additionalItems.length * 8;

      if (yPosition + estimatedAdditionalItemsHeight > 250) {
        doc.addPage();
        yPosition = 20;
      }

      const addTitle = `Additional Items (${invoice.additionalItems.length} Items)`;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(addTitle, 15, yPosition);
      doc.text(
        `Rs. ${parseNum(invoice.additionalItemsTotal).toFixed(2)}`,
        180,
        yPosition,
        { align: 'right' }
      );
      yPosition += 5;

      doc.setDrawColor(215, 215, 215);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, 195, yPosition);
      yPosition += 5;

      const additionalItemsBody = [
        [
          {
            content: 'Index',
            styles: { fillColor: [243, 244, 246], fontStyle: 'bold' },
          },
          {
            content: 'Item Description',
            styles: { fillColor: [243, 244, 246], fontStyle: 'bold' },
          },
          {
            content: 'Unit Price (Rs.)',
            styles: { fillColor: [243, 244, 246], fontStyle: 'bold' },
          },
          {
            content: 'QTY',
            styles: { fillColor: [243, 244, 246], fontStyle: 'bold' },
          },
          {
            content: 'Amount (Rs.)',
            styles: { fillColor: [243, 244, 246], fontStyle: 'bold' },
          },
        ],
        ...invoice.additionalItems.map((it, i) => [
          `${i + 1}.`,
          it.name || 'N/A',
          it.unitPrice
            ? `Rs. ${parseNum(it.unitPrice).toFixed(2)}`
            : 'Rs. 0.00',
          `${it.quantity || '0'} ${it.unit || ''}`.trim(),
          it.amount ? `Rs. ${parseNum(it.amount).toFixed(2)}` : 'Rs. 0.00',
        ]),
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [additionalItemsBody[0]],
        body: additionalItemsBody.slice(1),
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 9,
          cellPadding: { top: 8, right: 6, bottom: 8, left: 6 },
          lineColor: [209, 213, 219],
          lineWidth: 0.5,
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: 0,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Grand Total
    const estimatedTotalHeight = 30;
    if (yPosition + estimatedTotalHeight > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total for all items', 15, yPosition);
    yPosition += 5;

    doc.setDrawColor(215, 215, 215);
    doc.setLineWidth(0.5);
    doc.line(15, yPosition, 195, yPosition);
    yPosition += 5;

    const grandTotalBody: any[] = [
      ['Family Packs', `Rs. ${parseNum(invoice.familyPackTotal).toFixed(2)}`],
      [
        'Additional Items',
        `Rs. ${parseNum(invoice.additionalItemsTotal).toFixed(2)}`,
      ],
      ['Delivery Fee', `Rs. ${parseNum(invoice.deliveryFee).toFixed(2)}`],
      ['Discount', `Rs. ${parseNum(invoice.discount).toFixed(2)}`],
      [
        { content: 'Total', styles: { fontStyle: 'bold' } },
        {
          content: `Rs. ${(
            parseNum(invoice.familyPackTotal) +
            parseNum(invoice.additionalItemsTotal) +
            parseNum(invoice.deliveryFee) -
            parseNum(invoice.discount)
          ).toFixed(2)}`,
          styles: { fontStyle: 'bold' },
        },
      ],
    ];

    (doc as any).autoTable({
      startY: yPosition,
      body: grandTotalBody,
      margin: { left: 15, right: 15 },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 'auto', halign: 'right' },
      },
      styles: {
        fontSize: 9,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
        lineColor: [255, 255, 255],
        lineWidth: 0,
      },
      bodyStyles: {
        lineWidth: 0,
      },
      didDrawCell: (data: any) => {
        if (data.row.index === grandTotalBody.length - 1) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height
          );
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;

    // Remarks
    const estimatedRemarksHeight = 30;
    if (yPosition + estimatedRemarksHeight > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', 15, yPosition);
    yPosition += 5;
    doc.setFont('helvetica', 'normal');
    const remarks = [
      'Kindly inspect all goods at the time of delivery to ensure accuracy and condition.',
      'Polygon does not accept returns under any circumstances.',
      'Please report any issues or discrepancies within 24 hours of delivery to ensure prompt attention.',
      'For any assistance, feel free to contact our customer service team.',
    ];
    remarks.forEach((remark) => {
      doc.text(remark, 15, yPosition);
      yPosition += 5;
    });

    // Footer
    const estimatedFooterHeight = 20;
    if (yPosition + estimatedFooterHeight > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with us!', 105, yPosition, {
      align: 'center',
    });
    yPosition += 5;
    doc.text(
      'WE WILL SEND YOU MORE OFFERS, LOWEST PRICED VEGGIES FROM US',
      105,
      yPosition,
      { align: 'center' }
    );
    yPosition += 5;
    doc.setTextColor(128, 128, 128);
    doc.text(
      '-THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED-',
      105,
      yPosition,
      { align: 'center' }
    );

    // Save the PDF
    doc.save(`invoice_${invoice.invoiceNumber || 'unknown'}.pdf`);
  }

  private async getLogoUrl(): Promise<string | null> {
    try {
      const logoPath = 'assets/images/POLYGON ORIGINAL LOGO.png';

      // Add type assertion
      const logoBlob = (await this.http
        .get(logoPath, { responseType: 'blob' })
        .toPromise()) as Blob;

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }
}

class Orders {
  id!: number;
  invNo!: string;
  cusId!: string;
  fullDiscount!: number;
  fullTotal!: number;
  empId!: string;
  firstName!: string;
  lastName!: string;
  orderStatus!: string;
  paymentMethod!: string;
  paymentStatus!: number;
  scheduleDate!: Date;
  deliveryType!: string;
  timeSlot!: string;
  createdAt!: Date;
  formattedCreatedDate!: string;
  scheduleDateFormattedSL?: string;
}

// applyFilters() {
//   this.fetchAllSalesAgents(this.page, this.itemsPerPage, this.searchText, this.statusFilter);
// }
