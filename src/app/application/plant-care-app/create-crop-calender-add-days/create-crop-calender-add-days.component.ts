import {
  Component,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';


import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';

import { AddDaysComponent } from '../../../components/add-days/add-days.component';
import { environment } from '../../../environment/environment';
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-create-crop-calender-add-days',
  standalone: true,
  imports: [AddDaysComponent, RouterModule, CommonModule, HttpClientModule],
  templateUrl: './create-crop-calender-add-days.component.html',
  styleUrl: './create-crop-calender-add-days.component.css',
})
export class CreateCropCalenderAddDaysComponent implements AfterViewInit {
  days: number[] = [1]; // Start with Day 01
  formDataArray: any[] = [];
  cropId: string = '1'; //a mock value
  //cropData: any;

  @ViewChildren(AddDaysComponent) addDaysComponents:
    | QueryList<AddDaysComponent>
    | undefined;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private tokenService: TokenService

  ) {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras.state as { cropId: string };
    if (state && state.cropId) {
      this.cropId = state.cropId;
    } else {
      console.error('No cropId found in the navigation state');
    }
  }

  ngAfterViewInit() {
    // Initialize formDataArray based on the number of days
    this.formDataArray = new Array(this.days.length)
      .fill(null)
      .map(() => ({ title: '', daysnum: '', description: '' }));
  }

  collectFormData() {
    this.formDataArray = (this.addDaysComponents ?? []).map((comp) =>
      comp.getFormData()
    );
  }

  save() {
    this.collectFormData();
    console.log('Form data array:', this.formDataArray);

    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      alert('No token found. Please log in.');
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const requestBody = {
      cropId: this.cropId, // Include the cropId here
      tasks: this.formDataArray, // Include the form data array here
    };

    this.http
      .post(
        `${environment.API_URL}auth/admin-add-crop-calender-add-task`,
        requestBody,
        { headers }
      )
      .subscribe(
        (res: any) => {
          console.log('Data saved successfully', res);
          alert('Data saved successfully');
          console.log('cropId from 2nd page', this.cropId);
          // Reset form or perform other actions as needed
        },
        (error: any) => {
          console.error('Error saving data', error);
          alert('There was an error saving the data');
        }
      );
  }

  addNewDay() {
    // Add new day and initialize corresponding form data
    this.days.push(this.days.length + 1);
    this.formDataArray.push({ title: '', daysnum: '', description: '' }); // Initialize for the new day
  }

  cancel() {
    // Logic to cancel the action
    this.days = [1];
  }
}
