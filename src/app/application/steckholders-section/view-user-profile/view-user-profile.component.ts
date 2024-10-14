import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatCommonModule } from '@angular/material/core';
import { ActivatedRoute } from '@angular/router';
import { PlantCareUser } from '../../../services/plant-care/plantcare-users.service';
import { environment } from '../../../environment/environment';
import { error } from 'console';

interface UserDetails {
  id: number;
  firstName: any;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  profileImage: string;
  createdAt: string;
}
@Component({
  selector: 'app-view-user-profile',
  standalone: true,
  imports: [MatCommonModule, ReactiveFormsModule, CommonModule],
  templateUrl: './view-user-profile.component.html',
  styleUrl: './view-user-profile.component.css',
})
export class ViewUserProfileComponent implements OnInit {
  imagePreview: string = '';
  userId: number | null = null;
  userDetails: UserDetails[] = [];
  firstName: string = '';
  lastName: string = '';
  phoneNumber: string = '';
  NICnumber: string = '';

  userForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.userId = params['userId'] ? +params['userId'] : null;
      console.log('Received item ID:', this.userId);
    });
    if (this.userId) {
      this.loadUserData(this.userId);
    }
  }
  loadUserData(id: number) {
    const token = localStorage.getItem('Login Token : ');
    if (!token) {
      console.error('No token found');
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get<any>(`${environment.API_BASE_URL}get-user-by-id/${id}`, {
        headers,
      })
      .subscribe(
        (data) => {
          this.userDetails = data;
          this.firstName = data.firstName;
          this.lastName = data.lastName;
          this.phoneNumber = data.phoneNumber;
          this.NICnumber = data.NICnumber;
          this.imagePreview = data.profileImage;
        },
        (error) => {
          console.error('Error ferching user data', error);
        }
      );
  }
}
