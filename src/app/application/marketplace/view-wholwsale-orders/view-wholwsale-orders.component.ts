import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { TokenService } from '../../../services/token/services/token.service';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { InvoiceService } from '../../../services/invoice/invoice.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CalendarModule } from 'primeng/calendar';
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
  billingInfo: {
    title: string;
    fullName: string;
    houseNo: string;
    street: string;
    city: string;
    phone: string;
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
  selector: 'app-view-wholwsale-orders',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    HttpClientModule,
    NgxPaginationModule,
    FormsModule,
    LoadingSpinnerComponent,
    CalendarModule,
  ],
  templateUrl: './view-wholwsale-orders.component.html',
  styleUrl: './view-wholwsale-orders.component.css',
})
export class ViewWholwsaleOrdersComponent implements OnInit {
  // centerNameObj: CenterName = new CenterName();
  // companyId!: number;
  // collectionObj!: CollectionCenter[];
  // filteredCollection!: CollectionCenter[];

  retailordersArr: RetailOrders[] = [];

  searchItem: string = '';
  page: number = 1;
  itemsPerPage: number = 10;
  isLoading = false;
  totalItems: number = 0;
  hasData: boolean = true;
  centerId!: number;

  selectMethod: string = '';
  selectStatus: string = '';
  selectDate: Date | null = null;
  formattedDate: string = '';
  errorMessage: string | null = null;

  isDateSelected = false;

  methodOptions = [
    { label: 'Delivery', value: 'delivery' },
    { label: 'Pickup', value: 'pickup' },
  ];

  statusOptions = [
    { label: 'Assigned', value: 'Assigned' },
    { label: 'Delivered', value: 'Delivered' },
    { label: 'Ordered', value: 'Ordered' },
    { label: 'Picked Up', value: 'Picked Up' },
    { label: 'Processing', value: 'Processing' },
  ];

  constructor(
    private router: Router,
    private MaketplaceSrv: MarketPlaceService,
    public tokenService: TokenService,
    public permissionService: PermissionService,
    private getInvoiceDetails: InvoiceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.fetchAllRetailOrders(this.page, this.itemsPerPage);
  }

  fetchAllRetailOrders(
    page: number = this.page,
    limit: number = this.itemsPerPage,
    status: string = this.selectStatus,
    method: string = this.selectMethod,
    searchItem: string = this.searchItem,
    formattedDate: string = this.formattedDate
  ) {
    this.isLoading = true;
    console.log('sending', status);
    this.MaketplaceSrv.getAllWholesaleOrders(
      page,
      limit,
      status,
      method,
      searchItem,
      formattedDate
    ).subscribe(
      (response) => {
        console.log('These are the data', response);

        this.isLoading = false;
        this.retailordersArr = response.items;
        this.hasData = this.retailordersArr.length > 0;
        this.totalItems = response.total;
      },
      (error) => {
        if (error.status === 401) {
          // Unauthorized access handling (left empty intentionally)
        }
      }
    );
  }

  onPageChange(event: number) {
    this.page = event;
    this.fetchAllRetailOrders(this.page, this.itemsPerPage);
  }

  searchReailOrders() {
    console.log(this.searchItem);
    this
      .fetchAllRetailOrders
      // this.page,
      // this.itemsPerPage,
      ();
  }

  clearSearch(): void {
    this.searchItem = '';
    this.fetchAllRetailOrders();
  }

  applyMethodFilters() {
    this.fetchAllRetailOrders();
  }

  clearMethodFilter() {
    this.selectMethod = '';
    this.fetchAllRetailOrders();
  }

  applyStatusFilters() {
    console.log('status', this.selectStatus);
    this.fetchAllRetailOrders();
  }

  clearStatusFilter() {
    this.selectStatus = '';
    this.fetchAllRetailOrders();
  }

  applyDateFilter() {
    console.log(this.isDateSelected);
    if (this.selectDate instanceof Date) {
      const year = this.selectDate.getFullYear();
      const month = String(this.selectDate.getMonth() + 1).padStart(2, '0');
      const day = String(this.selectDate.getDate()).padStart(2, '0');
      this.formattedDate = `${year}-${month}-${day}`;
      console.log('Filter by date:', this.formattedDate);
      this.fetchAllRetailOrders();
    }
  }

  onDateSelect() {
    this.isDateSelected = true;
    this.applyDateFilter(); // call your original method
  }

  onDateChange(event: any): void {
    if (!event) {
      this.isDateSelected = false;
      console.log('Date cleared');
      this.formattedDate = '';
      this.fetchAllRetailOrders(); // or reset filters
    }
  }

  navigateDashboard(id: number) {
    this.router.navigate([`/collection-hub/collection-center-dashboard/${id}`]);
  }

