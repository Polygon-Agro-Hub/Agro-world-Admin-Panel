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

  isDownloading: boolean = false;

  
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

    this.isDownloading = true;
    console.log(this.isDownloading);

    const doc = new jsPDF();
  
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
  
    // Set background first, so it doesn't cover text
    doc.setFillColor(colors.background);
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F'); // Full-page background
  
    // Set font for the main title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.black); // Ensure text color is set
    doc.text('Stakeholder Dashboard Report', 10, 15);
    
  
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
      // Draw box with rounded corners
      doc.setFillColor(backgroundColor);
      const cornerRadius = 2; // Adjust the corner radius as needed
      doc.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'F'); // Filled rectangle with rounded corners
      
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
        doc.text(value, centerX - (valueWidth / 2), y + height * 0.75); 
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
  
    // Base Y-coordinate for the first row - adjusted to accommodate the Stakeholder Report text
    const baseY = 25; 
  
    // Function to calculate X and Y coordinates for a specific box
    const getX = (index: number) => horizontalPadding + index * (boxWidth + spaceBetweenBoxes);
    const getY = (row: number) => baseY + row * (baseBoxHeight + verticalSpacing);
  
    // Row 1 (Standard Height)
    drawBox(getX(0), getY(0), boxWidth, baseBoxHeight, colors.blue, colors.white, 'Admin Users', `Total: ${this.adminRowData.allAdminUsers}`);
    drawBox(getX(1), getY(0), boxWidth, baseBoxHeight, colors.white, colors.black, 'Active Admins', `Just Now: ${this.adminRowData.allAdminUsers}`);
    drawBox(getX(2), getY(0), boxWidth, baseBoxHeight, colors.white, colors.black, 'New Admins', `Total: ${this.adminRowData.newAdminUsers}`);
  
    // Split 4th box into two horizontally
    drawBox(getX(3), getY(0), boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Associate', `${this.adminRowData.associateAdmins}`);
    drawBox(getX(3), getY(0) + halfBoxHeight + 4, boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Officers', `${this.adminRowData.officerAdmins}`);
  
    // Split 5th box into two horizontally
    drawBox(getX(4), getY(0), boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Executives', `${this.adminRowData.executiveAdmins}`);
    drawBox(getX(4), getY(0) + halfBoxHeight + 4, boxWidth, halfBoxHeight, colors.white, colors.black, 'Total Manager', `${this.adminRowData.managerAdmins}`);
  
    // Row 2 (Increased Height)
    drawBox(getX(0), getY(1), boxWidth, secondRowBoxHeight, colors.orange, colors.white, 'Plant Care Users', `Total: ${this.plantCareRowData.allPlantCareUsers}`);
    drawBox(getX(1), getY(1), boxWidth, secondRowBoxHeight, colors.white, colors.black, 'Active Users', `Just Now: ${this.plantCareRowData.activePlantCareUsers}`);
    drawBox(getX(2), getY(1), boxWidth, secondRowBoxHeight, colors.white, colors.black, 'Active Users', `Today: ${this.plantCareRowData.newPlantCareUsers}`);
  
    // Split 4th box in 2nd row into two horizontally
    drawBox(getX(3), getY(1), boxWidth, halfSecondRowBoxHeight, colors.white, colors.black, 'Qr Registered Users', `${this.plantCareRowData.plantCareUsersWithQrForOutput}`);
    drawBox(getX(3), getY(1) + halfSecondRowBoxHeight + 4, boxWidth, halfSecondRowBoxHeight, colors.white, colors.black, 'Unregistered Users', `${this.plantCareRowData.plantCareUsersWithOutQrForOutput}`);
  
    // 5th box in 2nd row - QR Registration Chart
    const box5X = getX(4);
    const box5Y = getY(1);
    
    // Draw the box background with rounded corners
    doc.setFillColor(colors.white);
    doc.roundedRect(box5X, box5Y, boxWidth, secondRowBoxHeight, 2, 2, 'F');
    
    // Add title to the chart
    doc.setTextColor(colors.black);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const chartTitle = 'QR Registration';
    const chartTitleWidth = doc.getStringUnitWidth(chartTitle) * 10 / doc.internal.scaleFactor;
    doc.text(chartTitle, box5X + (boxWidth/2) - (chartTitleWidth/2), box5Y + 8); // Moved up by 2 units
    
    // Get the data for chart
    const QRpresentage = this.plantCareRowData.QRpresentageForOutput;
    const nonQRpresentage = this.plantCareRowData.nonQRpresentageForOutput;
    
    // Draw the chart bars - Moved everything up by 5 units
    const barWidth = boxWidth * 0.35;  // 35% of box width
    const barMaxHeight = secondRowBoxHeight * 0.55;  // Reduced from 60% to 55% of box height
    const startX = box5X + (boxWidth - (2 * barWidth + 5)) / 2;  // Center the bars
    const startY = box5Y + 12;  // Reduced from 15 to 12
    
    // Draw the Registered bar
    doc.setFillColor(0, 128, 128);  // Teal color
    const registeredBarHeight = (barMaxHeight * QRpresentage) / 100;
    doc.rect(startX, startY + (barMaxHeight - registeredBarHeight), barWidth, registeredBarHeight, 'F');
    
    // Draw the Unregistered bar
    doc.setFillColor(118, 183, 178);  // Light teal color
    const unregisteredBarHeight = (barMaxHeight * nonQRpresentage) / 100;
    doc.rect(startX + barWidth + 5, startY + (barMaxHeight - unregisteredBarHeight), barWidth, unregisteredBarHeight, 'F');
    
    // Add labels below bars - now with more space before end of box
    doc.setFontSize(8);
    doc.setTextColor(colors.black);
    const reg = 'Registered';
    const regWidth = doc.getStringUnitWidth(reg) * 8 / doc.internal.scaleFactor;
    doc.text(reg, startX + (barWidth/2) - (regWidth/2), startY + barMaxHeight + 5);
    
    const unreg = 'Unregistered';
    const unregWidth = doc.getStringUnitWidth(unreg) * 8 / doc.internal.scaleFactor;
    doc.text(unreg, startX + barWidth + 5 + (barWidth/2) - (unregWidth/2), startY + barMaxHeight + 5);
    
    // Add percentages on top of bars
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${QRpresentage}%`, startX + (barWidth/2) - 5, startY + (barMaxHeight - registeredBarHeight) - 2);
    doc.text(`${nonQRpresentage}%`, startX + barWidth + 5 + (barWidth/2) - 5, startY + (barMaxHeight - unregisteredBarHeight) - 2);
  
    // Row 3 adjustment for the increased height of row 2
    const row3YAdjustment = getY(2) + (secondRowBoxHeight - baseBoxHeight);
  
    // Row 3 (Standard Height)
    drawBox(getX(0), row3YAdjustment, boxWidth, baseBoxHeight, colors.teal, colors.white, 'Collection Officers', `Total: ${this.collectionOfficerRowData.allOfficers}`);
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
    drawBox(getX(0), row4YAdjustment, boxWidth, baseBoxHeight, colors.purple, colors.white, 'Sales Agents', `Total: ${this.salesAgentRowData.allSalesAgents}`);
    drawBox(getX(1), row4YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'Active Agents', `Just Now: ${this.salesAgentRowData.activeSalesAgents}`);
    drawBox(getX(2), row4YAdjustment, boxWidth, baseBoxHeight, colors.white, colors.black, 'New Agents', `Today: ${this.salesAgentRowData.newSalesAgents}`);
     
    // Save the PDF
    doc.save('dashboard-report.pdf');
    this.isDownloading = false;
  }
  
  
}
