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
  selector: 'app-collection-officer-users-row',
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: './collection-officer-users-row.component.html',
  styleUrl: './collection-officer-users-row.component.css'
})
export class CollectionOfficerUsersRowComponent implements OnInit {

  centerHeadOfficers!: number;
  centerManagers!: number;
  collectionOfficers!: number;
  customerOfficers!: number;
  newOfficers!: number;
  allOfficers!: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private stakeholderSrv: StakeholderService
    
    
  ) { }

  ngOnInit(): void {

    this.fetchCollectionOfficerData();

  }

  fetchCollectionOfficerData() {


    console.log("fetching started");
    // this.isLoading = true;
    this.stakeholderSrv.getCollectionOfficerData().subscribe(
      
      (res) => {
        console.log('dtgsgdgdg',res);
        this.centerHeadOfficers = res.collectionOfficersByPosition[0]?.officerCount ?? 0;
        this.centerManagers = res.collectionOfficersByPosition[1]?.officerCount ?? 0;
        this.collectionOfficers = res.collectionOfficersByPosition[2]?.officerCount ?? 0;
        this.customerOfficers = res.collectionOfficersByPosition[3]?.officerCount ?? 0;
        // this.adminUsersByPosition = res.adminUsersByPosition;
        this.newOfficers = res.newCollectionOfficers[0]?.newOfficerCount ?? 0;
        this.allOfficers = res.allCollectionOfficers[0]?.totalOfficerCount ?? 0;

        
      },
      (error) => {
        console.log("Error: ", error);
        // this.isLoading = false;
      }
    );
  }

}
