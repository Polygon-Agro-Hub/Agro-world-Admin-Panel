import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';

import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../services/token/services/token.service';
import { environment } from '../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ComplaintsService } from '../../../services/complaints/complaints.service';


@Component({
  selector: 'app-manage-applications',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './manage-applications.component.html',
  styleUrl: './manage-applications.component.css'
})
export class ManageApplicationsComponent {
  systemApplicationsArr!: SystemApplications[];

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private complaintSrv: ComplaintsService
    
  ) { }

  ngOnInit(): void {

    this.fetchAllSystemApplications();

  }

  fetchAllSystemApplications() {


    console.log("fetching started");
    // this.isLoading = true;
    this.complaintSrv.getAllSystemApplications().subscribe(
      
      (res) => {
        console.log('dtgsgdgdg',res);


        this.systemApplicationsArr = res;
        
      },
      (error) => {
        console.log("Error: ", error);
        // this.isLoading = false;
      }
    );
  }

  

  showAlert(systemAppId: number) {
    console.log("Fetching data for System Application ID: ", systemAppId);

    this.complaintSrv.getComplainCategoriesByAppId(systemAppId).subscribe((res: any) => {
        console.log(res);

        // Generate dynamic HTML for a properly aligned numbered list
        const categoryList = res
            .map((x: any, index: number) => `<tr><td>${index + 1}.</td><td class="text-start">${x.categoryEnglish}</td></tr>`)
            .join('');

        Swal.fire({
            title: 'Plant Care Complaint Categories',
            html: `<table style="margin: auto; font-size: 18px; align: justify-center;">${categoryList}</table>`, // Centering table
            
            showConfirmButton: false,
        });
    });
}

goBack() {
  this.router.navigate(['/complaints']);
}


}


class SystemApplications {
  categoryCount!: number
  systemAppId!:number
  systemAppName!: string
}
