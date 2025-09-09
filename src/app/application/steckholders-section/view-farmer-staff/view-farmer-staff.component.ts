import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../../../services/token/services/token.service';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-view-farmer-staff',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    LoadingSpinnerComponent,
    DropdownModule
  ],
  templateUrl: './view-farmer-staff.component.html',
  styleUrl: './view-farmer-staff.component.css'
})
export class ViewFarmerStaffComponent implements OnInit {
  staffArr!: Staff[];
  hasData: boolean = false;
  isLoading: boolean = true;
  farmerId!: number;
  farmerName: string = '';
  farmerNumber:string = '';
  selectedRole: string = '';

  roleArr = [
    { label: 'Supervisor', value: 'Supervisor' },
    { label: 'Manager', value: 'Manager' },
    { label: 'Laber', value: 'Laber' },
  ];

  constructor(
    public tokenService: TokenService,
    private plantcareService: PlantcareUsersService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    public permissionService: PermissionService
  ) { }
  ngOnInit(): void {
    this.farmerId = this.route.snapshot.params['id'];
    this.farmerName = this.route.snapshot.queryParams['fname'];
    this.farmerNumber = this.route.snapshot.queryParams['phone'];
    this.fetchData();
  }

  fetchData() {
    this.isLoading = true;
    this.plantcareService.getAllFarmerStaff(this.farmerId, this.selectedRole).subscribe(
      (res) => {
        console.log(res);
        this.staffArr = res.result
        this.hasData =  this.staffArr?.length > 0 ? true : false;
        this.isLoading = false

      }
    )
  }

viewFarmerStaff(id: number) {
  this.router.navigate(['/steckholders/action/farmers/view-farmer-owner', id]);
}

editFarmerStaff(id: number) {
  this.router.navigate(['/steckholders/action/farmers/edit-user-staff', id]);
}

}

class Staff {
  id!: number;
  firstName!: string;
  lastName!: string;
  phoneCode!: string;
  phoneNumber!: string;
  role!: string;
  nic!: string;
  image!: string;
}
