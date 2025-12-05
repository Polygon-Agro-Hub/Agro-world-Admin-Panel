import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment.development';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';

interface InvoiceData {
  invoiceNumber: string;
  orderApp: string;
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
    couponValue: string;
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

@Injectable({
  providedIn: 'root',
})
export class PostinvoiceService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getPostInvoiceDetails(processOrderId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(
      `${this.apiUrl}market-place/postinvoice/${processOrderId}`,
      { headers }
    );
  }

  async generateAndDownloadInvoice(
    processOrderId: number,
    tableInvoiceNo: string
  ): Promise<void> {
    try {
      const response = await this.getPostInvoiceDetails(processOrderId).toPromise();
      console.log('Full API Response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch invoice details');
      }

      // Extract data from the API response with proper mapping
      const invoiceDetails = response.data?.invoice || {};
      const billingDetails = response.data?.billing || {};
      const familyPacks = response.data?.items?.familyPacks || [];
      const additionalItems = response.data?.items?.additionalItems || [];
      const pickupCenter = response.data?.pickupCenter || null;
      const deliveryCharge = response.data?.deliveryCharge || null;

      const apiInvoiceNo = invoiceDetails.invoiceNumber;
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

      // Calculate delivery fee based on delivery method
      let deliveryFee = '0.00';
      if (invoiceDetails.deliveryMethod === 'Pickup') {
        deliveryFee = '0.00';
      } else if (deliveryCharge) {
        deliveryFee = deliveryCharge.charge || '0.00';
      }

      // Calculate totals
      const familyPackTotal = familyPacks.reduce(
        (sum: number, pack: any) => sum + parseFloat(pack.amount || '0'),
        0
      );

      const additionalItemsTotal = additionalItems.reduce(
        (sum: number, item: any) => sum + parseFloat(item.amount || '0'),
        0
      );

      // Map the data to match the InvoiceData interface
      const invoiceData: InvoiceData = {
        invoiceNumber: finalInvoiceNo,
        orderApp: invoiceDetails.orderApp || 'N/A',
        deliveryMethod: invoiceDetails.deliveryMethod || 'N/A',
        invoiceDate: invoiceDetails.invoiceDate || 'N/A',
        scheduledDate: invoiceDetails.scheduledDate || 'N/A',
        paymentMethod: invoiceDetails.paymentMethod || 'N/A',
        grandTotal: invoiceDetails.grandTotal || '0.00',
        buildingType: invoiceDetails.buildingType || 'House',
        familyPackItems: familyPacks,
        additionalItems: additionalItems,
        deliveryCharge: deliveryCharge,
        deliveryFee: deliveryFee,
        discount: invoiceDetails.orderDiscount || '0.00',
        billingInfo: {
          title: billingDetails.title || invoiceDetails.title || '',
          fullName: billingDetails.fullName || invoiceDetails.fullName || 'N/A',
          houseNo: billingDetails.houseNo || invoiceDetails.houseNo || 'N/A',
          street: billingDetails.street || invoiceDetails.streetName || 'N/A',
          city: billingDetails.city || invoiceDetails.city || 'N/A',
          phonecode1: billingDetails.phoneCode1 || invoiceDetails.phonecode1 || 'N/A',
          phone1: billingDetails.phone1 || invoiceDetails.phone1 || 'N/A',
          userEmail: invoiceDetails.userEmail || 'N/A',
          buildingNo: invoiceDetails.buildingNo || '',
          buildingName: invoiceDetails.buildingName || '',
          unitNo: invoiceDetails.unitNo || '',
          floorNo: invoiceDetails.floorNo || '',
          couponValue: billingDetails.couponValue || '0.00',
        },
        pickupInfo: pickupCenter ? {
          centerName: pickupCenter.centerName || 'N/A',
          address: {
            city: pickupCenter.city || '',
            district: pickupCenter.district || '',
            province: pickupCenter.province || '',
            country: pickupCenter.country || '',
          },
        } : undefined,
        familyPackTotal: familyPackTotal.toFixed(2),
        additionalItemsTotal: additionalItemsTotal.toFixed(2),
      };

      console.log('Final Invoice Data:', invoiceData);
      await this.generatePDF(invoiceData);
    } catch (error) {
      console.error('Error generating invoice:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to generate invoice. Please try again.',
        confirmButtonColor: '#3085d6',
      });
      throw error;
    }
  }

  private async generatePDF(invoice: InvoiceData): Promise<void> {
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

  doc.setTextColor(0, 0, 0);

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

  doc.setTextColor(0, 0, 0);

  // Load and add logo
  try {
    const logoUrl = await this.getLogoUrl();
    if (logoUrl) {
      doc.addImage(logoUrl, 'PNG', 140, 25, 40, 20);
    }
  } catch (error) {
    console.warn('Could not load logo:', error);
  }

  // Company Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Polygon Agro Holdings (Private) Ltd', 15, 25);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('No. 42/46, Nawam Mawatha, Colombo 02.', 15, 30);
  doc.text('Contact No: +94 770 111 999', 15, 35);
  doc.text('Email Address: info@polygon.lk', 15, 40);

  // Bill To section
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 15, 55);
  doc.setFont('helvetica', 'normal');

  const billingName = `${
    invoice.billingInfo?.title ? `${invoice.billingInfo.title}.` : ''
  }${invoice.billingInfo?.fullName || ''}`.trim();
  doc.text(billingName || 'N/A', 15, 60);

  let yPosition = 65;

  // Add contact information right after the name
  if (invoice.billingInfo.phonecode1 || invoice.billingInfo.phone1) {
    const phoneNumber = `${invoice.billingInfo.phonecode1 || ''} ${
      invoice.billingInfo.phone1 || ''
    }`.trim();
    if (phoneNumber) {
      doc.text(`Mobile: ${phoneNumber}`, 15, yPosition);
      yPosition += 5;
    }
  }

  if (invoice.billingInfo.userEmail) {
    const email = `${invoice.billingInfo.userEmail}`.trim();
    if (email) {
      doc.text(`Email: ${email}`, 15, yPosition);
      yPosition += 5;
    }
  }

  // Only show address if delivery method is not Pickup
  if (invoice.deliveryMethod?.toLowerCase() !== 'pickup') {
    // Add space before address
    yPosition += 3;

    // Address display - updated to match the image examples
    if (invoice.buildingType === 'Apartment') {
      doc.setFont('helvetica', 'bold');
      doc.text('Apartment Address:', 15, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');

      const aptAddress = [
        `No : ${invoice.billingInfo.buildingNo || 'N/A'},`,
        `Name : ${invoice.billingInfo.buildingName || 'N/A'},`,
        `Flat : ${invoice.billingInfo.unitNo || 'N/A'},`,
        `Floor : ${invoice.billingInfo.floorNo || 'N/A'},`,
        `House No : ${invoice.billingInfo.houseNo || 'N/A'},`,
        `Street Name : ${invoice.billingInfo.street || 'N/A'},`,
        `City : ${invoice.billingInfo.city || 'N/A'}`,
      ];

      aptAddress.forEach((line) => {
        // Split the line to separate label and value
        const colonIndex = line.indexOf(':');
        const label = line.substring(0, colonIndex + 1);
        const value = line.substring(colonIndex + 1);
        
        // Draw label in gray color
        doc.setTextColor(146, 146, 146); // #929292 in RGB
        doc.text(label, 15, yPosition);
        
        // Draw value in black color
        const labelWidth = doc.getTextWidth(label);
        doc.setTextColor(0, 0, 0);
        doc.text(value, 15 + labelWidth, yPosition);
        
        yPosition += 5;
      });
    } else {
      doc.setFont('helvetica', 'bold');
      doc.text('House Address:', 15, yPosition);
      yPosition += 5;
      doc.setFont('helvetica', 'normal');

      const houseAddress = [
        `House No : ${invoice.billingInfo.houseNo || 'N/A'},`,
        `Street Name : ${invoice.billingInfo.street || 'N/A'},`,
        `City : ${invoice.billingInfo.city || 'N/A'}`,
      ];

      houseAddress.forEach((line) => {
        // Split the line to separate label and value
        const colonIndex = line.indexOf(':');
        const label = line.substring(0, colonIndex + 1);
        const value = line.substring(colonIndex + 1);
        
        // Draw label in gray color
        doc.setTextColor(146, 146, 146); // #929292 in RGB
        doc.text(label, 15, yPosition);
        
        // Draw value in black color
        const labelWidth = doc.getTextWidth(label);
        doc.setTextColor(0, 0, 0);
        doc.text(value, 15 + labelWidth, yPosition);
        
        yPosition += 5;
      });
    }

    // Add space after address
    yPosition += 5;
  }

  // Add small space above Invoice No
  yPosition += 3;

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
  doc.text(
    invoice.deliveryMethod === 'Pickup' ? 'Instore Pickup' : 'Home Delivery',
    15,
    yPosition + 5
  );
  yPosition += 10;

  if (
    invoice.deliveryMethod?.toLowerCase() === 'pickup' &&
    invoice.pickupInfo
  ) {
    // Add space before Pickup Center
    yPosition += 5;

    doc.setFont('helvetica', 'bold');
    const pickupLabel = 'Centre:';
    doc.text(pickupLabel, 15, yPosition);

    // Calculate position for center name with small space
    const centerName = invoice.pickupInfo.centerName || '';
    const spaceWidth = 2; // Small space in mm
    const centerNameX = 15 + doc.getTextWidth(pickupLabel) + spaceWidth;

    doc.setFont('helvetica', 'bold');
    doc.text(centerName, centerNameX, yPosition);

    // Format address like in your image
    const addressLines = [
      invoice.pickupInfo.address?.city || '',
      invoice.pickupInfo.address?.district || '',
      invoice.pickupInfo.address?.province || '',
      invoice.pickupInfo.address?.country || '',
    ].filter((line) => line); // Remove empty lines

    // Join with comma and space, similar to your image
    const formattedAddress = addressLines.join(', ');

    doc.setFont('helvetica', 'normal');
    doc.text(formattedAddress, 15, yPosition + 5);
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
    `Rs. ${formatNumberWithCommas(invoice.grandTotal)}`,
    140,
    rightYStart + 5
  );
  doc.setFontSize(9);

  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method:', 140, rightYStart + 15);
  doc.setFont('helvetica', 'normal');
  doc.text(
    invoice.paymentMethod === 'Card'
      ? 'Debit/Credit Card'
      : 'Cash On Delivery',
    140,
    rightYStart + 20
  );

  doc.setFont('helvetica', 'bold');
  doc.text('Ordered Date:', 140, rightYStart + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.invoiceDate), 140, rightYStart + 35);

  doc.setFont('helvetica', 'bold');
  doc.text('Scheduled Date:', 140, rightYStart + 45);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(invoice.scheduledDate), 140, rightYStart + 50);

  // Family Pack Items - UPDATED SECTION with units in QTY
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
      doc.text(`Rs. ${formatNumberWithCommas(pack.amount)}`, 195, yPosition, {
        align: 'right',
      });
      yPosition += 5;

      doc.setDrawColor(215, 215, 215);
      doc.setLineWidth(0.5);
      doc.line(15, yPosition, 195, yPosition);
      yPosition += 5;

      // UPDATED: Package details table with units in QTY column
      const packDetailsBody = [
        [
          {
            content: 'Index',
            styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
          },
          {
            content: 'Category',
            styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
          },
          {
            content: 'Item Description',
            styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
          },
          {
            content: 'Unit Price (Rs.)',
            styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
          },
          {
            content: 'QTY',
            styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
          },
          {
            content: 'Amount (Rs.)',
            styles: { fillColor: [248, 248, 248], fontStyle: 'bold' },
          },
        ],
        ...(pack.packageDetails?.map((detail: any, i: number) => {
          // Get the unit from backend data
          const unit = detail.unit || '';
          // Format quantity with unit (e.g., "1 kg" or "500 g")
          const qtyWithUnit = unit ? `${detail.qty || '0'} ${unit}` : `${detail.qty || '0'}`;
          
          return [
            `${i + 1}.`,
            detail.typeName || 'N/A', // Category column
            detail.productName || 'N/A', // Item Description column
            `Rs. ${formatNumberWithCommas((detail.price || 0).toFixed(2))}`,
            qtyWithUnit, // Updated: quantity with unit
            `Rs. ${formatNumberWithCommas(((detail.qty || 0) * (detail.price || 0)).toFixed(2))}`,
          ];
        }) || []),
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
        columnStyles: {
          0: { cellWidth: 20 }, // Index
          1: { cellWidth: 29 }, // Category
          2: { cellWidth: 40 }, // Item Description
          3: { cellWidth: 35 }, // Unit Price
          4: { cellWidth: 21 }, // QTY
          5: { cellWidth: 35 }, // Amount
        },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Additional Items - UPDATED with units in QTY
  if (invoice.additionalItems && invoice.additionalItems.length > 0) {
    yPosition += 5;

    const estimatedAdditionalItemsHeight =
      15 + invoice.additionalItems.length * 8;

    if (yPosition + estimatedAdditionalItemsHeight > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Calculate total amount for additional items
    const additionalItemsTotalAmount = invoice.additionalItems.reduce(
      (total, item) => {
        return total + parseFloat(item.amount || '0');
      },
      0
    );

    const hasFamilyPacks =
      invoice.familyPackItems && invoice.familyPackItems.length > 0;

    // MODIFIED: Determine title based on orderApp
    let addTitle;
    if (invoice.orderApp === 'Marketplace') {
      addTitle = hasFamilyPacks
        ? ` Additional Items(${invoice.additionalItems.length} Items)`
        : ` Your Selected Items(${invoice.additionalItems.length} Items)`;
        
    } else if (invoice.orderApp === 'Dash') {
      addTitle = hasFamilyPacks
        ? ` Custom Items(${invoice.additionalItems.length} Items)`
        : ` Custom Items(${invoice.additionalItems.length} Items)`;
    } else {
      addTitle = hasFamilyPacks
        ? ` Your Selected Items(${invoice.additionalItems.length} Items)`
        : ` Your Selected Items(${invoice.additionalItems.length} Items)`;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(addTitle, 15, yPosition);
    doc.text(
      `Rs. ${formatNumberWithCommas(additionalItemsTotalAmount.toFixed(2))}`,
      195,
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
      ...invoice.additionalItems.map((it, i) => {
        const unitPrice = parseFloat(it.unitPrice || '0');
        const itemDiscount = parseFloat(it.itemDiscount || '0');
        const quantity = parseFloat(
          it.quantity === '0.00' ? '1' : it.quantity || '1'
        );
        const amount = parseFloat(it.amount);
        const unitPriceDisplay = unitPrice;
        
        // Get unit for additional items from backend data
        const unit = it.unit || '';
        // Format quantity with unit
        const qtyWithUnit = unit ? `${quantity} ${unit}` : `${quantity}`;

        return [
          `${i + 1}.`,
          it.name || 'N/A',
          `Rs. ${formatNumberWithCommas(unitPriceDisplay.toFixed(2))}`,
          qtyWithUnit, // Updated: quantity with unit
          `Rs. ${formatNumberWithCommas(amount.toFixed(2))}`,
        ];
      }),
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

  // Grand Total Section
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

  // Handle family packages - show total if multiple, single package name if only one
  if (invoice.familyPackItems && invoice.familyPackItems.length > 0) {
    if (invoice.familyPackItems.length > 1) {
      // Calculate total for all packages
      const packagesTotal = invoice.familyPackItems.reduce(
        (total, pack) => total + parseNum(pack.amount),
        0
      );
      grandTotalBody.push([
        'Total for Packages',
        `Rs. ${formatNumberWithCommas(packagesTotal.toFixed(2))}`,
      ]);
    } else {
      // Only one package - show its name
      const pack = invoice.familyPackItems[0];
      grandTotalBody.push([
        pack.name || 'Family Pack',
        `Rs. ${formatNumberWithCommas(pack.amount)}`,
      ]);
    }
  }

  // Add additional items total if they exist
  if (invoice.additionalItems && invoice.additionalItems.length > 0) {
    const additionalItemsTotal = invoice.additionalItems.reduce(
      (total, item) => {
        return total + parseFloat(item.amount || '0');
      },
      0
    );

    const hasFamilyPacks =
      invoice.familyPackItems && invoice.familyPackItems.length > 0;

    // MODIFIED: Determine label based on orderApp
    let label: string;
    if (invoice.orderApp === 'Marketplace') {
      label = hasFamilyPacks ? 'Additional Items' : 'Your Selected Items';
    } else if (invoice.orderApp === 'Dash') {
      label = hasFamilyPacks ? 'Custom Items' : 'Custom Items';
    } else {
      label = hasFamilyPacks ? 'Additional Items' : 'Your Selected Items';
    }

    grandTotalBody.push([
      label,
      `Rs. ${formatNumberWithCommas(additionalItemsTotal.toFixed(2))}`,
    ]);
  }

  // Add delivery fee and discount
  if (invoice.deliveryMethod !== 'Pickup') {
    grandTotalBody.push([
      'Delivery Fee',
      `Rs. ${formatNumberWithCommas(invoice.deliveryFee)}`,
    ]);
  }

  grandTotalBody.push([
    'Discount',
    `Rs. ${formatNumberWithCommas(invoice.discount)}`,
  ]);

  // Add service fee between Discount and Coupon Discount
  if (invoice.orderApp !== 'Marketplace' && 
  invoice.additionalItems && 
  invoice.additionalItems.length > 0 && 
  (!invoice.familyPackItems || invoice.familyPackItems.length === 0)) {
    grandTotalBody.push(['Service Fee', 'Rs. 180.00']);
  }

  // Add coupon discount only if it has a value greater than 0
  const couponValue = parseNum(invoice.billingInfo.couponValue);
  if (couponValue > 0) {
    grandTotalBody.push([
      'Coupon Discount',
      `Rs. ${formatNumberWithCommas(invoice.billingInfo.couponValue)}`,
    ]);
  }

  // Calculate final grand total
  const familyPackTotal =
    invoice.familyPackItems?.reduce(
      (total, pack) => total + parseNum(pack.amount),
      0
    ) || 0;

  const additionalItemsTotalAmount =
    invoice.additionalItems?.reduce(
      (total, item) => total + parseFloat(item.amount || '0'),
      0
    ) || 0;

  const deliveryFeeTotal =
    invoice.deliveryMethod !== 'Pickup' ? parseNum(invoice.deliveryFee) : 0;

  // Update discount calculation to only include coupon if it exists
  const discountTotal =
    parseNum(invoice.discount) + (couponValue > 0 ? couponValue : 0);

  const serviceFee =
    invoice.orderApp !== 'Marketplace' && // Only add service fee if not Marketplace
    invoice.additionalItems &&
    invoice.additionalItems.length > 0 &&
    (!invoice.familyPackItems || invoice.familyPackItems.length === 0)
      ? 180
      : 0;

  const finalGrandTotal =
    familyPackTotal +
    additionalItemsTotalAmount +
    deliveryFeeTotal +
    serviceFee -
    discountTotal;

  // Add final total
  grandTotalBody.push([
    { content: 'Grand Total', styles: { fontStyle: 'bold' } },
    {
      content: `Rs. ${formatNumberWithCommas(finalGrandTotal.toFixed(2))}`,
      styles: { fontStyle: 'bold' },
    },
  ]);

  // Create the table
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
      cellPadding: { top: 4, right: 0, bottom: 4, left: 0 },
      lineColor: [255, 255, 255],
      lineWidth: 0,
    },
    bodyStyles: {
      lineWidth: 0,
    },
    didDrawCell: (data: any) => {
      // Add border between Grand Total and Discount (second last row)
      if (data.row.index === grandTotalBody.length - 2) {
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
  yPosition += 20;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic', 'bold');
  doc.text('Thank you for shopping with us!', 105, yPosition, {
    align: 'center',
  });

  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'WE WILL SEND YOU MORE OFFERS , LOWEST PRICED VEGGIES FROM US.',
    105,
    yPosition,
    { align: 'center' }
  );

  yPosition += 15;
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
      const logoBlob = (await this.http
        .get(logoPath, { responseType: 'blob' })
        .toPromise()) as Blob;

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const originalDataUrl = reader.result as string;

          // Create an image element to check dimensions
          const img = new Image();
          img.src = originalDataUrl;

          await img.decode(); // Wait for image to load

          // Create canvas to resize if needed
          const canvas = document.createElement('canvas');
          const maxWidth = 200; // Maximum width in pixels
          const maxHeight = 100; // Maximum height in pixels

          // Calculate new dimensions maintaining aspect ratio
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (maxWidth / width) * height;
            width = maxWidth;
          }

          if (height > maxHeight) {
            width = (maxHeight / height) * width;
            height = maxHeight;
          }

          // Only resize if necessary
          if (width !== img.width || height !== img.height) {
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);

            // Convert to PNG with reduced quality (0.9 maintains good quality)
            const optimizedDataUrl = canvas.toDataURL('image/png', 0.9);
            resolve(optimizedDataUrl);
          } else {
            // Use original if no resizing needed
            resolve(originalDataUrl);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }
}