

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ComplaintsService } from '../../../services/complaints/complaints.service';

class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  firstName!: string;
  lastName!: string;
  fullName!: string;
  farmerPhone!: string;
  complain!: string;
  complainCategory!: string;
  language!: string;
  createdAt!: string;
  reply!: string;
  imageUrls: string[] = [];
}

@Component({
  selector: 'app-view-selected-complain',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextareaModule,
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './selected-wholesale-complaints.component.html',
  styleUrls: ['./selected-wholesale-complaints.component.css'],
  providers: [DatePipe],
})
export class SelectedwholesaleComplaintsComponent implements OnInit {
  selectedComplaint: any;
  complain: Complain = new Complain();
  complainId!: string;
  farmerName!: string;
  display: boolean = false;
  messageContent: string = '';
  isLoading = false;
  sanitizedImageUrls: SafeUrl[] = [];
  currentIndex: number = 0;
  modalVisible: boolean = false;
  isDarkMode: any;

  constructor(
    private complainService: ComplaintsService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params['id'];
    console.log('Complain ID:', this.complainId);
    this.fetchComplain();
  }

  back(): void {
    this.router.navigate(['complaints/wholesale-complaints']);
  }

  showDialog() {
    this.display = true;
  }

  hideDialog() {
    this.display = false;
  }

  fetchComplain() {
    this.isLoading = true;

    this.complainService.fetchComplain(this.complainId).subscribe({
      next: (res: any) => {
        console.log('API Response:', res);

        if (!res || !res.data) {
          throw new Error('Invalid response structure: Missing data');
        }

        const data = res.data;

        this.complain = {
          id: data.id?.toString() || '',
          refNo: data.refNo || '',
          status: data.status || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          farmerPhone: data.ContactNumber || '',
          complain: data.complain || '',
          complainCategory: data.categoryEnglish || '',
          language: this.inferLanguage(data),
          createdAt: this.datePipe.transform(data.createdAt, 'yyyy-MM-dd hh:mm:ss a') || '',
          reply: data.reply || '',
          imageUrls: this.parseImageUrls(data.imageUrls),
        };

        this.sanitizedImageUrls = this.complain.imageUrls.map(url =>
          this.sanitizer.bypassSecurityTrustUrl(url)
        );

        this.farmerName = this.complain.fullName;
        this.isLoading = false;
        console.log('Mapped Complaint:', this.complain);
      },
      error: (err) => {
        console.error('Error fetching complaint:', err);
        let errorMessage = 'Failed to fetch complaint details.';
        if (err.status === 404) {
          errorMessage = `Complaint with ID ${this.complainId} not found.`;
        } else if (err.status === 401) {
          errorMessage = 'Unauthorized access. Please log in again.';
         
        } else if (err.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check if the backend is running.';
        } else if (err.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (err.message.includes('Invalid response structure')) {
          errorMessage = 'Invalid response from server. Please contact support.';
        } else if (err.message.includes('No authentication token found')) {
          errorMessage = 'No authentication token found. Please log in again.';
          this.router.navigate(['/login']);
        }

        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
        });
        this.isLoading = false;
      },
    });
  }

  handleImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/fallback-image.png';
  }

  private parseImageUrls(imageUrls: string | undefined): string[] {
    if (!imageUrls) {
      return [];
    }
    return imageUrls.includes(',') ? imageUrls.split(',').map(url => url.trim()) : [imageUrls];
  }

  private inferLanguage(res: any): string {
    return res.language || 'English';
  }

  submitComplaint() {
    this.isLoading = true;
    this.hideDialog();

    this.complainService.submitComplaint(this.complainId, this.messageContent).subscribe({
      next: (response: any) => {
        if (response.status) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Reply was sent successfully!',
                                      customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
          });
          this.fetchComplain();
          this.hideDialog();
          this.messageContent = '';
          this.router.navigate(['complaints/wholesale-complaints']);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: response.message || 'Failed to send reply.',
             customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
          });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending reply:', error);
        let errorMessage = 'Error sending reply.';
        if (error.status === 404) {
          errorMessage = 'Complaint not found. Please verify the complaint ID.';
        } else if (error.status === 401) {
          errorMessage = 'Unauthorized access. Please log in again.';
          this.router.navigate(['/login']);
        } else if (error.status === 400) {
          errorMessage = error.error.message || 'Invalid input. Please check your reply.';
        } else if (error.message.includes('No authentication token found')) {
          errorMessage = 'No authentication token found. Please log in again.';
          this.router.navigate(['/login']);
        }
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: errorMessage,
           customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
        });
        this.isLoading = false;
      },
    });
  }

  showReplyDialog(language: string) {
    this.display = true;
  }

  openImageViewer(index: number) {
    if (this.sanitizedImageUrls.length > 0) {
      this.currentIndex = index;
      this.modalVisible = true;
    }
  }

  closeModal() {
    this.modalVisible = false;
  }

  nextImage() {
    if (this.modalVisible && this.sanitizedImageUrls.length > 0) {
      this.currentIndex = (this.currentIndex + 1) % this.sanitizedImageUrls.length;
    }
  }

  prevImage() {
    if (this.modalVisible && this.sanitizedImageUrls.length > 0) {
      this.currentIndex = (this.currentIndex - 1 + this.sanitizedImageUrls.length) % this.sanitizedImageUrls.length;
    }
  }

  submitReply() {
    throw new Error('Method not implemented.');
  }
}