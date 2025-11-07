import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import Swal from 'sweetalert2';
import { CertificateCompanyService } from '../../../services/plant-care/certificate-company.service';

@Component({
  selector: 'app-add-questionnaires',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './add-questionnaire-details.component.html',
  styleUrls: ['./add-questionnaire-details.component.css'],
})
export class AddQuestionnaireDetailsComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private certificateCompanyService: CertificateCompanyService,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      certificateId: [null, Validators.required],
      questions: this.fb.array([]),
    });

    // Pre-fill certificateId from route
    this.route.paramMap.subscribe((params) => {
      const certId = params.get('certificateId');
      if (certId) {
        this.form.get('certificateId')?.setValue(Number(certId));
      }
    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  // Add question (frontend uses snake_case, backend will get human-readable)
  addQuestion(type: 'tick_off' | 'photo_proof'): void {
    const qNo = this.questions.length + 1;
    const group = this.fb.group({
      qNo: [qNo],
      type: [type, Validators.required],
      qEnglish: ['', Validators.required],
      qSinhala: ['', Validators.required],
      qTamil: ['', Validators.required],
      done: [false],
      editing: [false],
    });
    this.questions.push(group);
  }

  deleteQuestion(index: number): void {
    this.questions.removeAt(index);
    this.questions.controls.forEach((ctrl, i) => {
      ctrl.get('qNo')?.setValue(i + 1);
    });
  }

  // Check if a specific question has all required fields filled
  isQuestionValid(index: number): boolean {
    const questionGroup = this.questions.at(index) as FormGroup;
    const qEnglishValid = questionGroup.get('qEnglish')?.valid ?? false;
    const qSinhalaValid = questionGroup.get('qSinhala')?.valid ?? false;
    const qTamilValid = questionGroup.get('qTamil')?.valid ?? false;

    return qEnglishValid && qSinhalaValid && qTamilValid;
  }

  // Check if there's any incomplete question
  hasIncompleteQuestion(): boolean {
    return this.questions.controls.some(
      (question) =>
        !(question.get('done')?.value ?? false) &&
        !(question.get('editing')?.value ?? false)
    );
  }

  // Check if any question is currently being edited OR incomplete
  isAnyQuestionEditing(): boolean {
    return this.questions.controls.some((question) => {
      const isEditing = question.get('editing')?.value ?? false;
      const isDone = question.get('done')?.value ?? false;
      return isEditing || !isDone;
    });
  }

  // Check if form is valid for submission
  isFormValid(): boolean {
    return (
      this.form.valid &&
      this.questions.length > 0 &&
      !this.hasIncompleteQuestion()
    );
  }

  markDone(index: number): void {
    const group = this.questions.at(index);
    if (this.isQuestionValid(index)) {
      group.get('done')?.setValue(true);
      group.get('editing')?.setValue(false);
    }
  }

  markEditing(index: number): void {
    // Reset all other questions from editing mode
    this.questions.controls.forEach((question, i) => {
      if (i !== index) {
        question.get('editing')?.setValue(false);
      }
    });

    const group = this.questions.at(index);
    group.get('editing')?.setValue(true);
    group.get('done')?.setValue(false);
  }

  updateQuestion(index: number): void {
    const group = this.questions.at(index);
    if (this.isQuestionValid(index)) {
      group.get('done')?.setValue(true);
      group.get('editing')?.setValue(false);
    }
  }

  cancelEditing(index: number): void {
    const group = this.questions.at(index);
    group.get('editing')?.setValue(false);
    group.get('done')?.setValue(true);

    // Reset form values to their previous state
    group.get('qEnglish')?.setValue(group.get('qEnglish')?.value);
    group.get('qSinhala')?.setValue(group.get('qSinhala')?.value);
    group.get('qTamil')?.setValue(group.get('qTamil')?.value);
  }

  onBack(): void {
    this.location.back();
  }

  onCancel(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after going back!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Go Back',
      cancelButtonText: 'No, Stay Here',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.location.back();
      }
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    // Mark all fields as touched to show validation errors
    this.questions.controls.forEach((question) => {
      question.get('qEnglish')?.markAsTouched();
      question.get('qSinhala')?.markAsTouched();
      question.get('qTamil')?.markAsTouched();
    });

    if (this.form.invalid || !this.isFormValid()) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Input',
        text: 'Please complete all questions before saving.',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      return;
    }

    this.isLoading = true;

    // Map snake_case type to human-readable
    const typeMap: Record<'tick_off' | 'photo_proof', string> = {
      tick_off: 'Tick Off',
      photo_proof: 'Photo Proof',
    };

    const payload = {
      certificateId: this.form.value.certificateId,
      questions: this.questions.value.map((q: any) => {
        const typeKey = q.type as 'tick_off' | 'photo_proof';
        return {
          qNo: q.qNo,
          type: typeMap[typeKey],
          qEnglish: q.qEnglish,
          qSinhala: q.qSinhala,
          qTamil: q.qTamil,
        };
      }),
    };

    this.certificateCompanyService.createQuestionnaire(payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: res.message,
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          this.router.navigate(['/plant-care/action/view-certificate-list']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to save questionnaires.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
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
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold',
      },
      buttonsStyling: true,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/plant-care/action/view-certificate-list']);
      }
    });
  }
  
  
}
