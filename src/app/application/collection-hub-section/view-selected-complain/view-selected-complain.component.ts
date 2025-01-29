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

@Component({
  selector: 'app-view-selected-complain',
  standalone: true,
  imports: [DialogModule, ButtonModule, InputTextareaModule, FormsModule, FormsModule, CommonModule],
  templateUrl: './view-selected-complain.component.html',
  styleUrl: './view-selected-complain.component.css',
  providers: [DatePipe] // Add DatePipe to providers
})
export class ViewSelectedComplainComponent implements OnInit {
  complain: Complain = new Complain();
  complainId!: string;
  farmerName!: string;
  display: boolean = false; // Controls dialog visibility
  complaintText: string = ''; // Holds the text entered in the textarea
  messageContent: string = '';

  constructor(
    private complainSrv: CollectionCenterService,
    private router: Router,
    private route: ActivatedRoute,
    private datePipe: DatePipe ,
     private http: HttpClient,
     private tokenService: TokenService

  ) {}




  showDialog() {
    this.display = true; // Opens the dialog
  }

  hideDialog() {
    this.display = false; // Closes the dialog
  }


  fetchComplain() {
    this.complainSrv.getComplainById(this.complainId).subscribe((res) => {
      res.createdAt = this.datePipe.transform(res.createdAt, 'yyyy-MM-dd hh:mm:ss a') || res.createdAt;
      this.complain = res;
      console.log(res);
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
      const token = this.tokenService.getToken();
      if (!token) {
        console.error('No token found');
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
            console.log('Market Price updated successfully', res);
            
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'Market Price updated successfully!',
            });
            this.fetchComplain();
            
          },
          (error) => {
            console.error('Error updating news', error);
            
            Swal.fire({
              icon: 'error',
              title: 'Unsuccessful',
              text: 'Error updating news',
            });
          }
        );
    }



  
  


}

class Complain {
  id!: string;
  refNo!: string;
  status!: string;
  officerName!: string;
  farmerName!: string;
  officerPhone!: string;
  farmerPhone!: string;
  complain!: string;
  reply!: string;
  language!: string;
  createdAt!: string;
  CollectionContact!:string;
  centerName!:string;
}
