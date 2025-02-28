import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { AdminRowComponent } from '../admin-row/admin-row.component';
import { CollectionOfficerUsersRowComponent } from '../collection-officer-users-row/collection-officer-users-row.component';
import { PlantcareUsersRowComponent } from '../plantcare-users-row/plantcare-users-row.component'
import { SalesAgentsRowComponent } from '../sales-agents-row/sales-agents-row.component';



@Component({
  selector: "app-dashboard-main",
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    AdminRowComponent,
    CollectionOfficerUsersRowComponent,
    PlantcareUsersRowComponent,
    SalesAgentsRowComponent,
  ],
  templateUrl: "./dashboard-main.component.html",
  styleUrl: "./dashboard-main.component.css",
})
export class DashboardMainComponent implements OnInit {
  
  firstRow: any = {};
  secondRow: any = {};
  thirdRow: any = {};
  fourthRow: any = {};


  constructor(
    private stakeholderSrv: StakeholderService
  ) { }

  ngOnInit(): void {
    this.fetchAdminUserData();
  }


  fetchAdminUserData() {
    console.log("fetching started");
    this.stakeholderSrv.getAdminUserData().subscribe(
      (res) => {
        console.log('Admin ->', res);
        this.firstRow = res.firstRow;
        this.secondRow = res.secondRow;
        this.thirdRow = res.thirdRow;
        this.fourthRow = res.fourthRow;
        // console.log("---------------",this.secondRow);

      },
      (error) => {
        console.log("Error: ", error);
      }
    );
  }

  
}







