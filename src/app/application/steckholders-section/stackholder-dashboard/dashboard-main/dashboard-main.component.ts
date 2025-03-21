import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { AdminRowComponent } from '../admin-row/admin-row.component';
import { CollectionOfficerUsersRowComponent } from '../collection-officer-users-row/collection-officer-users-row.component';
import { PlantcareUsersRowComponent } from '../plantcare-users-row/plantcare-users-row.component'
import { SalesAgentsRowComponent } from '../sales-agents-row/sales-agents-row.component';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";
import { jsPDF } from 'jspdf';


@Component({
  selector: "app-dashboard-main",
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    AdminRowComponent,
    CollectionOfficerUsersRowComponent,
    PlantcareUsersRowComponent,
    SalesAgentsRowComponent,
    LoadingSpinnerComponent
],
  templateUrl: "./dashboard-main.component.html",
  styleUrl: "./dashboard-main.component.css",
})
export class DashboardMainComponent implements OnInit {
  
  firstRow: any = {};
  secondRow: any = {};
  thirdRow: any = {};
  fourthRow: any = {};
  isLoading = false;

  // Variables to store the emitted data from AdminRowComponent
  adminRowData: any = {};
  collectionOfficerRowData: any = {};
  salesAgentRowData: any = {};
  plantCareRowData: any = {};

  
  constructor(
    private stakeholderSrv: StakeholderService
  ) { }

  ngOnInit(): void {
    this.fetchAdminUserData();
  }


  fetchAdminUserData() {
    this.isLoading = true;
    console.log("fetching started");
    this.stakeholderSrv.getAdminUserData().subscribe(
      (res) => {
        console.log('Admin ->', res);
        this.firstRow = res.firstRow;
        this.secondRow = res.secondRow;
        this.thirdRow = res.thirdRow;
        this.fourthRow = res.fourthRow;
        console.log('logiing', this.firstRow, this.secondRow, this.thirdRow, this.fourthRow);
        // console.log("---------------",this.secondRow);
        this.isLoading = false;
      },
      (error) => {
        console.log("Error: ", error);
        this.isLoading = false;
      }
    );
  }

  onAdminDataEmitted(data: any) {
    this.adminRowData = data;
    console.log('Admin Row Data Received:', this.adminRowData);
  }

  onsPlantCareDataEmitted(data: any) {
    this.plantCareRowData = data;
    console.log('Plant Care Row Data Received:', this.plantCareRowData);
  }

  onCollectionOfficerDataEmitted(data: any) {
    this.collectionOfficerRowData = data;
    console.log('Collection Officer Row Data Received:', this.collectionOfficerRowData);
  }

  onsalesAgentDataEmitted(data: any) {
    this.salesAgentRowData = data;
    console.log('Sales Agent Row Data Received:', this.salesAgentRowData);
  }

