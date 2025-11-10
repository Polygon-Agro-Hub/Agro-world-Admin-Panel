import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';

@Component({
  selector: 'app-govi-link-view-complaint',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './govi-link-view-complaint.component.html',
  styleUrl: './govi-link-view-complaint.component.css',
  providers: [DatePipe],
})
export class GoviLinkViewComplaintComponent {
  complain: Complain = new Complain();
  complainId!: string;
  isLoading = false;
  isPopUpVisible: boolean = false;
  selectedLanguage: string = 'English';
  selectedOfficerName: string = '';

constructor(
  private goviLinkService: GoviLinkService, 
  private router: Router,
  private route: ActivatedRoute,
  private datePipe: DatePipe,
) {}

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params['id'];
    this.fetchComplain();
  }

  back(): void {
    this.router.navigate(['complaints/field-officer-complains']);
  }

fetchComplain() {
  this.isLoading = true;
  this.goviLinkService.getFieldOfficerComplainById(this.complainId)
    .subscribe(
      (res) => {
        res.createdAt = this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm:ss a') || res.createdAt;
        this.complain = res;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error fetching complain:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch complaint details',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        this.isLoading = false;
      }
    );
}



  showReplyPopUp(fname: string, language: string) {
    this.selectedOfficerName = fname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }

  closeReplyPopUp() {
    this.isPopUpVisible = false;
    this.selectedOfficerName = '';
    this.selectedLanguage = 'English';
  }

submitComplaint() {
  this.isLoading = true;
  
  if (!this.complain.reply?.trim()) {
    Swal.fire({
      icon: 'warning',
      title: 'Warning',
      text: 'Reply cannot be empty!',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    });
    this.isLoading = false;
    return;
  }

  this.goviLinkService.replyFieldOfficerComplain(this.complainId, this.complain.reply)
    .subscribe(
      (res) => {
        Swal.fire({
          title: 'Success',
          text: 'Reply sent successfully!',
          icon: 'success',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        }).then(() => {
          this.router.navigate(['/complaints/field-officer-complains']);
        });
        this.isLoading = false;
      },
      (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to send reply',
          icon: 'error',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold',
          },
        });
        this.isLoading = false;
      }
    );
}

}

class Complain {
  id!: string;
  empId!: any;
  JobRole!: string;
  refNo!: string;
  AdminStatus!: string;
  FCOStatus!: string;
  FIOStatus!: string;
  firstName!: string;
  lastName!: string;
  phoneNumber1!: string;
  complain!: string;
  complainCategory!: string;
  language!: string;
  createdAt!: string;
  reply!: string;
  companyName!: string;
  officerName!: string;
  officerNameSinhala!: string;
  officerNameTamil!: string;
  replyBy!: string;
  replyByName!: string;
  replyTime!: string;
}