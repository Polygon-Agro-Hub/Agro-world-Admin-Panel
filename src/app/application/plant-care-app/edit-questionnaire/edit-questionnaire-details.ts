import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CertificateCompanyService } from '../../../services/plant-care/certificate-company.service';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-edit-questionnaire-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './edit-questionnaire-details.component.html',
  styleUrls: ['./edit-questionnaire-details.component.css'],
})
export class EditQuestionnaireDetailsComponent implements OnInit {
  form!: FormGroup;
  isLoading = false;
  certificateId!: number;
  questionnaireList: any[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private certificateCompanyService: CertificateCompanyService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      certificateId: [null, Validators.required],
      questions: this.fb.array([]),
    });

    this.route.paramMap.subscribe((params) => {
      const certId = params.get('certificateId');
      if (!certId) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Certificate ID is missing. Please go back and try again.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
        this.router.navigate(['/plant-care/action/view-certificate-list']);
        return;
      }

      this.certificateId = Number(certId);
      this.form.get('certificateId')?.setValue(this.certificateId);
      this.loadQuestionnaires();
    });
  }

  get questions(): FormArray {
    return this.form.get('questions') as FormArray;
  }

  // Load questionnaire list from API
  loadQuestionnaires(): void {
    this.isLoading = true;
    this.certificateCompanyService
      .getQuestionnaireList(this.certificateId)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          if (!res.data || res.data.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'No Questions Found',
              text: 'This certificate does not have any questionnaires yet.',
              customClass: {
                popup:
                  'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            }).then(() => {
              this.router.navigate([
                '/plant-care/action/view-certificate-list',
              ]);
            });
            return;
          }

          this.questionnaireList = res.data;
          this.populateForm(res.data);
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error Loading Data',
            text: err.error?.message || 'Failed to load questionnaires.',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
      });
  }

  populateForm(questionnaires: any[]): void {
    this.questions.clear();
    questionnaires.forEach((q) => {
      const typeKey = q.type === 'Tick Off' ? 'tick_off' : 'photo_proof';
      this.questions.push(
        this.fb.group({
          id: [q.id],
          qNo: [q.qNo],
          type: [typeKey, Validators.required],
          qEnglish: [q.qEnglish, Validators.required],
          qSinhala: [q.qSinhala, Validators.required],
          qTamil: [q.qTamil, Validators.required],
          done: [true],
          editing: [false],
        })
      );
    });
  }

  // Add new question functionality
  addQuestion(type: 'tick_off' | 'photo_proof'): void {
    const qNo = this.questions.length + 1;
    const group = this.fb.group({
      id: [null], // null for new questions
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

  preventLeadingSpace(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    if (event.key === ' ' && input.selectionStart === 0) {
      event.preventDefault();
    }
  }

  deleteQuestion(index: number): void {
    const question = this.questions.at(index);
    const questionId = question.value.id;
    const isQuestionValid = this.isQuestionValid(index);

    // If Done button is enabled (question is valid), show confirmation
    if (isQuestionValid) {
      Swal.fire({
        title: 'Are you sure?',
        text: 'Do you really want to delete this question? This action cannot be undone.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, Delete',
        cancelButtonText: 'No, Cancel',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold',
          confirmButton:
            'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700',
          cancelButton:
            'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 ml-2',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.performDelete(index, questionId);
        }
      });
    } else {
      // If Done button is disabled (question is invalid), delete directly
      this.performDelete(index, questionId);
    }
  }

  private performDelete(index: number, questionId: number | null): void {
    if (questionId) {
      // Existing question - delete from API
      this.isLoading = true;
      this.certificateCompanyService.deleteQuestionnaire(questionId).subscribe({
        next: (res) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Deleted!',
            text: res.message,
            timer: 1500,
            showConfirmButton: false,
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
          this.questions.removeAt(index);
          this.renumberQuestions();
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: err.error?.message || 'Failed to delete questionnaire.',
            customClass: {
              popup:
                'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
      });
    } else {
      // New question - just remove from form
      this.questions.removeAt(index);
      this.renumberQuestions();
    }
  }

  private renumberQuestions(): void {
    this.questions.controls.forEach((ctrl, i) => {
      ctrl.get('qNo')?.setValue(i + 1);
    });
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

  cancelEditing(index: number): void {
    const group = this.questions.at(index);
    const questionId = group.value.id;

    if (questionId) {
      // Existing question - reset to original values
      group.get('editing')?.setValue(false);
      group.get('done')?.setValue(true);

      // Reset form values to their previous state from questionnaireList
      const originalQuestion = this.questionnaireList.find(
        (q) => q.id === questionId
      );
      if (originalQuestion) {
        group.get('qEnglish')?.setValue(originalQuestion.qEnglish);
        group.get('qSinhala')?.setValue(originalQuestion.qSinhala);
        group.get('qTamil')?.setValue(originalQuestion.qTamil);
      }
    } else {
      // New question - just cancel editing mode (don't remove)
      group.get('editing')?.setValue(false);
      group.get('done')?.setValue(false);
    }
  }

  isNewQuestion(index: number): boolean {
    const question = this.questions.at(index);
    return !question.value.id;
  }

  isQuestionValid(index: number): boolean {
    const questionGroup = this.questions.at(index) as FormGroup;
    const qEnglishValid = questionGroup.get('qEnglish')?.valid ?? false;
    const qSinhalaValid = questionGroup.get('qSinhala')?.valid ?? false;
    const qTamilValid = questionGroup.get('qTamil')?.valid ?? false;

    return qEnglishValid && qSinhalaValid && qTamilValid;
  }

  markDone(index: number): void {
    const group = this.questions.at(index);
    if (this.isQuestionValid(index)) {
      group.get('done')?.setValue(true);
      group.get('editing')?.setValue(false);
    }
  }

  updateQuestion(index: number): void {
    const group = this.questions.at(index);
    if (this.isQuestionValid(index)) {
      group.get('done')?.setValue(true);
      group.get('editing')?.setValue(false);
    }
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

  onBack(): void {
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
  // Save all changes - both updates and new questions
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

    // Show confirmation dialog before submitting
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'Do you really want to update the question(s)?',
      showCancelButton: true,
      confirmButtonText: 'Yes, Update',
      cancelButtonText: 'No, Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      customClass: {
        popup: 'bg-white dark:bg-[#363636] text-gray-800 dark:text-white',
        title: 'dark:text-white',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.performSubmission();
      }
    });
  }

  private performSubmission(): void {
    this.isLoading = true;

    // Separate existing and new questions
    const existingQuestions = this.questions.value.filter((q: any) => q.id);
    const newQuestions = this.questions.value.filter((q: any) => !q.id);

    // Map snake_case type to human-readable
    const typeMap: Record<'tick_off' | 'photo_proof', string> = {
      tick_off: 'Tick Off',
      photo_proof: 'Photo Proof',
    };

    // Prepare payload for new questions
    const newQuestionsPayload = {
      certificateId: this.form.value.certificateId,
      questions: newQuestions.map((q: any) => {
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

    // Update existing questions and create new ones
    const updatePromises = existingQuestions.map((q: any) => {
      const typeKey = q.type as 'tick_off' | 'photo_proof';
      const payload = {
        type: typeMap[typeKey],
        qNo: q.qNo,
        qEnglish: q.qEnglish,
        qSinhala: q.qSinhala,
        qTamil: q.qTamil,
      };
      return this.certificateCompanyService
        .updateQuestionnaire(q.id, payload)
        .toPromise();
    });

    const createPromise =
      newQuestions.length > 0
        ? this.certificateCompanyService
            .createQuestionnaire(newQuestionsPayload)
            .toPromise()
        : Promise.resolve();

    // Execute all operations
    Promise.all([...updatePromises, createPromise])
      .then(() => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'All changes saved successfully!',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        }).then(() => {
          this.router.navigate(['/plant-care/action/view-certificate-list']);
        });
      })
      .catch((err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.error?.message || 'Failed to save changes.',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
          },
        });
      });
  }

  onCancle(): void {
    Swal.fire({
      icon: 'warning',
      title: 'Are you sure?',
      text: 'You may lose the added data after canceling!',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep Editing',
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
}
