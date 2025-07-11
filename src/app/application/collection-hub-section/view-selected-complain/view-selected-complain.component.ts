import { Component, OnInit } from '@angular/core';
import { CollectionCenterService } from '../../../services/collection-center/collection-center.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { Dialog, DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-view-selected-complain',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    InputTextareaModule,
    FormsModule,
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
  ],
  templateUrl: './view-selected-complain.component.html',
  styleUrl: './view-selected-complain.component.css',
  providers: [DatePipe], // Add DatePipe to providers
})
export class ViewSelectedComplainComponent implements OnInit {
  complain: Complain = new Complain();
  complainId!: string;
  farmerName!: string;
  display: boolean = false; // Controls dialog visibility
  complaintText: string = ''; // Holds the text entered in the textarea
  messageContent: string = '';
  isLoading = false;

  constructor(
    private complainSrv: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  back(): void {
    this.router.navigate(['complaints/view-complains']);
  }

  showDialog() {
    this.display = true; // Opens the dialog
  }

  hideDialog() {
    this.display = false; // Closes the dialog
  }

  fetchComplain() {
    this.isLoading = true;
    this.complainSrv.getComplainById(this.complainId).subscribe((res) => {
      res.createdAt =
        this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm:ss a') ||
        res.createdAt;
      this.complain = res;
      console.log(res);
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params['id'];
    this.farmerName = this.route.snapshot.params['farmerName'];
    this.fetchComplain();
  }

  // submitComplaint() {
  //   console.log('Complaint Submitted:', this.complaintText);
  //   alert('Complaint Submitted: ' + this.complaintText);
  //   this.hideDialog(); // Close the dialog after submission
  // }

 submitComplaint() {
  // Check if messageContent is empty or contains only whitespace
  if (!this.messageContent || this.messageContent.trim() === '') {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Reply field is required!',
    });
    this.isLoading = false;
    return;
  }

  this.isLoading = true;
  const token = this.tokenService.getToken();
  if (!token) {
    console.error('No token found');
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Authentication token not found!',
    });
    this.isLoading = false;
    return;
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  this.hideDialog();

  console.log(this.complainId);
  console.log(this.messageContent);

  const body = { reply: this.messageContent };

  this.http
    .put(
      `${environment.API_URL}auth/reply-complain/${this.complainId}`,
      body,
      { headers }
    )
    .subscribe(
      (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Reply was sent successfully!',
        });
        this.fetchComplain();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error updating news', error);
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: 'Error sending reply',
        });
        this.fetchComplain();
        this.isLoading = false;
      }
    );
}
  // showReplyDialog() {
  //   Swal.fire({
  //     title: 'Reply as AgroWorld',
  //     html: `
  //         <div class="text-left">
  //           <p>Dear <strong>${this.farmerName}</strong>,</p>
  //           <p></p>
  //           <textarea 
  //             id="messageContent" 
  //             class="w-full p-2 border rounded mt-3 mb-3" 
  //             rows="5" 
  //             placeholder="Add your message here..."
  //           >${this.complain.reply || ''}</textarea>
  //           <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
  //           <p class="mt-3">
  //             Sincerely,<br/>
  //             AgroWorld Customer Support Team
  //           </p>
  //         </div>
  //       `,
  //     showCancelButton: true,
  //     confirmButtonText: 'Send',
  //     cancelButtonText: 'Cancel',
  //     confirmButtonColor: '#3980C0', // Green color for Send button
  //     cancelButtonColor: '#74788D', // Blue-gray for Cancel button
  //     width: '600px',
  //     reverseButtons: true, // Swap button positions
  //     preConfirm: () => {
  //       const textarea = document.getElementById(
  //         'messageContent'
  //       ) as HTMLTextAreaElement;
  //       return textarea.value;
  //     },
  //     didOpen: () => {
  //       // Direct DOM manipulation for button alignment
  //       setTimeout(() => {
  //         const actionsElement = document.querySelector('.swal2-actions');
  //         if (actionsElement) {
  //           actionsElement.setAttribute(
  //             'style',
  //             'display: flex; justify-content: flex-end !important; width: 100%;'
  //           );

  //           // Also swap buttons if needed (in addition to reverseButtons)
  //           const cancelButton = document.querySelector('.swal2-cancel');
  //           const confirmButton = document.querySelector('.swal2-confirm');
  //           if (cancelButton && confirmButton && actionsElement) {
  //             actionsElement.insertBefore(cancelButton, confirmButton);
  //           }
  //         }
  //       }); // Small delay to ensure DOM is ready
  //     },
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.messageContent = result.value;
  //       this.submitComplaint();
  //     }
  //   });
  // }



  showReplyDialog(language: string) {
    let closingMessage = '';
    
    if (language === 'Sinhala') {
      closingMessage = `
        <p>හිතවත් <strong>${this.farmerName}</strong>,</p>
        <p></p>
        <textarea 
          id="messageContent" 
          class="w-full p-2 border rounded mt-3 mb-3" 
          rows="5" 
          placeholder="ඔබගේ පණිවුඩය මෙතැනට ඇතුලත් කරන්න..."
        >${this.complain.reply || ""}</textarea>
        <p>ඔබට තවත් ගැටළු හෝ ප්‍රශ්න තිබේ නම්, කරුණාකර අප හා සම්බන්ධ වන්න. ඔබේ ඉවසීම සහ අවබෝධය වෙනුවෙන් ස්තූතියි.</p>
        <p class="mt-3">
          මෙයට,<br/>
          AgroWorld පාරිභෝගික සහාය කණ්ඩායම
        </p>
      `;
    } else if (language === 'Tamil') {
      closingMessage = `
        <p>அன்புள்ள <strong>${this.farmerName}</strong>,</p>
        <p></p>
        <textarea 
          id="messageContent" 
          class="w-full p-2 border rounded mt-3 mb-3" 
          rows="5" 
          placeholder="உங்கள் செய்தியை இங்கே சேர்க்கவும்..."
        >${this.complain.reply || ""}</textarea>
        <p>உங்களுக்கு மேலும் ஏதேனும் சிக்கல்கள் அல்லது கேள்விகள் இருந்தால், தயவுசெய்து எங்களைத் தொடர்பு கொள்ளவும். உங்கள் பொறுமைக்கும் புரிதலுக்கும் நன்றி.</p>
        <p class="mt-3">
          இதற்கு,<br/>
          அக்ரோவேர்ல்ட் வாடிக்கையாளர் ஆதரவு குழு
        </p>
      `;
    } else {
      // Default English
      closingMessage = `
        <p>Dear <strong>${this.farmerName}</strong>,</p>
        <p></p>
        <textarea 
          id="messageContent" 
          class="w-full p-2 border rounded mt-3 mb-3" 
          rows="5" 
          placeholder="Add your message here..."
        >${this.complain.reply || ""}</textarea>
        <p>If you have any further concerns or questions, feel free to reach out. Thank you for your patience and understanding.</p>
        <p class="mt-3">
          Sincerely,<br/>
          AgroWorld Customer Support Team
        </p>
      `;
    }
  
    Swal.fire({
      title: "Reply as AgroWorld",
      html: `<div class="text-left">${closingMessage}</div>`,
      showCancelButton: true,
      confirmButtonText: "Send",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3980C0",
      cancelButtonColor: "#74788D",
      width: "600px",
      reverseButtons: true,
      preConfirm: () => {
        const textarea = document.getElementById("messageContent") as HTMLTextAreaElement;
        return textarea.value;
      },
      didOpen: () => {
        setTimeout(() => {
          const actionsElement = document.querySelector('.swal2-actions');
          if (actionsElement) {
            actionsElement.setAttribute('style', 'display: flex; justify-content: flex-end !important; width: 100%;');
            
            const cancelButton = document.querySelector('.swal2-cancel');
            const confirmButton = document.querySelector('.swal2-confirm');
            if (cancelButton && confirmButton && actionsElement) {
              actionsElement.insertBefore(cancelButton, confirmButton);
            }
          }
        }, 0);
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.messageContent = result.value;
        this.submitComplaint();
      }
    });
  }
  
}

class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  firstName!: string;
  lastName!: string;
  farmerPhone!: string;
  complain!: string;
  complainCategory!: string;
  language!: string;
  createdAt!: string;
  reply!: string;
  centerName!: string;
  CollectionContact!: string;
  officerName!: string;
  officerPhone!: string;
  farmerName!: string;
}
