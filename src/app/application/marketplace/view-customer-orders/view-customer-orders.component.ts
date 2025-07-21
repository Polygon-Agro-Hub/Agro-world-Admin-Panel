import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MarketPlaceService } from '../../../services/market-place/market-place.service';
import { finalize } from 'rxjs/operators';
import { InvoiceService } from '../../../services/invoice/invoice.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import autoTable, { RowInput } from 'jspdf-autotable';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

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
  deliveryCharge?: {
    id: number;
    companycenterId: number | null;
    city: string;
    charge: string;
  } | null;
  billingInfo: {
    title: string;
    fullName: string;
    houseNo: string;
    street: string;
    city: string;
    phonecode1: string;
    phone1: string;
    userEmail: string;
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

interface Order {
  id: number;
  invNo: string;
  sheduleType: string;
  sheduleDate: string;
  paymentMethod: string;
  isPaid: boolean;
  fullTotal: number;
  status: string;
}

interface ApiResponse {
  success: boolean;
  data: {
    orders: Order[];
    totalCount: number;
  };
  message?: string;
}

@Component({
  selector: 'app-view-customer-orders',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './view-customer-orders.component.html',
  styleUrls: ['./view-customer-orders.component.css'],
})
export class ViewCustomerOrdersComponent implements OnInit {
  isLoading: boolean = false;
  activeButton: string = 'assigned';
  errorMessage: string | null = null;
  userId: string = '';
  orders: Order[] = [];
  totalItems: number = 0;

  // Status mapping for UI buttons to API values
  private statusMap: { [key: string]: string } = {
    assigned: 'Assinged',
    processing: 'Processing',
    delivered: 'Delivered',
    ontheway: 'On the way',
    cancelled: 'Cancelled',
    failed: 'Faild',
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private marketplace: MarketPlaceService,
    private getInvoiceDetails: InvoiceService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.userId = params['id'];
      if (this.userId) {
        this.fetchCustomerOrders();
      } else {
        this.errorMessage = 'No user ID provided';
      }
    });
  }

  back(): void {
    window.history.back();
  }

  onStatusChange(status: string): void {
    if (this.activeButton !== status) {
      this.activeButton = status;
      this.fetchCustomerOrders();
    }
  }

  fetchCustomerOrders(): void {
    if (!this.userId) {
      this.errorMessage = 'User ID is required';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    // Get the API status value from our mapping
    const apiStatus = this.statusMap[this.activeButton] || 'Ordered';

    this.marketplace
      .fetchUserOrders(this.userId, apiStatus)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: ApiResponse) => {
          console.log('This is the tesponce', response);

          if (response.success) {
            this.orders = response.data.orders;
            this.totalItems = response.data.totalCount;
          } else {
            this.errorMessage = response.message || 'Failed to load orders';
          }
        },
        error: (error) => {
          console.error('Error fetching orders:', error);
          this.errorMessage =
            error.message || 'An error occurred while fetching orders';
        },
      });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      Assinged: 'bg-[#E6F0FF] text-[#415CFF]', // Blue background, blue text
      Processing: 'bg-[#FFF8E6] text-[#FFB800]', // Yellow background, yellow text
      Delivered: 'bg-[#E6FFEE] text-[#00A441]', // Green background, green text
      'On the way': 'bg-[#F3E6FF] text-[#8A3FFC]', // Purple background, purple text
      Cancelled: 'bg-[#FFE6E6] text-[#FF0000]', // Red background, red text
      Faild: 'bg-[#FFE6E6] text-[#FF0000]', // Red background, red text
    };
    return statusClasses[status] || 'bg-gray-100 text-gray-800';
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

          // Use delivery charge from API response if available, otherwise fall back to invoiceDetails.deliveryFee
          const deliveryFee =
            response.data?.deliveryCharge?.charge ||
            invoiceDetails.deliveryFee ||
            '0.00';

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
              title: invoiceDetails.title || '',
              fullName: invoiceDetails.fullName || 'N/A',
              houseNo: invoiceDetails.houseNo || 'N/A',
              street: invoiceDetails.streetName || 'N/A',
              city: invoiceDetails.city || 'N/A',
              phonecode1: invoiceDetails.phonecode1 || 'N/A',
              phone1: invoiceDetails.phone1 || 'N/A',
              userEmail: invoiceDetails.userEmail || 'N/A',
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
            deliveryFee: deliveryFee, // Use the calculated delivery fee
            deliveryCharge: response.data?.deliveryCharge || null, // Include the full delivery charge object
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
    const formatNumberWithCommas = (value: string | number): string => {
      const num = parseNum(value);
      return num.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
    };

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

    // INVOICE TITLE AT THE VERY TOP
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(62, 32, 109);
    doc.text('INVOICE', 105, 15, { align: 'center' });

    // Load and add logo
    try {
      const logoUrl = await this.getLogoUrl();
      if (logoUrl) {
        doc.addImage(logoUrl, 'PNG', 150, 20, 40, 15);
      }
    } catch (error) {
      console.warn('Could not load logo:', error);
    }

    // Company Info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Polygon Holdings (Private) Ltd', 15, 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('No. 614, Nawam Mawatha, Colombo 02', 15, 30);
    doc.text('Contact No: +94 112 700 900', 15, 35);
    doc.text('info@polygon.lk', 15, 40);

    // Bill To section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 55);
    doc.setFont('helvetica', 'normal');

    const billingName = `${invoice.billingInfo?.title || ''} ${
      invoice.billingInfo?.fullName || ''
    }`.trim();
    doc.text(billingName || 'N/A', 15, 60);

    let yPosition = 65;

    // Address display
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
      doc.text(`No. ${invoice.billingInfo.houseNo || 'N/A'}`, 15, yPosition);
      doc.text(invoice.billingInfo.street || 'N/A', 15, yPosition + 5);
      doc.text(invoice.billingInfo.city || 'N/A', 15, yPosition + 10);
      yPosition += 15;
    }

    if (invoice.billingInfo.phonecode1 || invoice.billingInfo.phone1) {
      const phoneNumber = `${invoice.billingInfo.phonecode1 || ''} ${
        invoice.billingInfo.phone1 || ''
      }`.trim();
      if (phoneNumber) {
        doc.text(`${phoneNumber}`, 15, yPosition);
        yPosition += 5;
      }
    }

    if (invoice.billingInfo.userEmail) {
      const email = `${invoice.billingInfo.userEmail} `.trim();
      if (email) {
        doc.text(`${email}`, 15, yPosition);
        yPosition += 5;
      }
    }

    yPosition += 5;

    // Invoice Details
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber || 'N/A', 15, yPosition + 5);
    yPosition += 10;

    yPosition += 3;

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

    // Add extra space here between Delivery Method and Package Title
    yPosition += 10;

    // Right side details
    const rightYStart = 55;
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 140, rightYStart);
    doc.setFontSize(11);
    doc.text(
      `Rs. ${formatNumberWithCommas(
        parseNum(invoice.familyPackTotal) +
          parseNum(invoice.additionalItemsTotal) +
          parseNum(invoice.deliveryFee) -
          parseNum(invoice.discount)
      )}`,
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
        doc.text(`Rs. ${formatNumberWithCommas(pack.amount)}`, 180, yPosition, {
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
          },
          headStyles: {
            fillColor: [248, 248, 248],
            textColor: 0,
            fontStyle: 'bold',
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255],
          },
          tableLineColor: [209, 213, 219],
          tableLineWidth: 0.5,
          showHorizontalLines: false,
          showVerticalLines: false,
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;
      }
    }

    // Additional Items
    if (invoice.additionalItems && invoice.additionalItems.length > 0) {
      yPosition += 5;

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
        `Rs. ${formatNumberWithCommas(invoice.additionalItemsTotal)}`,
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
            ? `Rs. ${formatNumberWithCommas(it.unitPrice)}`
            : 'Rs. 0.00',
          `${it.quantity || '0'} ${it.unit || ''}`.trim(),
          it.amount ? `Rs. ${formatNumberWithCommas(it.amount)}` : 'Rs. 0.00',
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
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: 0,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [255, 255, 255],
        },
        tableLineColor: [209, 213, 219],
        tableLineWidth: 0.5,
        showHorizontalLines: false,
        showVerticalLines: false,
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Grand Total
    const estimatedTotalHeight =
      30 + (invoice.familyPackItems?.length || 0) * 5;
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

    // Create grand total body with individual packages
    const grandTotalBody: any[] = [];

    // Add each family pack separately if they exist
    if (invoice.familyPackItems && invoice.familyPackItems.length > 0) {
      invoice.familyPackItems.forEach((pack) => {
        grandTotalBody.push([
          pack.name || 'Family Pack',
          `Rs. ${formatNumberWithCommas(pack.amount)}`,
        ]);
      });
    }

    // Add additional items total if they exist
    if (invoice.additionalItems && invoice.additionalItems.length > 0) {
      grandTotalBody.push([
        'Additional Items',
        `Rs. ${formatNumberWithCommas(invoice.additionalItemsTotal)}`,
      ]);
    }

    // Add delivery fee and discount
    grandTotalBody.push([
      'Delivery Fee',
      `Rs. ${formatNumberWithCommas(invoice.deliveryFee)}`,
    ]);
    grandTotalBody.push([
      'Discount',
      `Rs. ${formatNumberWithCommas(invoice.discount)}`,
    ]);

    // Add final total
    grandTotalBody.push([
      { content: 'Grand Total', styles: { fontStyle: 'bold' } },
      {
        content: `Rs. ${formatNumberWithCommas(
          parseNum(invoice.familyPackTotal) +
            parseNum(invoice.additionalItemsTotal) +
            parseNum(invoice.deliveryFee) -
            parseNum(invoice.discount)
        )}`,
        styles: { fontStyle: 'bold' },
      },
    ]);

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

    // UPDATED REMARKS SECTION (WITHOUT UNDERLINE)
    const estimatedRemarksHeight = 50;
    if (yPosition + estimatedRemarksHeight > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Remarks Title without underline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Remarks:', 15, yPosition);
    yPosition += 8;

    // Remarks content
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const remarks = [
      'Kindly inspect all goods at the time of delivery to ensure accuracy and condition.',
      '',
      'Polygon does not accept returns under any circumstances.',
      '',
      'Please report any issues or discrepancies within 24 hours of delivery to ensure prompt attention.',
      '',
      'For any assistance, feel free to contact our customer service team.',
    ];

    remarks.forEach((remark) => {
      if (remark) {
        doc.text(remark, 15, yPosition);
      }
      yPosition += 4;
    });

    // Footer
    yPosition += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Thank you for shopping with us!', 105, yPosition, {
      align: 'center',
    });

    yPosition += 6;
    doc.setFontSize(9);
    doc.text(
      'WE WILL SEND YOU MORE OFFERS , LOWEST PRICED VEGGIES FROM US.',
      105,
      yPosition,
      { align: 'center' }
    );

    yPosition += 6;
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.text(
      '- THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED -',
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
