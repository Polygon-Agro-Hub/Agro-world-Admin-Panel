import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
export class AdminRowComponent implements OnChanges {

  @Input() firstRow: any = {}

  associateAdmins!: number;
  executiveAdmins!: number;
  managerAdmins!: number;
  officerAdmins!: number;
  newAdminUsers!: number;
  allAdminUsers!: number;

  ngOnChanges(): void {
    // console.log("Row ---> ", this.firstRow);
    this.fetchAdminUserData(this.firstRow)
  }

  fetchAdminUserData(data: any) {

    console.log('Admin->', data);
    this.associateAdmins = data.adminUsersByPosition.Associate.adminUserCount ?? 0;
    this.executiveAdmins = data.adminUsersByPosition.Executive.adminUserCount ?? 0;
    this.managerAdmins = data.adminUsersByPosition.Manager.adminUserCount ?? 0;
    this.officerAdmins = data.adminUsersByPosition.Manager.adminUserCount ?? 0;
    // this.adminUsersByPosition = data.adminUsersByPosition;
    this.newAdminUsers = data.todayAdmin.todayCount ?? 0;
    this.allAdminUsers = this.totCount(this.associateAdmins, this.executiveAdmins, this.managerAdmins, this.officerAdmins);
  }

  totCount(x1: number, x2: number, x3: number, x4: number): number {
    return (x1 + x2 + x3 + x4)
  }

}
