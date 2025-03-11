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
    const reportContainer = document.getElementById('reportcontainer');

    if (reportContainer) {
      const buttons = reportContainer.querySelectorAll('button');
      buttons.forEach((btn) => (btn.style.display = 'none'));

      html2canvas(reportContainer, {
        scale: 1,
        useCORS: true,
        logging: true,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          

         

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          const fileName = `${this.officerObj.firstNameEnglish} ${this.officerObj.lastNameEnglish}(${this.empHeader+this.officerObj.empId}).pdf`;
          pdf.save(fileName);

          buttons.forEach((btn) => (btn.style.display = 'block'));

          Swal.fire({
            icon: 'success',
            title: 'Download Complete',
            html: `<b>${fileName}</b> has been downloaded successfully!`,
            confirmButtonText: 'OK',
          });
        })
        .catch((error) => {
          console.error('Error generating PDF:', error);
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Something went wrong while generating the PDF!',
            confirmButtonText: 'Try Again',
          });
        });
    }
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