  exportReport(): void {
    const doc = new jsPDF();
  
    // Set font for the title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Dashboard Report', 10, 15);
  
    // Colors used in the boxes
    const colors = {
      blue: '#007bff',
      orange: '#ff7f00',
      teal: '#17a2b8',
      purple: '#6f42c1',
      white: '#ffffff',
      black: '#000000',
      stark: '#FFF4CE',
      background: '#f5f5f5', 
    };
  
    doc.setFillColor(colors.background);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Full-page background
  
    // Function to draw a box with centered text and optional icon
    const drawBox = (
      x: number,
      y: number,
      width: number,
      height: number,
      backgroundColor: string,
      textColor: string,
      label: string,
      value: string,
      // includeIcon: boolean = false
    ) => {
      // Draw box
      doc.setFillColor(backgroundColor);
      doc.rect(x, y, width, height, 'F'); // Filled rectangle
      
      // Calculate center positions
      const centerX = x + width / 2;
      
      // Add icon if requested (for first box in each row)
      doc.setTextColor(textColor);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        // Center the text horizontally
        const labelWidth = doc.getStringUnitWidth(label) * 10 / doc.internal.scaleFactor;
        doc.text(label, centerX - (labelWidth / 2), y + height * 0.4);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        // Center the value text horizontally
        const valueWidth = doc.getStringUnitWidth(value) * 12 / doc.internal.scaleFactor;
        doc.text(value, centerX - (valueWidth / 2), y + height * 0.65);
    };
  
    const pageWidth = 210; // A4 page width in mm
    const horizontalPadding = 10; // Padding on both sides
    const boxCount = 5; // Number of boxes in a row
    const spaceBetweenBoxes = 5; // Space between each box
    const verticalSpacing = 10; // Space between rows
  
    // Box dimensions
    const totalSpace = pageWidth - 2 * horizontalPadding - (boxCount - 1) * spaceBetweenBoxes;
    const boxWidth = totalSpace / boxCount;
    const baseBoxHeight = 35; // Slightly increased height for all boxes
    const halfBoxHeight = baseBoxHeight / 2 - 2; // Half height for divided boxes with small gap
    const secondRowBoxHeight = 45; // Custom height for second row boxes
    const halfSecondRowBoxHeight = secondRowBoxHeight / 2 - 2; // Half height for divided boxes in second row
  
    // Base Y-coordinate for the first row
    const baseY = 25;
  
    // Function to calculate X and Y coordinates for a specific box
    const getX = (index: number) => horizontalPadding + index * (boxWidth + spaceBetweenBoxes);
    const getY = (row: number) => baseY + row * (baseBoxHeight + verticalSpacing);
  
    // Row 1 (Standard Height)
    drawBox(getX(0), getY(0), boxWidth, baseBoxHeight, colors.blue, colors.white, 'Admin Users', `Total: ${this.adminRowData.allAdminUsers}`);
    drawBox(getX(1), getY(0), boxWidth, baseBoxHeight, colors.white, colors.black, 'Active Admins', `Total: ${this.adminRowData.allAdminUsers}`);
    drawBox(getX(2), getY(0), boxWidth, baseBoxHeight, colors.white, colors.black, 'New Admins', `Total: ${this.adminRowData.newAdminUsers}`);
  
    // Split 4th box into two horizontally
    drawBox(getX(3), getY(0), boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Associate', `${this.adminRowData.associateAdmins}`);
    drawBox(getX(3), getY(0) + halfBoxHeight + 4, boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Officers', `${this.adminRowData.officerAdmins}`);
  
    // Split 5th box into two horizontally
    drawBox(getX(4), getY(0), boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Executives', `${this.adminRowData.executiveAdmins}`);
    drawBox(getX(4), getY(0) + halfBoxHeight + 4, boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Manager', `${this.adminRowData.managerAdmins}`);
  
    // Row 2 (Increased Height)
    drawBox(getX(0), getY(1), boxWidth, secondRowBoxHeight, colors.orange, colors.black, 'Plant Care Users', `Total: ${this.plantCareRowData.allPlantCareUsers}`);
    drawBox(getX(1), getY(1), boxWidth, secondRowBoxHeight, colors.white, colors.black, 'Active Users', `Just Now: ${this.plantCareRowData.activePlantCareUsers}`);
    drawBox(getX(2), getY(1), boxWidth, secondRowBoxHeight, colors.white, colors.black, 'Active Users', `Today: ${this.plantCareRowData.newPlantCareUsers}`);
  
    // Split 4th box in 2nd row into two horizontally
    drawBox(getX(3), getY(1), boxWidth, halfSecondRowBoxHeight, colors.white, colors.black, 'Qr Registered Users', `${this.plantCareRowData.plantCareUsersWithQrForOutput}`);
    drawBox(getX(3), getY(1) + halfSecondRowBoxHeight + 4, boxWidth, halfSecondRowBoxHeight, colors.white, colors.black, 'Unregistered Users', `${this.plantCareRowData.plantCareUsersWithOutQrForOutput}`);
  
    drawBox(getX(4), getY(1), boxWidth, secondRowBoxHeight, colors.white, colors.black, 'New Admins', 'Today: 0');
  
    // Row 3 adjustment for the increased height of row 2
    const row3YAdjustment = getY(2) + (secondRowBoxHeight - baseBoxHeight);
  
    // Row 3 (Standard Height)
    drawBox(getX(0), row3YAdjustment, boxWidth, baseBoxHeight, colors.teal, colors.black, 'Collection Officers', `Total: ${this.collectionOfficerRowData.allOfficers}`);
    drawBox(getX(1), row3YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'Active Officers', `Just Now: ${this.collectionOfficerRowData.activeOfficers}`);
    drawBox(getX(2), row3YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'New Officers', `Today: ${this.collectionOfficerRowData.newOfficers}`);
  
    // Split 4th box in 3rd row into two horizontally
    drawBox(getX(3), row3YAdjustment, boxWidth, halfBoxHeight, colors.white, colors.black, 'Center Head Officers', `${this.collectionOfficerRowData.centerHeadOfficers}`);
    drawBox(getX(3), row3YAdjustment + halfBoxHeight + 4, boxWidth, halfBoxHeight, colors.white, colors.black, 'Center Managers', `${this.collectionOfficerRowData.centerManagers}`);
  
    // Split 5th box in 3rd row into two horizontally
    drawBox(getX(4), row3YAdjustment, boxWidth, halfBoxHeight, colors.white, colors.black, 'Collection Officers', `${this.collectionOfficerRowData.collectionOfficers}`);
    drawBox(getX(4), row3YAdjustment + halfBoxHeight + 4, boxWidth, halfBoxHeight, colors.white, colors.black, 'Customer Officers', `${this.collectionOfficerRowData.customerOfficers}`);
  
    // Row 4 adjustment for the increased height of row 2
    const row4YAdjustment = getY(3) + (secondRowBoxHeight - baseBoxHeight);
  
    // Row 4 (Standard Height)
    drawBox(getX(0), row4YAdjustment, boxWidth, baseBoxHeight, colors.purple, colors.black, 'Center Head Officers', '7');
    drawBox(getX(1), row4YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'Collection Officers', '10');
    drawBox(getX(2), row4YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'Center Managers', '9');
    drawBox(getX(3), row4YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'Customer Officers', '1');
    drawBox(getX(4), row4YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'Customer Officers', '1');
     
    // Save the PDF
    doc.save('dashboard-report.pdf');
  }
  
  

  // exportReport(): void {
  //   const doc = new jsPDF();

  //   // const QRpresentage = this.plantCareRowData.QRpresentageForOutput
  //   // const nonQRpresentage = this.plantCareRowData.nonQRpresentageForOutput

  //   doc.setFontSize(14);

  //   doc.text('Dashboard Report', 10, 10);

  //   doc.setFontSize(12);
    
  
    
  
  //   // // Save the PDF
  //   doc.save('qr-registration-chart.pdf');

  // }

  // exportReport() {
  //   const doc = new jsPDF();

  //   // Add content to the PDF
  //   doc.setFontSize(18);
  //   doc.text('Dashboard Report', 10, 10);

  //   doc.setFontSize(12);
  //   doc.text('Admin Data:', 10, 20);
  //   doc.text(`Active Users: ${this.adminRowData.allAdminUsers
  //   }`, 10, 30);
  //   doc.text(`New Admins Today: ${this.adminRowData.newAdminUsers}`, 10, 40);

  //   doc.text('Collection Officer Data:', 10, 50);
  //   doc.text(`Total Officers: ${this.collectionOfficerRowData.allOfficers}`, 10, 60);
  //   doc.text(`Active Officers: ${this.collectionOfficerRowData.activeOfficers}`, 10, 70);

  //   doc.text('Plant Care Data:', 10, 80);
  //   doc.text(`Total Managers: ${this.plantCareRowData.centerHeadOfficers}`, 10, 90);
  //   doc.text(`Center Managers: ${this.plantCareRowData.centerManagers}`, 10, 100);

  //   doc.text('Sales Agent Data:', 10, 110);
  //   doc.text(`QR Percentage: ${this.salesAgentRowData.QRpresentageForOutput}%`, 10, 120);
  //   doc.text(`Non-QR Percentage: ${this.salesAgentRowData.nonQRpresentageForOutput}%`, 10, 130);

  //   // Add a simple bar chart
  //   const qrPercentage = parseFloat(this.salesAgentRowData.RpresentageForOutput);
  //   const nonQRPercentage = parseFloat(this.salesAgentRowData.nonQRpresentageForOutput);

  //   const chartWidth = 100;
  //   const chartHeight = 50;
  //   const chartX = 10;
  //   const chartY = 140;

  //   doc.setFillColor('#008080');
  //   doc.rect(chartX, chartY, chartWidth * (qrPercentage / 100), chartHeight, 'F');
  //   doc.setFillColor('#76B7B2');
  //   doc.rect(chartX + chartWidth * (qrPercentage / 100), chartY, chartWidth * (nonQRPercentage / 100), chartHeight, 'F');

  //   doc.text('QR Registered', chartX, chartY + chartHeight + 10);
  //   doc.text('Non-QR Registered', chartX + chartWidth * (qrPercentage / 100), chartY + chartHeight + 10);

  //   // Save the PDF
  //   doc.save('dashboard_report.pdf');
  // }
}



// // Set up the PDF document
    // doc.setFontSize(16);
    // doc.text('QR Registration', 10, 20);
  
    // // Draw the chart bars
    // const barWidth = 40;
    // const barHeight = 100;
    // const startX = 20;
    // const startY = 30;
  
    // // Draw the Registered bar
    // doc.setFillColor(0, 128, 128); // Teal color
    // doc.rect(startX, startY, barWidth, (barHeight * QRpresentage) / 100, 'F');
  
    // // Draw the Unregistered bar
    // doc.setFillColor(118, 183, 178); // Light teal color
    // doc.rect(startX + barWidth + 10, startY, barWidth, (barHeight * nonQRpresentage) / 100, 'F');
  
    // // Add labels
    // doc.setFontSize(12);
    // doc.text('Registered', startX, startY + barHeight + 10);
    // doc.text('Unregistered', startX + barWidth + 10, startY + barHeight + 10);
  
    // // Add percentages
    // doc.text(`${QRpresentage}%`, startX + 10, startY - 5);
    // doc.text(`${nonQRpresentage}%`, startX + barWidth + 20, startY - 5);

// doc.text(`Active Users: ${this.adminRowData.allAdminUsers}`, 20, 20);
    // doc.text(`New Admins Today: ${this.adminRowData.newAdminUsers}`, 60, 20);