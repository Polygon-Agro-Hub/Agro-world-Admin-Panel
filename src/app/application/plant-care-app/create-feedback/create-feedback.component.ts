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
  ) { }

  ngOnInit() {
    this.loadNextNumber();
    this.getAllFeedbacks();
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

  back(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care/action/opt-out-feedbacks']);
      }
    });
  }

  onCancel() {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
    }).then((result) => {
      if (result.isConfirmed) {
             this.router.navigate(['/plant-care/action/opt-out-feedbacks']);

  
      }
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

  preventLeadingSpace(event: KeyboardEvent, currentValue: string | number): void {
    const value = String(currentValue || '').trim();
    if (value.length === 0 && event.key === ' ') {
      event.preventDefault();
    }
  }

  preventInvalidEnglishAlphanumericCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys (backspace, delete, tab, escape, enter, etc.)
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow English letters, numbers, spaces, and common punctuation
    const englishAlphanumericRegex = /^[a-zA-Z0-9\s.,!?()-]$/;
    if (!englishAlphanumericRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Validate and filter pasted English content
  validateEnglishPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const englishAlphanumericRegex = /[a-zA-Z0-9\s.,!?()-]/g;

    // Filter out invalid characters, keeping only valid ones
    const filteredText = pastedText.match(englishAlphanumericRegex)?.join('') || '';

    // Insert the filtered text at cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;

    target.value = currentValue.substring(0, start) + filteredText + currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + filteredText.length;
    target.setSelectionRange(newPosition, newPosition);

    // Trigger input event for Angular form validation
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Prevent invalid Sinhala characters (allow Sinhala unicode, numbers, spaces, and common punctuation)
  preventInvalidSinhalaAlphanumericCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow Sinhala characters, numbers, spaces, and common punctuation
    const sinhalaAlphanumericRegex = /^[\u0D80-\u0DFF0-9\s.,!?()-]$/;
    if (!sinhalaAlphanumericRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Validate and filter pasted Sinhala content
  validateSinhalaPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const sinhalaAlphanumericRegex = /[\u0D80-\u0DFF0-9\s.,!?()-]/g;

    // Filter out invalid characters, keeping only valid ones
    const filteredText = pastedText.match(sinhalaAlphanumericRegex)?.join('') || '';

    // Insert the filtered text at cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;

    target.value = currentValue.substring(0, start) + filteredText + currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + filteredText.length;
    target.setSelectionRange(newPosition, newPosition);

    // Trigger input event for Angular form validation
    target.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // Prevent invalid Tamil characters (allow Tamil unicode, numbers, spaces, and common punctuation)
  preventInvalidTamilAlphanumericCharacters(event: KeyboardEvent): void {
    const char = event.key;

    // Allow control keys
    if (event.ctrlKey || event.altKey || event.metaKey ||
      char === 'Backspace' || char === 'Delete' || char === 'Tab' ||
      char === 'Escape' || char === 'Enter' || char === 'ArrowLeft' ||
      char === 'ArrowRight' || char === 'ArrowUp' || char === 'ArrowDown' ||
      char === 'Home' || char === 'End') {
      return;
    }

    // Allow Tamil characters, numbers, spaces, and common punctuation
    const tamilAlphanumericRegex = /^[\u0B80-\u0BFF0-9\s.,!?()-]$/;
    if (!tamilAlphanumericRegex.test(char)) {
      event.preventDefault();
    }
  }

  // Validate and filter pasted Tamil content
  validateTamilPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedText = event.clipboardData?.getData('text') || '';
    const tamilAlphanumericRegex = /[\u0B80-\u0BFF0-9\s.,!?()-]/g;

    // Filter out invalid characters, keeping only valid ones
    const filteredText = pastedText.match(tamilAlphanumericRegex)?.join('') || '';

    // Insert the filtered text at cursor position
    const target = event.target as HTMLInputElement | HTMLTextAreaElement;
    const start = target.selectionStart || 0;
    const end = target.selectionEnd || 0;
    const currentValue = target.value;

    target.value = currentValue.substring(0, start) + filteredText + currentValue.substring(end);

    // Set cursor position after inserted text
    const newPosition = start + filteredText.length;
    target.setSelectionRange(newPosition, newPosition);

    // Trigger input event for Angular form validation
    target.dispatchEvent(new Event('input', { bubbles: true }));
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
        () => { }
      );
  }

  deleteFeedback(feedbackId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This will delete the feedback option and re-order the subsequent feedback option entries',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.plantcareUsersService.deleteFeedback(feedbackId).subscribe({
          next: () => {
            Swal.fire(
              'Deleted!',
              'Feedback option has been deleted',
              'success'
            );
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
