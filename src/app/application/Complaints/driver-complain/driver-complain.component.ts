import { Component } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { CommonModule, Location } from '@angular/common';
import { GoviLinkService } from '../../../services/govi-link/govi-link.service';
import Swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-driver-complain',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, FormsModule],
  templateUrl: './driver-complain.component.html',
  styleUrl: './driver-complain.component.css',
})
export class DriverComplainComponent {
  complain: Complain = {
    id: '',
    driverId: '',
    refNo: '',
    createdAt: '',
    complainCategory: '',
    complain: '',
    JobRole: '',
    empId: '',
    phoneNumber01: '',
    reply: '',
    language: '',
    officerNameSinhala: '',
    officerNameTamil: '',
    officerName: '',
  };
  isLoading = true;
  complainId!: string;
  isPopUpVisible: boolean = false;
  selectedLanguage: string = 'English';
  selectedOfficerName: string = '';

  constructor(
    private goviLinkService: GoviLinkService,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params['id'];
    this.fetchComplain();
  }

  back(): void {
    this.location.back();
  }

  fetchComplain() {
    this.isLoading = true;
    this.goviLinkService.getDriverComplainById(this.complainId).subscribe(
      (res) => {
        this.isLoading = false;
        console.log('this is the data', res);

        // Format the date
        if (res.createdAt) {
          const date = new Date(res.createdAt);
          res.createdAt = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        }

        this.complain = res;
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

    this.goviLinkService
      .replyDriverComplain(this.complainId, this.complain.reply)
      .subscribe(
        (res) => {
          Swal.fire({
            title: 'Success',
            text: 'Reply sent successfully!',
            icon: 'success',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          }).then(() => {
            this.location.back();
          });
          this.isLoading = false;
        },
        (error) => {
          Swal.fire({
            title: 'Error',
            text: 'Failed to send reply',
            icon: 'error',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold',
            },
          });
          this.isLoading = false;
        }
      );
  }

  closeReplyPopUp() {
    this.isPopUpVisible = false;
    this.selectedOfficerName = '';
    this.selectedLanguage = 'English';
  }

  showReplyPopUp(fname: string, language: string) {
    this.selectedOfficerName = fname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }
}

class Complain {
  id: string = '';
  driverId: string = '';
  refNo: string = '';
  createdAt: string = '';
  complainCategory: string = '';
  complain: string = '';
  JobRole: string = '';
  empId: string = '';
  phoneNumber01: string = '';
  reply: string = '';
  language: string = '';
  officerNameSinhala: string = '';
  officerNameTamil: string = '';
  officerName: string = '';
}