import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { TokenService } from '../../../../services/token/services/token.service'
import { environment } from '../../../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { StakeholderService } from '../../../../services/stakeholder/stakeholder.service';
import { BarChartComponent } from '../bar-chart/bar-chart.component'

@Component({
  selector: 'app-plantcare-users-row',
  standalone: true,
  imports: [CommonModule, DropdownModule, BarChartComponent],
  templateUrl: './plantcare-users-row.component.html',
  styleUrl: './plantcare-users-row.component.css'
})
export class PlantcareUsersRowComponent implements OnInit {

  
  plantCareUsersWithOutQr!: number;
  plantCareUsersWithQr!: number;
  newPlantCareUsers!: number;
  allPlantCareUsers!: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private stakeholderSrv: StakeholderService
    
    
  ) { }

  ngOnInit(): void {

    this.fetchPlantCareUserData();


  }

  fetchPlantCareUserData() {


    console.log("fetching started");
    
    this.stakeholderSrv.getPlantCareUserData().subscribe(
      
      (res) => {
        console.log('dtgsgdgdg',res);
        this.plantCareUsersWithOutQr = res.plantCareUserByQrRegistration[1]?.user_count ?? 0;
        this.plantCareUsersWithQr = res.plantCareUserByQrRegistration[0]?.user_count ?? 0;
        this.newPlantCareUsers = res.newPlantCareUsers[0]?.newPlantCareUserCount ?? 0;
        this.allPlantCareUsers = res.allPlantCareUsers[0]?.totalPlantCareUserCount ?? 0;


      },
      (error) => {
        console.log("Error: ", error);
        // this.isLoading = false;
      }
    );
  }

}
