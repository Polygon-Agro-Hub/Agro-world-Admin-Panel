import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { AdminRowComponent } from '../admin-row/admin-row.component';
import { CollectionOfficerUsersRowComponent } from '../collection-officer-users-row/collection-officer-users-row.component';
import { PlantcareUsersRowComponent } from '../plantcare-users-row/plantcare-users-row.component';
import { SalesAgentsRowComponent } from '../sales-agents-row/sales-agents-row.component';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-dashboard-main',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    AdminRowComponent,
    CollectionOfficerUsersRowComponent,
    PlantcareUsersRowComponent,
    SalesAgentsRowComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './dashboard-main.component.html',
  styleUrl: './dashboard-main.component.css',
})
export class DashboardMainComponent implements OnInit {
  firstRow: any = {};
  secondRow: any = {};
  thirdRow: any = {};
  fourthRow: any = {};
  isLoading = false;
  adminRowData: any = {};
  collectionOfficerRowData: any = {};
  salesAgentRowData: any = {};
  plantCareRowData: any = {};
  isDownloading: boolean = false;
  currentDate = new Date().toISOString().split('T')[0];

  constructor(private stakeholderSrv: StakeholderService) {}

  ngOnInit(): void {
    this.fetchAdminUserData();
  }

  fetchAdminUserData() {
    this.isLoading = true;
    this.stakeholderSrv.getAdminUserData().subscribe(
      (res) => {
        this.firstRow = res.firstRow;
        this.secondRow = res.secondRow;
        this.thirdRow = res.thirdRow;
        this.fourthRow = res.fourthRow;
        this.isLoading = false;
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onAdminDataEmitted(data: any) {
    this.adminRowData = data;
  }

  onsPlantCareDataEmitted(data: any) {
    this.plantCareRowData = data;
  }

  onCollectionOfficerDataEmitted(data: any) {
    this.collectionOfficerRowData = data;
  }

  onsalesAgentDataEmitted(data: any) {
    this.salesAgentRowData = data;
  }

  exportReport(): void {
    this.isDownloading = true;
    const minLoadingTime = 2000;
    const startTime = Date.now();

    const generatePdf = () => {
      try {
        const doc = new jsPDF();
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
        doc.rect(
          0,
          0,
          doc.internal.pageSize.width,
          doc.internal.pageSize.height,
          'F'
        );

        const currentDate = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Generate filename with today's date only
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        const fileName = `${formattedDate}.pdf`;

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.black);
        doc.text(`Stakeholder Dashboard Report on ${currentDate}`, 10, 15);

        const drawBox = (
          x: number,
          y: number,
          width: number,
          height: number,
          backgroundColor: string,
          textColor: string,
          label: string,
          value: string
        ) => {
          doc.setFillColor(backgroundColor);
          const cornerRadius = 2;
          doc.roundedRect(x, y, width, height, cornerRadius, cornerRadius, 'F');
          const centerX = x + width / 2;
          doc.setTextColor(textColor);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const labelWidth =
            (doc.getStringUnitWidth(label) * 10) / doc.internal.scaleFactor;
          doc.text(label, centerX - labelWidth / 2, y + height * 0.4);
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          const valueWidth =
            (doc.getStringUnitWidth(value) * 12) / doc.internal.scaleFactor;
          doc.text(value, centerX - valueWidth / 2, y + height * 0.75);
        };

        const pageWidth = 210;
        const horizontalPadding = 10;
        const boxCount = 5;
        const spaceBetweenBoxes = 5;
        const verticalSpacing = 10;
        const totalSpace =
          pageWidth -
          2 * horizontalPadding -
          (boxCount - 1) * spaceBetweenBoxes;
        const boxWidth = totalSpace / boxCount;
        const baseBoxHeight = 35;
        const halfBoxHeight = baseBoxHeight / 2 - 2;
        const secondRowBoxHeight = 45;
        const halfSecondRowBoxHeight = secondRowBoxHeight / 2 - 2;
        const baseY = 25;

        const getX = (index: number) =>
          horizontalPadding + index * (boxWidth + spaceBetweenBoxes);
        const getY = (row: number) =>
          baseY + row * (baseBoxHeight + verticalSpacing);

        drawBox(
          getX(0),
          getY(0),
          boxWidth,
          baseBoxHeight,
          colors.blue,
          colors.white,
          'Admin Users',
          `Total: ${this.adminRowData.allAdminUsers}`
        );
        drawBox(
          getX(1),
          getY(0),
          boxWidth,
          baseBoxHeight,
          colors.white,
          colors.black,
          'Active Admins',
          `Just Now: ${this.adminRowData.allAdminUsers}`
        );
        drawBox(
          getX(2),
          getY(0),
          boxWidth,
          baseBoxHeight,
          colors.white,
          colors.black,
          'New Admins',
          `Total: ${this.adminRowData.newAdminUsers}`
        );
        drawBox(
          getX(3),
          getY(0),
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Total Associate',
          `${this.adminRowData.associateAdmins}`
        );
        drawBox(
          getX(3),
          getY(0) + halfBoxHeight + 4,
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Total Officers',
          `${this.adminRowData.officerAdmins}`
        );
        drawBox(
          getX(4),
          getY(0),
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Total Executives',
          `${this.adminRowData.executiveAdmins}`
        );
        drawBox(
          getX(4),
          getY(0) + halfBoxHeight + 4,
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Total Manager',
          `${this.adminRowData.managerAdmins}`
        );

        drawBox(
          getX(0),
          getY(1),
          boxWidth,
          secondRowBoxHeight,
          colors.orange,
          colors.white,
          'Plant Care Users',
          `Total: ${this.plantCareRowData.allPlantCareUsers}`
        );
        drawBox(
          getX(1),
          getY(1),
          boxWidth,
          secondRowBoxHeight,
          colors.white,
          colors.black,
          'Active Users',
          `Just Now: ${this.plantCareRowData.activePlantCareUsers}`
        );
        drawBox(
          getX(2),
          getY(1),
          boxWidth,
          secondRowBoxHeight,
          colors.white,
          colors.black,
          'Active Users',
          `Today: ${this.plantCareRowData.newPlantCareUsers}`
        );
        drawBox(
          getX(3),
          getY(1),
          boxWidth,
          halfSecondRowBoxHeight,
          colors.white,
          colors.black,
          'Qr Registered Users',
          `${this.plantCareRowData.plantCareUsersWithQrForOutput}`
        );
        drawBox(
          getX(3),
          getY(1) + halfSecondRowBoxHeight + 4,
          boxWidth,
          halfSecondRowBoxHeight,
          colors.white,
          colors.black,
          'Unregistered Users',
          `${this.plantCareRowData.plantCareUsersWithOutQrForOutput}`
        );

        const box5X = getX(4);
        const box5Y = getY(1);

        doc.setFillColor(colors.white);
        doc.roundedRect(box5X, box5Y, boxWidth, secondRowBoxHeight, 2, 2, 'F');
        doc.setTextColor(colors.black);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const chartTitle = 'QR Registration';
        const chartTitleWidth =
          (doc.getStringUnitWidth(chartTitle) * 10) / doc.internal.scaleFactor;
        doc.text(
          chartTitle,
          box5X + boxWidth / 2 - chartTitleWidth / 2,
          box5Y + 8
        );

        const QRpresentage = this.plantCareRowData.QRpresentageForOutput;
        const nonQRpresentage = this.plantCareRowData.nonQRpresentageForOutput;
        const barWidth = boxWidth * 0.35;
        const barMaxHeight = secondRowBoxHeight * 0.55;
        const startX = box5X + (boxWidth - (2 * barWidth + 5)) / 2;
        const startY = box5Y + 12;

        doc.setFillColor(0, 128, 128);
        const registeredBarHeight = (barMaxHeight * QRpresentage) / 100;
        doc.rect(
          startX,
          startY + (barMaxHeight - registeredBarHeight),
          barWidth,
          registeredBarHeight,
          'F'
        );

        doc.setFillColor(118, 183, 178);
        const unregisteredBarHeight = (barMaxHeight * nonQRpresentage) / 100;
        doc.rect(
          startX + barWidth + 5,
          startY + (barMaxHeight - unregisteredBarHeight),
          barWidth,
          unregisteredBarHeight,
          'F'
        );

        doc.setFontSize(8);
        doc.setTextColor(colors.black);
        const reg = 'Registered';
        const regWidth =
          (doc.getStringUnitWidth(reg) * 8) / doc.internal.scaleFactor;
        doc.text(
          reg,
          startX + barWidth / 2 - regWidth / 2,
          startY + barMaxHeight + 5
        );

        const unreg = 'Unregistered';
        const unregWidth =
          (doc.getStringUnitWidth(unreg) * 8) / doc.internal.scaleFactor;
        doc.text(
          unreg,
          startX + barWidth + 5 + barWidth / 2 - unregWidth / 2,
          startY + barMaxHeight + 5
        );

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${QRpresentage}%`,
          startX + barWidth / 2 - 5,
          startY + (barMaxHeight - registeredBarHeight) - 2
        );
        doc.text(
          `${nonQRpresentage}%`,
          startX + barWidth + 5 + barWidth / 2 - 5,
          startY + (barMaxHeight - unregisteredBarHeight) - 2
        );

        const row3YAdjustment = getY(2) + (secondRowBoxHeight - baseBoxHeight);
        drawBox(
          getX(0),
          row3YAdjustment,
          boxWidth,
          baseBoxHeight,
          colors.teal,
          colors.white,
          'Collection Officers',
          `Total: ${this.collectionOfficerRowData.allOfficers}`
        );
        drawBox(
          getX(1),
          row3YAdjustment,
          boxWidth,
          baseBoxHeight,
          colors.white,
          colors.black,
          'Active Officers',
          `Just Now: ${this.collectionOfficerRowData.activeOfficers}`
        );
        drawBox(
          getX(2),
          row3YAdjustment,
          boxWidth,
          baseBoxHeight,
          colors.white,
          colors.black,
          'New Officers',
          `Today: ${this.collectionOfficerRowData.newOfficers}`
        );
        drawBox(
          getX(3),
          row3YAdjustment,
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Center Head Officers',
          `${this.collectionOfficerRowData.centerHeadOfficers}`
        );
        drawBox(
          getX(3),
          row3YAdjustment + halfBoxHeight + 4,
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Center Managers',
          `${this.collectionOfficerRowData.centerManagers}`
        );
        drawBox(
          getX(4),
          row3YAdjustment,
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Collection Officers',
          `${this.collectionOfficerRowData.collectionOfficers}`
        );
        drawBox(
          getX(4),
          row3YAdjustment + halfBoxHeight + 4,
          boxWidth,
          halfBoxHeight,
          colors.white,
          colors.black,
          'Customer Officers',
          `${this.collectionOfficerRowData.customerOfficers}`
        );

        const row4YAdjustment = getY(3) + (secondRowBoxHeight - baseBoxHeight);
        drawBox(
          getX(0),
          row4YAdjustment,
          boxWidth,
          baseBoxHeight,
          colors.purple,
          colors.white,
          'Sales Agents',
          `Total: ${this.salesAgentRowData.allSalesAgents}`
        );
        drawBox(
          getX(1),
          row4YAdjustment,
          boxWidth,
          baseBoxHeight,
          colors.white,
          colors.black,
          'Active Agents',
          `Just Now: ${this.salesAgentRowData.activeSalesAgents}`
        );
        drawBox(
          getX(2),
          row4YAdjustment,
          boxWidth,
          baseBoxHeight,
          colors.white,
          colors.black,
          'New Agents',
          `Today: ${this.salesAgentRowData.newSalesAgents}`
        );

        // Use the generated filename with today's date only
        doc.save(fileName);
      } catch {}
    };

    const completeExport = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      setTimeout(() => {
        this.isDownloading = false;
      }, remainingTime);
    };

    setTimeout(() => {
      generatePdf();
      completeExport();
    }, 0);
  }
}
