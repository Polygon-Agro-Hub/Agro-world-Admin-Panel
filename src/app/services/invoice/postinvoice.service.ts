import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { environment } from '../../environment/environment';

interface InvoiceData {
  invoiceNumber: string;
  orderApp: string;
  deliveryMethod: string;
  invoiceDate: string;
  scheduledDate: string;
  paymentMethod: string;
  grandTotal: string;
  isPaid?: number | null;
  creditPaid?: string | number | null;
  moneyPaid?: string | number | null;
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

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getPostInvoiceDetails(processOrderId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(
      `${this.apiUrl}market-place/postinvoice/${processOrderId}`,
      { headers },
    );
  }

  async generateAndDownloadInvoice(
    processOrderId: number,
    tableInvoiceNo: string,
  ): Promise<void> {
    try {
      const response =
        await this.getPostInvoiceDetails(processOrderId).toPromise();
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
      const finalInvoiceNo = tableInvoiceNo || apiInvoiceNo || 'N/A';
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
        0,
      );

      const additionalItemsTotal = additionalItems.reduce(
        (sum: number, item: any) => sum + parseFloat(item.amount || '0'),
        0,
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
        isPaid: invoiceDetails.isPaid,
        creditPaid: invoiceDetails.creditPaid,
        moneyPaid: invoiceDetails.moneyPaid,
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
          phonecode1:
            billingDetails.phoneCode1 || invoiceDetails.phonecode1 || 'N/A',
          phone1: billingDetails.phone1 || invoiceDetails.phone1 || 'N/A',
          userEmail: invoiceDetails.userEmail || 'N/A',
          buildingNo: invoiceDetails.buildingNo || '',
          buildingName: invoiceDetails.buildingName || '',
          unitNo: invoiceDetails.unitNo || '',
          floorNo: invoiceDetails.floorNo || '',
          couponValue: billingDetails.couponValue || '0.00',
        },
        pickupInfo: pickupCenter
          ? {
              centerName: pickupCenter.centerName || 'N/A',
              address: {
                city: pickupCenter.city || '',
                district: pickupCenter.district || '',
                province: pickupCenter.province || '',
                country: pickupCenter.country || '',
              },
            }
          : undefined,
        familyPackTotal: familyPackTotal.toFixed(2),
        additionalItemsTotal: additionalItemsTotal.toFixed(2),
      };
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
        doc.addImage(logoUrl, 'PNG', 140, 20, 56, 25);
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
    doc.text('No. 42/46, Nawam Mawatha, Colombo 02.', 15, 30);
    doc.text('Contact No: +94 770 111 999', 15, 35);
    doc.text('Email Address: info@polygon.lk', 15, 40);

    // Bill To section
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill To:', 15, 55);
    doc.setFont('helvetica', 'normal');

