import { CommonModule } from '@angular/common';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
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
import { TokenService } from '../../../services/token/services/token.service';

@Component({
  selector: 'app-create-feedback',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    NgxColorsModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragPlaceholder,
  ],
  templateUrl: './create-feedback.component.html',
  styleUrl: './create-feedback.component.css',
})
export class CreateFeedbackComponent {
  isLoading = false;
  feebackList: any[] = [];
  bgColor: any = '#ffffff';
  feedback = {
    orderNumber: 0,
    feedbackEnglish: '',
    feedbackSinahala: '',
    feedbackTamil: '',
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private plantcareUsersService: PlantcareUsersService,
    private tokenService: TokenService
  ) {}

  ngOnInit() {
    this.loadNextNumber();
    this.getAllFeedbacks();
  }

  onCancel() {
    location.reload();
  }

  onSubmit() {
    if (
      !this.feedback.orderNumber ||
      !this.feedback.feedbackEnglish ||
      !this.feedback.feedbackSinahala ||
      !this.feedback.feedbackTamil
    ) {
      Swal.fire('Warning', 'Please fill all fields', 'warning');
      return;
    }
    if (this.feedback.orderNumber === 11) {
      Swal.fire(
        'Warning',
        'Maximum number of feedbacks are already uploaded',
        'warning'
      );
      return;
    }
    this.isLoading = true;
    const feedbackData = {
      orderNumber: this.feedback.orderNumber,
      feedbackEnglish: this.feedback.feedbackEnglish,
      feedbackSinahala: this.feedback.feedbackSinahala,
      feedbackTamil: this.feedback.feedbackTamil,
    };
    this.plantcareUsersService.createFeedback(feedbackData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        if (response.status) {
          Swal.fire('Success', response.message, 'success');
          this.feedback.feedbackEnglish = '';
          this.feedback.feedbackSinahala = '';
          this.feedback.feedbackTamil = '';
          this.loadNextNumber();
          this.getAllFeedbacks();
        } else {
          Swal.fire('Unsuccessful', response.message, 'error');
        }
      },
      error: () => {
        this.isLoading = false;
        Swal.fire(
          'Error',
          'An error occurred while creating feedback. Please try again.',
          'error'
        );
      },
    });
  }

  loadNextNumber() {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.isLoading = true;
    this.http
      .get<any>(`${environment.API_URL}auth/next-order-number`, { headers })
      .subscribe(
        (data) => {
          this.isLoading = false;
          this.feedback.orderNumber = data.nextOrderNumber;
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  getAllFeedbacks() {
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    this.http
      .get<any>(`${environment.API_URL}auth/get-all-feedbacks`, {
        headers,
      })
      .subscribe(
        (response) => {
          this.feebackList = response.feedbacks;
        },
        () => {}
      );
  }

  deleteFeedback(feedbackId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the feedback and reorder subsequent feedback entries.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.plantcareUsersService.deleteFeedback(feedbackId).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'Feedback has been deleted.', 'success');
            this.getAllFeedbacks();
            this.loadNextNumber();
          },
          error: () => {
            Swal.fire('Error!', 'Failed to delete feedback.', 'error');
          },
        });
      }
    });
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.feebackList, event.previousIndex, event.currentIndex);
    const updatedFeedbacks = this.feebackList.map((item, index) => ({
      id: item.id,
      orderNumber: index + 1,
    }));
    this.plantcareUsersService.updateFeedbackOrder(updatedFeedbacks).subscribe({
      next: (response: any) => {
        if (response.status) {
          this.feebackList.forEach((item, index) => {
            item.orderNumber = index + 1;
          });
          Swal.fire(
            'Success',
            'Feedback order updated successfully',
            'success'
          );
        } else {
          Swal.fire('Error', 'Failed to update feedback order', 'error');
          this.getAllFeedbacks();
        }
      },
      error: () => {
        Swal.fire(
          'Error',
          'An error occurred while updating feedback order',
          'error'
        );
        this.getAllFeedbacks();
      },
    });
  }

  getColorByOrderNumber(orderNumber: number): string {
    const colors: { [key: number]: string } = {
      1: '#FFF399',
      2: '#FFD462',
      3: '#FF8F61',
      4: '#FE7200',
      5: '#FF3B33',
      6: '#CD0800',
      7: '#850002',
      8: '#51000B',
      9: '#3B0214',
      10: '#777777',
    };
    return colors[orderNumber] || '#FFFFFF';
  }

  navigatePath(path: string) {
    this.router.navigate([path]);
  }
}
