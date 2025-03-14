import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CollectionService } from '../../../services/collection.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { CollectionOfficerService } from '../../../services/collection-officer/collection-officer.service';

@Component({
  selector: 'app-view-collective-officer-profile',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-collective-officer-profile.component.html',
  styleUrl: './view-collective-officer-profile.component.css',
})
export class ViewCollectiveOfficerProfileComponent {
  officerObj: CollectionOfficer = new CollectionOfficer();
  officerId!: number;
  showDisclaimView = false;
  isLoading = false;
  empHeader: string = '';

  constructor(
    private route: ActivatedRoute,
    private collectionService: CollectionService,
    private collectionOfficerService: CollectionOfficerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.officerId = this.route.snapshot.params['id'];
    this.fetchOfficerById(this.officerId);
    
  }

  getRoleHeading() {

    if(this.officerObj.jobRole === 'Collection Officer'){
      this.empHeader = 'COO';
      console.log(this.empHeader);
    }else if(this.officerObj.jobRole === 'Collection Center Manager'){
      this.empHeader = 'CCM';
      console.log('chalana',this.empHeader);
    }else if(this.officerObj.jobRole === 'Customer Officer'){
      this.empHeader = 'CUO';
    }
  }

  fetchOfficerById(id: number) {
    this.isLoading = true;
    this.collectionService
      .fetchAllCollectionOfficerProfile(id)
      .subscribe((res: any) => {
        this.isLoading = false;
        this.officerObj = res.officerData.collectionOfficer;

        this.officerObj.claimStatus = res.officerData.collectionOfficer.claimStatus;

        console.log(this.officerObj);
        this.getRoleHeading();
      });

     
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }

  viewOfficerTarget(officerId: number) {
    this.router.navigate([`/steckholders/action/collective-officer/view-officer-targets/${officerId}`])
  }
  
  generatePDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const margin = 10;
    let y = margin;

    const hasImage = !!this.officerObj.image;

    if (hasImage) {
        const img = new Image();
        img.src = this.officerObj.image;

        const imgDiameter = 30;
        const imgRadius = imgDiameter / 2;
        const imgX = margin;
        const imgY = y;

        pdf.saveGraphicsState();

        pdf.setDrawColor(255, 255, 255);
        pdf.setFillColor(255, 255, 255);
        pdf.circle(imgX + imgRadius, imgY + imgRadius, imgRadius, 'S');
        pdf.clip();

        pdf.addImage(img, 'JPEG', imgX, imgY, imgDiameter, imgDiameter);

        pdf.restoreGraphicsState();
    }

    const detailsX = hasImage ? margin + 40 : margin;

    pdf.setFontSize(10);
    pdf.text(`${this.officerObj.firstNameEnglish} ${this.officerObj.lastNameEnglish}`, detailsX, y + 10);
    y += 5;
    pdf.text(`${this.officerObj.jobRole} - ${this.empHeader}${this.officerObj.empId}`, detailsX, y + 10);
    y += 5;
    pdf.text(`${this.officerObj.centerName}`, detailsX, y + 10);
    y += 5;
    pdf.text(`${this.officerObj.companyNameEnglish}`, detailsX, y + 10);
    y += 30;

    pdf.setFontSize(12);
    pdf.text('Personal Information', margin, y);
    y += 10;

    pdf.setFontSize(10);
    const leftColumnX = margin;
    const rightColumnX = margin + 90;

    pdf.text(`First Name`, leftColumnX, y);
    pdf.text(`${this.officerObj.firstNameEnglish}`, leftColumnX, y + 7);
    pdf.text(`NIC Number`, leftColumnX, y + 21);
    pdf.text(`${this.officerObj.nic}`, leftColumnX, y + 28);
    pdf.text(`Phone Number - 1`, leftColumnX, y + 42);
    pdf.text(`${this.officerObj.phoneCode01} ${this.officerObj.phoneNumber01}`, leftColumnX, y + 49);

    pdf.text(`Last Name`, rightColumnX, y);
    pdf.text(`${this.officerObj.lastNameEnglish}`, rightColumnX, y + 7);
    pdf.text(`Email`, rightColumnX, y + 21);
    pdf.text(`${this.officerObj.email}`, rightColumnX, y + 28);
    pdf.text(`Phone Number - 2`, rightColumnX, y + 42);
    pdf.text(`${this.officerObj.phoneCode02} ${this.officerObj.phoneNumber02}`, rightColumnX, y + 49);