    const billingName = `${
      invoice.billingInfo?.title ? `${invoice.billingInfo.title}. ` : ''
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

    // Right side details - fixed anchor
    const rightYStart = 55;

    // Capture where the address section would start (title line).
    // Payment Method aligns to this ONLY when an address block will be
    // rendered (non-Pickup). For Pickup, there's no address section to
    // align to, so it stays close to Grand Total instead, and the LEFT
    // column gets extra spacing so Invoice No / Ordered Date (which
    // share the same Y) don't collide with it.
    let paymentMethodLabelY: number;
    let paymentMethodValueY: number;

    if (invoice.deliveryMethod?.toLowerCase() !== 'pickup') {
      yPosition += 3;
      paymentMethodLabelY = yPosition;
      paymentMethodValueY = yPosition + 5;

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
          const colonIndex = line.indexOf(':');
          const label = line.substring(0, colonIndex + 1);
          const value = line.substring(colonIndex + 1);

          doc.setTextColor(146, 146, 146); // #929292 in RGB
          doc.text(label, 15, yPosition);

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
          const colonIndex = line.indexOf(':');
          const label = line.substring(0, colonIndex + 1);
          const value = line.substring(colonIndex + 1);

          doc.setTextColor(146, 146, 146);
          doc.text(label, 15, yPosition);

          const labelWidth = doc.getTextWidth(label);
          doc.setTextColor(0, 0, 0);
          doc.text(value, 15 + labelWidth, yPosition);

          yPosition += 5;
        });
      }

      yPosition += 5;
    } else {
      // Pickup: no address block, so Payment Method keeps a fixed
      // small gap under Grand Total, matching the reference image.
      paymentMethodLabelY = rightYStart + 15; // 70
      paymentMethodValueY = rightYStart + 20; // 75

      // Extra spacing on the LEFT column so Invoice No / Ordered Date
      // (which share the same Y) land safely below the Payment Method
      // value on the right, instead of nearly touching it.
      yPosition += 15;
    }

    yPosition += 3;

    // Invoice Details
    const invoiceNoY = yPosition;
    doc.setFont('helvetica', 'bold');
    doc.text('Invoice No:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.invoiceNumber || 'N/A', 15, yPosition + 5);
    yPosition += 10;

    yPosition += 3;

   const deliveryMethodY = yPosition;
    doc.setFont('helvetica', 'bold');
    doc.text('Delivery Method:', 15, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(
      invoice.deliveryMethod === 'Pickup' ? 'Instore Pickup' : 'Home Delivery',
      15,
      yPosition + 5,
    );
    yPosition += 10;

    if (
      invoice.deliveryMethod?.toLowerCase() === 'pickup' &&
      invoice.pickupInfo
    ) {
      // Add space before Pickup Center
      yPosition += 5;

      doc.setFont('helvetica', 'bold');
      const pickupLabel = 'Centre :';
      doc.text(pickupLabel, 15, yPosition);

      // Calculate position for center name with small space
      const centerName = invoice.pickupInfo.centerName || '';
      const spaceWidth = 2; // Small space in mm
      const centerNameX = 15 + doc.getTextWidth(pickupLabel) + spaceWidth;

      doc.setFont('helvetica', 'bold');
      doc.text(centerName, centerNameX, yPosition);

      let addressY = yPosition + 5;

      const addressLines: Array<{ label: string; value: string }> = [];

      if (invoice.pickupInfo.address?.city) {
        addressLines.push({
          label: 'City :',
          value: invoice.pickupInfo.address.city,
        });
      }
      if (invoice.pickupInfo.address?.district) {
        addressLines.push({
          label: 'District :',
          value: invoice.pickupInfo.address.district,
        });
      }
      if (invoice.pickupInfo.address?.province) {
        addressLines.push({
          label: 'Province :',
          value: invoice.pickupInfo.address.province,
        });
      }

      addressLines.forEach(({ label, value }) => {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(146, 146, 146); // #929292
        doc.text(label, 15, addressY);

        const labelWidth = doc.getTextWidth(label);
        doc.setTextColor(0, 0, 0);
        doc.text(value, 15 + labelWidth + spaceWidth, addressY);

        addressY += 5;
      });

      // Reset to black for anything rendered after this block
      doc.setTextColor(0, 0, 0);

      yPosition = addressY + 10;
    }

    // Add extra space here between Delivery Method and Package Title
    yPosition += 10;

    // Right side details - render Grand Total, Payment Method, Ordered
    // Date, and Scheduled Date using the Y positions captured above.
    doc.setFont('helvetica', 'bold');
    doc.text('Grand Total:', 140, rightYStart);
    doc.setFontSize(11);
    doc.text(
      `Rs. ${formatNumberWithCommas(invoice.grandTotal)}`,
      140,
      rightYStart + 5,
    );
    doc.setFontSize(9);

    const creditPaidAmount = parseNum(String(invoice.creditPaid ?? ""));
    const grandTotalAmount = parseNum(invoice.grandTotal);
    const paymentTypeLabel =
      this.detectPaymentType(
        invoice.paymentMethod,
        invoice.deliveryMethod,
        creditPaidAmount,
        grandTotalAmount,
      ) || "N/A";

    doc.setFont('helvetica', 'bold');
    doc.text('Payment Method:', 140, paymentMethodLabelY);
    doc.setFont('helvetica', 'normal');
    doc.text(paymentTypeLabel, 140, paymentMethodValueY);

    // Always aligns with Invoice No: / Delivery Method: on the left
    doc.setFont('helvetica', 'bold');
    doc.text('Ordered Date:', 140, invoiceNoY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.invoiceDate), 140, invoiceNoY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Scheduled Date:', 140, deliveryMethodY);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(invoice.scheduledDate), 140, deliveryMethodY + 5);

    // Family Pack Items - UPDATED SECTION with units in QTY
    if (invoice.familyPackItems && invoice.familyPackItems.length > 0) {
      for (const pack of invoice.familyPackItems) {
        const estimatedPackHeight = 15 + (pack.packageDetails?.length || 0) * 8;

        if (yPosition + estimatedPackHeight > 250) {
          doc.addPage();
          yPosition = 20;
        }

        const packItemCount = pack.packageDetails?.length || 0;
        const formattedPackItemCount = String(packItemCount).padStart(2, '0');

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${pack.name || 'N/A'} (${formattedPackItemCount} Items)`,
          15,
          yPosition,
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
            const qtyWithUnit = `${detail.qty || '0'}\u00A0Kg`;

