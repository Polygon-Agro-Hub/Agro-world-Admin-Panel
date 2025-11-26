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
  providers: [DatePipe], 
})
export class ViewSelectedComplainComponent implements OnInit {
  complain: Complain = new Complain();
  complainId!: string;
  farmerName!: string;
  display: boolean = false; 
  complaintText: string = ''; 
  messageContent: string = '';
  isLoading = false;

  isPopUpVisible:boolean = false;
  selectedLanguage:string = 'English';
  selectedFarmerName:string = '';

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
    this.display = true; 
  }

  hideDialog() {
    this.display = false; 
  }

  fetchComplain() {
    this.isLoading = true;
    this.complainSrv.getComplainById(this.complainId).subscribe((res) => {
      res.createdAt =
        this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm:ss a') ||
        res.createdAt;
      this.complain = res;
      this.isLoading = false;
    });
  }

  ngOnInit(): void {
    this.complainId = this.route.snapshot.params['id'];
    this.farmerName = this.route.snapshot.params['farmerName'];
    this.fetchComplain();
  }

 submitComplaint() {
  if (!this.complain.reply || this.complain.reply.trim() === '') {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Reply field is required!',
      customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
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


  const body = { reply: this.complain.reply };

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
                                    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
        });
        this.fetchComplain();
        this.closeReplyPopUp();
        this.router.navigate(['/complaints/view-complains'])
        this.isLoading = false;
      },
      (error) => {
        console.error('Error updating news', error);
        Swal.fire({
          icon: 'error',
          title: 'Unsuccessful',
          text: 'Error sending reply',
             customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold',
    },
        });
        this.fetchComplain();
        this.closeReplyPopUp();
        this.isLoading = false;
      }
    );
}


    showReplyPopUp(fname: string, lname: string, language: string) {
    this.selectedFarmerName = fname + ' ' + lname;
    this.selectedLanguage = language;
    this.isPopUpVisible = true;
  }

  closeReplyPopUp() {
    this.isPopUpVisible = false;
    this.selectedFarmerName = 'English';
    this.selectedLanguage = '';
  }
  
}

class Complain {
  id!: number;
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