    y += 70;

    pdf.setFontSize(12);
    pdf.text('Address Details', margin, y);
    y += 10;

    pdf.setFontSize(10);

    pdf.text(`House / Plot Number`, leftColumnX, y);
    pdf.text(`${this.officerObj.houseNumber}`, leftColumnX, y + 7);
    pdf.text(`City`, leftColumnX, y + 21);
    pdf.text(`${this.officerObj.city}`, leftColumnX, y + 28);
    pdf.text(`Province`, leftColumnX, y + 42);
    pdf.text(`${this.officerObj.province}`, leftColumnX, y + 49);

    pdf.text(`Street Name`, rightColumnX, y);
    pdf.text(`${this.officerObj.streetName}`, rightColumnX, y + 7);
    pdf.text(`Country`, rightColumnX, y + 21);
    pdf.text(`${this.officerObj.country}`, rightColumnX, y + 28);
    pdf.text(`District`, rightColumnX, y + 42);
    pdf.text(`${this.officerObj.district}`, rightColumnX, y + 49);

    y += 70;

    pdf.setFontSize(12);
    pdf.text('Bank Details', margin, y);
    y += 10;

    pdf.setFontSize(10);

    pdf.text(`Account Holder's Name`, leftColumnX, y);
    pdf.text(`${this.officerObj.accHolderName}`, leftColumnX, y + 7);
    pdf.text(`Bank Name`, leftColumnX, y + 21);
    pdf.text(`${this.officerObj.bankName}`, leftColumnX, y + 28);

    pdf.text(`Account Number`, rightColumnX, y);
    pdf.text(`${this.officerObj.accNumber}`, rightColumnX, y + 7);
    pdf.text(`Branch Name`, rightColumnX, y + 21);
    pdf.text(`${this.officerObj.branchName}`, rightColumnX, y + 28);

    y += 42;

    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(
        `This report is generated on ${new Date().toLocaleDateString()}, at ${new Date().toLocaleTimeString()}.`,
        margin,
        pdf.internal.pageSize.getHeight() - margin
    );

    const fileName = `${this.officerObj.firstNameEnglish} ${this.officerObj.lastNameEnglish}(${this.empHeader + this.officerObj.empId}).pdf`;
    pdf.save(fileName);

    Swal.fire({
        icon: 'success',
        title: 'Download Complete',
        html: `<b>${fileName}</b> has been downloaded successfully!`,
        confirmButtonText: 'OK',
    });
}

  confirmDisclaim(id: number) {
    this.collectionOfficerService.disclaimOfficer(id).subscribe(
      (response) => {
        console.log('Officer ID sent successfully:', response);

        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Officer ID sent successfully!',
          confirmButtonText: 'OK',
        });

        this.showDisclaimView = false;
        this.router.navigate(['/steckholders/action/collective-officer']);
      },
      (error) => {
        console.error('Error sending Officer ID:', error);

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to send Officer ID!',
          confirmButtonText: 'Try Again',
        });
      }
    );
  }

  cancelDisclaim() {
    this.showDisclaimView = false;
  }

  toggleDisclaimView() {
    this.showDisclaimView = !this.showDisclaimView; // Toggle the boolean value
  }

  isAgroworldCompany(): boolean {
    return (
      this.officerObj.companyNameEnglish?.toLowerCase() === "agroworld (pvt) ltd" &&
      this.officerObj.status === "Approved"
    );
  }

  
}

class CollectionOfficer {
  id!: number;
  firstNameEnglish!: string;
  lastNameEnglish!: string;
  phoneNumber01!: string;
  phoneNumber02!: string;
  phoneCode01!: string;
  phoneCode02!: string;
  image!: string;
  nic!: string;
  email!: string;
  houseNumber!: string;
  streetName!: string;
  city!: string;
  district!: string;
  province!: string;
  country!: string;
  empId!: string;
  jobRole!: string;
  accHolderName!: string;
  accNumber!: string;
  bankName!: string;
  branchName!: string;
  companyNameEnglish!: string;
  centerName!: string;
  status!:string;
  claimStatus!: number;
}