            return [
              `${i + 1}.`,
              detail.typeName || 'N/A',
              detail.productName || 'N/A',
              `Rs. ${formatNumberWithCommas((detail.price || 0).toFixed(2))}`,
              qtyWithUnit,
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
            cellPadding: { top: 3, right: 4, bottom: 3, left: 4 },
            textColor: [0, 0, 0],
            overflow: 'linebreak',
            valign: 'middle',
          },
          headStyles: {
            fillColor: [248, 248, 248],
            textColor: [0, 0, 0],
            fontStyle: 'bold',
          },
          bodyStyles: {
            textColor: [0, 0, 0],
          },
          alternateRowStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
          },
          tableLineColor: [209, 213, 219],
          tableLineWidth: 0.5,
          showHorizontalLines: false,
          showVerticalLines: false,
          columnStyles: {
            0: { cellWidth: 16, halign: 'left' }, // Index
            1: { cellWidth: 36, overflow: 'linebreak' }, // Category
            2: { cellWidth: 42, overflow: 'linebreak' }, // Item Description
            3: { cellWidth: 31, halign: 'left' }, // Unit Price
            4: { cellWidth: 20, overflow: 'visible', halign: 'left' }, // QTY
            5: { cellWidth: 35, halign: 'left' }, // Amount
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
          return total + parseFloat(item.normalPrice || '0');
        },
        0,
      );

      const hasFamilyPacks =
        invoice.familyPackItems && invoice.familyPackItems.length > 0;

      const itemCount = invoice.additionalItems.length;
      const formattedCount = String(itemCount).padStart(2, '0');
      const itemLabel = itemCount === 1 ? 'Item' : 'Items';

      let addTitle;
      if (invoice.orderApp === 'Marketplace') {
        addTitle = hasFamilyPacks
          ? ` Additional Items  (${formattedCount} ${itemLabel})`
          : ` Your Selected Items (${formattedCount} ${itemLabel})`;
      } else if (invoice.orderApp === 'Dash') {
        addTitle = hasFamilyPacks
          ? ` Additional Items  (${formattedCount} ${itemLabel})`
          : ` Custom Items (${formattedCount} ${itemLabel})`;
      } else {
        addTitle = hasFamilyPacks
          ? ` Custom Items (${formattedCount} ${itemLabel})`
          : ` Custom Items (${formattedCount} ${itemLabel})`;
      }

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(addTitle, 15, yPosition);
      doc.text(
        `Rs. ${formatNumberWithCommas(additionalItemsTotalAmount.toFixed(2))}`,
        195,
        yPosition,
        { align: 'right' },
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
            it.quantity === '0.00' ? '1' : it.quantity || '1',
          );
          const normalPrice = parseFloat(it.normalPrice);
          const unitPriceDisplay = unitPrice;

          // Get unit for additional items from backend data
          const unit = it.unit || '';
          // Format quantity with unit
          const qtyWithUnit = unit ? `${quantity}\u00A0${unit}` : `${quantity}`;

          return [
            `${i + 1}.`,
            it.name || 'N/A',
            `Rs. ${formatNumberWithCommas(unitPriceDisplay.toFixed(2))}`,
            qtyWithUnit, // Updated: quantity with unit
            `Rs. ${formatNumberWithCommas(normalPrice.toFixed(2))}`,
          ];
        }),
      ];

      (doc as any).autoTable({
        startY: yPosition,
        head: [additionalItemsBody[0]],
        body: additionalItemsBody.slice(1),
        margin: { left: 15, right: 15 },
        columnStyles: {
          3: { overflow: 'visible' },
        },
        styles: {
          fontSize: 9,
          cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
          textColor: [0, 0, 0],
        },
        headStyles: {
          fillColor: [243, 244, 246],
          textColor: [0, 0, 0],
          fontStyle: 'bold',
        },

        bodyStyles: {
          textColor: [0, 0, 0],
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
          0,
        );
        grandTotalBody.push([
          'Total Price for Packages',
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
          return total + parseFloat(item.normalPrice || '0');
        },
        0,
      );

      const hasFamilyPacks =
        invoice.familyPackItems && invoice.familyPackItems.length > 0;

      // MODIFIED: Determine label based on orderApp
      let label: string;
      if (invoice.orderApp === 'Marketplace') {
        label = hasFamilyPacks ? 'Additional Items' : 'Your Selected Items';
      } else if (invoice.orderApp === 'Dash') {
        label = hasFamilyPacks ? 'Additional Items' : 'Custom Items';
      } else {
        label = hasFamilyPacks ? 'Custom Items' : 'Custom Items';
      }

      grandTotalBody.push([
        label,
        `Rs. ${formatNumberWithCommas(additionalItemsTotal.toFixed(2))}`,
      ]);
    }

    // Add delivery fee and discount
    const deliveryFeeValue = parseNum(invoice.deliveryFee);
    if (invoice.deliveryMethod !== 'Pickup' && deliveryFeeValue > 0) {
      grandTotalBody.push([
        'Delivery Fee',
        `Rs. ${formatNumberWithCommas(invoice.deliveryFee)}`,
      ]);
    }

    const discountValue = parseNum(invoice.discount);
    if (discountValue > 0) {
      grandTotalBody.push([
        'Discount',
        `Rs. ${formatNumberWithCommas(invoice.discount)}`,
      ]);
    }

    // Add service fee between Discount and Coupon Discount
    if (
      invoice.orderApp !== 'Marketplace' &&
      invoice.additionalItems &&
      invoice.additionalItems.length > 0 &&
      (!invoice.familyPackItems || invoice.familyPackItems.length === 0)
    ) {
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
        0,
      ) || 0;

    const additionalItemsTotalAmount =
      invoice.additionalItems?.reduce(
        (total, item) => total + parseFloat(item.amount || '0'),
        0,
      ) || 0;

    const deliveryFeeTotal =
      invoice.deliveryMethod !== 'Pickup' ? parseNum(invoice.deliveryFee) : 0;

    const serviceFee =
      invoice.orderApp !== 'Marketplace' &&
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
      couponValue;

    // Add final total
    grandTotalBody.push([
      {
        content: 'Grand Total',
        styles: { fontStyle: 'bold', textColor: [0, 0, 0] },
      },
      {
        content: `Rs. ${formatNumberWithCommas(finalGrandTotal.toFixed(2))}`,
        styles: { fontStyle: 'bold', textColor: [0, 0, 0] },
      },
    ]);

    const borderRowIndex = grandTotalBody.length - 2;

    const GREEN_COLOR: [number, number, number] = [22, 163, 74];
    const ORANGE_COLOR: [number, number, number] = [217, 119, 6];

    const isPaid = Number(invoice.isPaid) === 1;
    const isCardPayment = invoice.paymentMethod === 'Card'; // <-- new check
    const creditPaidNum = parseNum(invoice.creditPaid as any);
    const hasCreditPaid =
      invoice.creditPaid !== null &&
      invoice.creditPaid !== undefined &&
      creditPaidNum > 0;
    const remainingAfterCredit = finalGrandTotal - creditPaidNum;

    const isPickup = invoice.deliveryMethod?.toLowerCase() === 'pickup';
    const cashLabel = isPickup ? 'Cash On Pickup' : 'Cash On Delivery';
    let showDeliveryNote = false;

    const pushPaymentRow = (
      label: string,
      amount: number,
      color: [number, number, number],
    ) => {
      grandTotalBody.push([
        { content: label, styles: { fontStyle: 'bold', textColor: color } },
        {
          content: `Rs. ${formatNumberWithCommas(amount.toFixed(2))}`,
          styles: { fontStyle: 'bold', textColor: color },
        },
      ]);
    };

    if (hasCreditPaid) {
      pushPaymentRow('Credit Balance Used', creditPaidNum, GREEN_COLOR);

      if (remainingAfterCredit > 0.01) {
        if (isPaid) {
          if (isCardPayment) {
            pushPaymentRow(
            'Online Transferred Amount',
            remainingAfterCredit,
            GREEN_COLOR,
          );
        } else {
          pushPaymentRow(cashLabel, remainingAfterCredit, ORANGE_COLOR);
        }
      } else if (isPickup) {
        pushPaymentRow(
          'Cash On Pickup',
          remainingAfterCredit,
          ORANGE_COLOR,
        );
      } else {
        pushPaymentRow(
          'Cash On Delivery',
          remainingAfterCredit,
          ORANGE_COLOR,
        );
      showDeliveryNote = true;
    }
  }
    } else {
      if (isPaid) {
        if (isCardPayment) {
          pushPaymentRow(
            'Online Transferred Amount',
            finalGrandTotal,
            GREEN_COLOR,
          );
        } else {
          pushPaymentRow(cashLabel, finalGrandTotal, ORANGE_COLOR);
        } 
      } else if (isPickup) {
        pushPaymentRow(
          'Cash On Pickup',
          finalGrandTotal,
          ORANGE_COLOR,
        );
      } else {
        pushPaymentRow(
          'Cash On Delivery',
          finalGrandTotal,
          ORANGE_COLOR,
        );
        showDeliveryNote = true;
      }
    }

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
        cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
        lineWidth: 0,
      },
      bodyStyles: {
        lineWidth: 0,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      didDrawCell: (data: any) => {
        if (data.row.index === borderRowIndex) {
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(0.5);
          doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + data.cell.width,
            data.cell.y + data.cell.height,
          );
        }
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 2;

    if (showDeliveryNote) {
      const noteText =
        'The delivery charges might be different on the day of delivery. Your Grand Total might be changed then.';

      const iconX = 16;
      const iconRadius = 1.6;
      const textX = iconX + iconRadius + 2.5; 

      const iconY = yPosition - 1;

      // Draw filled circle (info icon background)
      doc.setDrawColor(80, 80, 80);
      doc.setFillColor(30, 30, 30);
      doc.circle(iconX, iconY, iconRadius, 'F');

      // Draw the "i" inside the circle
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('i', iconX, iconY + 0.9, { align: 'center' });

      // Draw the note text next to the icon
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(90, 90, 90);
      doc.text(noteText, textX, yPosition);

      doc.setTextColor(0, 0, 0);
      yPosition += 6;
    }

    yPosition += 4;

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
      { align: 'center' },
    );

    yPosition += 15;
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(
      '- THIS IS A COMPUTER GENERATED INVOICE, THUS NO SIGNATURE REQUIRED -',
      105,
      yPosition,
      { align: 'center' },
    );

    yPosition += 5;

    const now = new Date();
    const generatedTime = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Colombo',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const generatedDate = now.toLocaleDateString('en-US', {
      timeZone: 'Asia/Colombo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    doc.text(
      `- GENERATED AT : ${generatedTime}, ${generatedDate} -`,
      105,
      yPosition,
      { align: 'center' },
    );

    // Save the PDF
    doc.save(`Post_Invoice_${invoice.invoiceNumber || 'unknown'}.pdf`);
  }

  private async getLogoUrl(): Promise<string | null> {
    try {
      const logoPath = 'assets/images/POLYGON_LOGO_NEW.png';
      const logoBlob = (await this.http
        .get(logoPath, { responseType: 'blob' })
        .toPromise()) as Blob;

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          const originalDataUrl = reader.result as string;

          const img = new Image();
          img.src = originalDataUrl;
          await img.decode();

          const targetWidth = 780;
          const targetHeight = 240;

          let width = img.width;
          let height = img.height;

          const needsResize = width > targetWidth || height > targetHeight;

          if (needsResize) {
            const widthRatio = targetWidth / width;
            const heightRatio = targetHeight / height;
            const scale = Math.min(widthRatio, heightRatio);

            width = Math.round(width * scale);
            height = Math.round(height * scale);

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            if (ctx) {
              ctx.imageSmoothingEnabled = true;
              ctx.imageSmoothingQuality = 'high';
              ctx.drawImage(img, 0, 0, width, height);
 
              const optimizedDataUrl = canvas.toDataURL('image/png');
              resolve(optimizedDataUrl);
              return;
            }
          }

          resolve(originalDataUrl);
        };
        reader.onerror = reject;
        reader.readAsDataURL(logoBlob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
      return null;
    }
  }

  private detectPaymentType(
    payType: string,
    deliveryMethod: string,
    creditPaid: number,
    grandTotal: number,
  ): string {
    const isPickup = deliveryMethod?.toLowerCase().includes("pickup");
    const hasCredit = creditPaid > 0;
    const fullyCoveredByCredit = hasCredit && creditPaid >= grandTotal - 0.01;

    if (fullyCoveredByCredit) {
      return "Credit Balance";
    }

    if (payType === "Card") {
      return hasCredit ? "Online Transfer + Credit Balance" : "Online Transfer";
    }

  // Cash
    const base = isPickup ? "Cash on Pickup" : "Cash on Delivery";
    return hasCredit ? `${base} + Credit Balance` : base;
  }
}