  downloadInvoice(id: number, tableInvoiceNo: string): void {
    this.isLoading = true;
    console.log(
      'Starting download - Table InvoiceNo:',
      tableInvoiceNo,
      'ID:',
      id
    ); // Debug log

    this.getInvoiceDetails
      .getInvoiceDetails(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Finished loading invoice details'); // Debug log
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('API Response:', response); // Debug entire response

          // Debug invoice number sources
          const apiInvoiceNo = response.data.invoice?.invoiceNumber;
          console.log(
            'API InvoiceNo:',
            apiInvoiceNo,
            'Table InvoiceNo:',
            tableInvoiceNo
          );

          // Determine which invoice number to use (prefer table's version)
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

          // Transform the API response
          const invoiceData: InvoiceData = {
            invoiceNumber: finalInvoiceNo, // Use the determined invoice number
            deliveryMethod: response.data.invoice?.deliveryMethod || 'N/A',
            invoiceDate: response.data.invoice?.invoiceDate || 'N/A',
            scheduledDate: response.data.invoice?.scheduledDate || 'N/A',
            paymentMethod: response.data.invoice?.paymentMethod || 'N/A',
            grandTotal: response.data.invoice?.grandTotal || '0.00',
            familyPackItems: response.data.items?.familyPacks || [],
            additionalItems: response.data.items?.additionalItems || [],
            billingInfo: response.data.billing
              ? {
                  title: response.data.billing.title || '',
                  fullName: response.data.billing.fullName || '',
                  houseNo: response.data.billing.houseNo || '',
                  street: response.data.billing.street || '',
                  city: response.data.billing.city || '',
                  phone: response.data.billing.phone1 || '',
                }
              : {
                  title: '',
                  fullName: 'N/A',
                  houseNo: 'N/A',
                  street: 'N/A',
                  city: 'N/A',
                  phone: 'N/A',
                },
            pickupInfo: response.data.pickupCenter
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
              response.data.items?.familyPacks
                ?.reduce(
                  (sum: number, pack: any) =>
                    sum + parseFloat(pack.amount || '0'),
                  0
                )
                .toFixed(2) || '0.00',
            additionalItemsTotal:
              response.data.items?.additionalItems
                ?.reduce(
                  (sum: number, item: any) =>
                    sum + parseFloat(item.amount || '0'),
                  0
                )
                .toFixed(2) || '0.00',
            deliveryFee: response.data.invoice?.deliveryFee || '0.00',
            discount: response.data.invoice?.orderDiscount || '0.00',
          };

          console.log('Final Invoice Data:', invoiceData); // Debug final data
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
    doc.setTextColor(62, 32, 109); // #3E206D
    doc.text('INVOICE', 105, 20, { align: 'center' });

    // Bill To section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 50);
    doc.setFont('helvetica', 'normal');

    const billingName = `${invoice.billingInfo?.title || ''} ${
      invoice.billingInfo?.fullName || ''
    }`.trim();
    doc.text(billingName || 'N/A', 15, 55);
    doc.text(`No. ${invoice.billingInfo?.houseNo || 'N/A'}`, 15, 60);
    doc.text(invoice.billingInfo?.street || 'N/A', 15, 65);
    doc.text(invoice.billingInfo?.city || 'N/A', 15, 70);
    doc.text(invoice.billingInfo?.phone || 'N/A', 15, 75);

    // Invoice Details
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 15, 85);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber || 'N/A', 15, 90);

    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Method:', 15, 100);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.deliveryMethod || 'N/A', 15, 105);

    if (
      invoice.deliveryMethod?.toLowerCase() === 'pickup' &&
      invoice.pickupInfo
    ) {
      doc.setFont('helvetica', 'bold');
      doc.text(`Center: ${invoice.pickupInfo.centerName || 'N/A'}`, 15, 115);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `${invoice.pickupInfo.address?.city || 'N/A'}, ${
          invoice.pickupInfo.address?.district || 'N/A'
        }`,
        15,
        120
      );
      doc.text(
        `${invoice.pickupInfo.address?.province || 'N/A'}, ${
          invoice.pickupInfo.address?.country || 'N/A'
        }`,
        15,
        125
      );
    }

    // Right side details
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 140, 50);
    doc.setFontSize(11);
    doc.text(`Rs. ${parseNum(invoice.grandTotal).toFixed(2)}`, 140, 55);
    doc.setFontSize(9);

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 140, 65);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.paymentMethod || 'N/A', 140, 70);

    doc.setFont('helvetica', 'bold');
    doc.text('Ordered Date:', 140, 80);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.invoiceDate), 140, 85);

    doc.setFont('helvetica', 'bold');
    doc.text('Scheduled Date:', 140, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.scheduledDate), 140, 100);

    // Family Pack Items
    let yPosition = 130;
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

      if (
        (invoice.familyPackItems?.length || 0) > 0 ||
        yPosition + estimatedAdditionalItemsHeight > 250
      ) {
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

class RetailOrders {
  id!: number;
  customerName!: string;
  method!: number;
  amount!: number;
  invNo!: string;
  status!: string;
  orderdDate!: Date;
}
