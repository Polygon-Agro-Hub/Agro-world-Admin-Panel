import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { NgxColorsModule } from 'ngx-colors';
import { PlantcareUsersService } from '../../../services/plant-care/plantcare-users.service';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDropList,
  moveItemInArray,
} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-create-feedback',
  standalone: true,
  imports: [ReactiveFormsModule, HttpClientModule, CommonModule, NgxColorsModule, FormsModule, CdkDropList, CdkDrag, CdkDragPlaceholder ],
  templateUrl: './create-feedback.component.html',
  styleUrl: './create-feedback.component.css'
})
export class CreateFeedbackComponent {

  isLoading = false;

  bgColor: any = '#ffffff'; 
  feedback = {
    orderNumber: '',
    colour: '',
    feedbackEnglish: '',
    feedbackSinahala: '',
    feedbackTamil: ''
  };


  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX - The Rise of Skywalker',
  ];

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

   constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private plantcareUsersService: PlantcareUsersService
    ) {  
     
    }


    ngOnInit() {
      this.loadUserData();
    }


  onCancel() {
    location.reload();
  }


  onColorChange(event: any): void {
    this.feedback.colour = event.color.hex;
  }
  
  onSubmit() {
    // Check for empty fields
    if (!this.feedback.orderNumber || 
        !this.feedback.colour || 
        !this.feedback.feedbackEnglish || 
        !this.feedback.feedbackSinahala || 
        !this.feedback.feedbackTamil) {
      Swal.fire(
        'Warning',
        'Please fill all input fields',
        'warning'
      );
      return;
    }
  
    this.isLoading = true;
  
    // Create JSON object
    const feedbackData = {
      orderNumber: this.feedback.orderNumber,
      colour: this.feedback.colour,
      feedbackEnglish: this.feedback.feedbackEnglish,
      feedbackSinahala: this.feedback.feedbackSinahala,
      feedbackTamil: this.feedback.feedbackTamil,
    };
  
    // Send POST request to backend
    this.plantcareUsersService.createFeedback(feedbackData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
  
        if (response.status) {
          Swal.fire(
            'Success',
            response.message,
            'success'
          );
          this.router.navigate(['/plant-care/opt-out-feedbacks']);
        } else {
          Swal.fire(
            'Unsuccessful',
            response.message,
            'error'
          );
        }
      },
      error: (error) => {
        console.error('Error creating feedback:', error);
        this.isLoading = false;
        Swal.fire(
          'Error',
          'An error occurred while creating feedback. Please try again.',
          'error'
        );
      }
    });
  }



  loadUserData() {
      const token = localStorage.getItem('Login Token : ');
      if (!token) {
        console.error('No token found');
        return;
      }
  
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });
  
      this.isLoading = true;
      this.http
        .get<any>(
          `${environment.API_BASE_URL}next-order-number`,
          { headers }
        )
        .subscribe(
          (data) => {
            this.isLoading = false;
            
            this.feedback.orderNumber = data.nextOrderNumber;
          },
          (error) => {
            this.isLoading = false
            console.error('Error fetching user data:', error);
          }
        );
    }
  


     
}
