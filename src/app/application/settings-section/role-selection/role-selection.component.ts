import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { Router } from '@angular/router';
import { PermissionService } from '../../../services/roles-permission/permission.service';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './role-selection.component.html',
  styleUrl: './role-selection.component.css'
})
export class RoleSelectionComponent {

  rolesList: any[] = [];

  constructor(private http: HttpClient, private router: Router, public permissionService: PermissionService) 
  {}

  ngOnInit() {
    this.getAllRoles();
  }


    getAllRoles() {
      const token = localStorage.getItem('Login Token : ');
      if (!token) {
        console.error('No token found');
        return;
      }
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
      this.http
        .get<any>(`${environment.API_BASE_URL}get-all-roles`, {
          headers,
        })
        .subscribe(
          (response) => {
            this.rolesList = response.roles;
            console.log(response);
          },
          (error) => {
            console.error('Error fetching news:', error);
          }
        );
    }


    viewPermissions(id: number) {
      this.router.navigate([`/settings/give-permissions/${id}`]);
    }

}
