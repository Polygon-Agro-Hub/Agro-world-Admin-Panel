import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token/services/token.service'
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';


@Component({
  selector: 'app-admin-row',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './admin-row.component.html',
  styleUrl: './admin-row.component.css'
})
export class AdminRowComponent implements OnInit{

  associateAdmins!: number;
  executiveAdmins!: number;
  managerAdmins!: number;
  officerAdmins!: number;
  newAdminUsers!: number;
  allAdminUsers!: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private stakeholderSrv: StakeholderService
    
    
  ) { }

  ngOnInit(): void {

    this.fetchAdminUserData();
    

  }

  fetchAdminUserData() {


    console.log("fetching started");
    // this.isLoading = true;
    this.stakeholderSrv.getAdminUserData().subscribe(
      
      (res) => {
        console.log('dtgsgdgdg',res);
        this.associateAdmins = res.adminUsersByPosition[0]?.adminUserCount ?? 0;
        this.executiveAdmins = res.adminUsersByPosition[1]?.adminUserCount ?? 0;
        this.managerAdmins = res.adminUsersByPosition[2]?.adminUserCount ?? 0;
        this.officerAdmins = res.adminUsersByPosition[3]?.adminUserCount ?? 0;
        // this.adminUsersByPosition = res.adminUsersByPosition;
        this.newAdminUsers = res.newAdminUsers[0]?.TotalAdminUserCount ?? 0;
        this.allAdminUsers = res.allAdminUsers[0]?.TotalAdminUserCount ?? 0;


      },
      (error) => {
        console.log("Error: ", error);
        // this.isLoading = false;
      }
    );
  }

}
