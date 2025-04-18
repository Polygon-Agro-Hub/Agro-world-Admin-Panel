import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token/services/token.service'
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { LoadingSpinnerComponent } from "../../../../components/loading-spinner/loading-spinner.component";


@Component({
  selector: "app-admin-row",
  standalone: true,
  imports: [CommonModule, DropdownModule, LoadingSpinnerComponent],
  templateUrl: "./admin-row.component.html",
  styleUrl: "./admin-row.component.css",
})
export class AdminRowComponent implements OnChanges {

  @Input() firstRow: any = {}
  @Output() adminDataEmitted = new EventEmitter<any>();

  associateAdmins: number = 0;
  executiveAdmins: number = 0;
  managerAdmins: number = 0;
  officerAdmins: number = 0;
  newAdminUsers: number = 0;
  allAdminUsers: number = 0;
  


  ngOnChanges(): void {
    // console.log("Row ---> ", this.firstRow);
    this.fetchAdminUserData(this.firstRow)
  }

  fetchAdminUserData(data: any) {
    
    console.log('Admin->', data);

    this.associateAdmins = data.adminUsersByPosition?.Associate?.adminUserCount ?? 0;
    this.executiveAdmins = data.adminUsersByPosition?.Executive?.adminUserCount ?? 0;
    this.managerAdmins = data.adminUsersByPosition?.Manager?.adminUserCount ?? 0;
    this.officerAdmins = data.adminUsersByPosition?.Officer?.adminUserCount ?? 0;
    this.newAdminUsers = data.todayAdmin?.todayCount ?? 0;

    this.allAdminUsers = this.totCount(
        this.associateAdmins,
        this.executiveAdmins,
        this.managerAdmins,
        this.officerAdmins
    );

    this.adminDataEmitted.emit({
      associateAdmins: this.associateAdmins,
      executiveAdmins: this.executiveAdmins,
      managerAdmins: this.managerAdmins,
      officerAdmins: this.officerAdmins,
      newAdminUsers: this.newAdminUsers,
      allAdminUsers: this.allAdminUsers
    });

}


  totCount(x1: number, x2: number, x3: number, x4: number): number {
    return (x1 + x2 + x3 + x4)
  }
}
