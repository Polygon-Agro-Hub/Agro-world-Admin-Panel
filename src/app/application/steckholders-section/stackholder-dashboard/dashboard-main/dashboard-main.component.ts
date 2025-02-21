import { Component, OnInit } from "@angular/core";
import { DropdownModule } from "primeng/dropdown";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { TokenService } from "../../../../services/token/services/token.service";
import { environment } from "../../../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { StakeholderService } from "../../../../services/stakeholder/stakeholder.service";
import { AdminRowComponent } from "../admin-row/admin-row.component";
import { CollectionOfficerUsersRowComponent } from "../collection-officer-users-row/collection-officer-users-row.component";
import { PlantcareUsersRowComponent } from "../plantcare-users-row/plantcare-users-row.component";
import { SalesAgentsRowComponent } from "../sales-agents-row/sales-agents-row.component";

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
  //admin data
  // associateAdmins!: number;
  // executiveAdmins!: number;
  // managerAdmins!: number;
  // officerAdmins!: number;
  // newAdminUsers!: number;
  // allAdminUsers!: number;

  //collection officer data

  // centerHeadOfficers!: number;
  // centerManagers!: number;
  // collectionOfficers!: number;
  // customerOfficers!: number;
  // newOfficers!: number;
  // allOfficers!: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private stakeholderSrv: StakeholderService,
  ) {}

  ngOnInit(): void {
    // this.fetchAdminUserData();
    // this.fetchCollectionOfficerData();
  }

  // fetchAdminUserData() {

  //   console.log("fetching started");
  //   // this.isLoading = true;
  //   this.stakeholderSrv.getAdminUserData().subscribe(

  //     (res) => {
  //       console.log('dtgsgdgdg',res);
  //       this.associateAdmins = res.adminUsersByPosition[0]?.adminUserCount ?? 0;
  //       this.executiveAdmins = res.adminUsersByPosition[1]?.adminUserCount ?? 0;
  //       this.managerAdmins = res.adminUsersByPosition[2]?.adminUserCount ?? 0;
  //       this.officerAdmins = res.adminUsersByPosition[3]?.adminUserCount ?? 0;
  //       // this.adminUsersByPosition = res.adminUsersByPosition;
  //       this.newAdminUsers = res.newAdminUsers[0]?.TotalAdminUserCount ?? 0;
  //       this.allAdminUsers = res.allAdminUsers[0]?.TotalAdminUserCount ?? 0;

  //     },
  //     (error) => {
  //       console.log("Error: ", error);
  //       // this.isLoading = false;
  //     }
  //   );
  // }

  // fetchCollectionOfficerData() {

  //   console.log("fetching started");
  //   // this.isLoading = true;
  //   this.stakeholderSrv.getCollectionOfficerData().subscribe(

  //     (res) => {
  //       console.log('dtgsgdgdg',res);
  //       this.centerHeadOfficers = res.collectionOfficersByPosition[0]?.officerCount ?? 0;
  //       this.centerManagers = res.collectionOfficersByPosition[1]?.officerCount ?? 0;
  //       this.collectionOfficers = res.collectionOfficersByPosition[2]?.officerCount ?? 0;
  //       this.customerOfficers = res.collectionOfficersByPosition[3]?.officerCount ?? 0;
  //       // this.adminUsersByPosition = res.adminUsersByPosition;
  //       this.newOfficers = res.newCollectionOfficers[0]?.newOfficerCount ?? 0;
  //       this.allOfficers = res.allCollectionOfficers[0]?.totalOfficerCount ?? 0;

  //     },
  //     (error) => {
  //       console.log("Error: ", error);
  //       // this.isLoading = false;
  //     }
  //   );
  // }
}
