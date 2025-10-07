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
        this.router.navigate(['/plant-care/action/view-questionnaires']);
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
              this.router.navigate(['/plant-care/action/view-questionnaires']);
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
      editing: [true], // Start in editing mode for new questions
    });
    this.questions.push(group);
  }

  deleteQuestion(index: number): void {
    const question = this.questions.at(index);
    const questionId = question.value.id;

    if (questionId) {
      // Existing question - show confirmation
      Swal.fire({
        title: 'Are you sure?',
        text: 'This question will be permanently deleted!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      }).then((result) => {
        if (result.isConfirmed) {
          this.isLoading = true;
          this.certificateCompanyService
            .deleteQuestionnaire(questionId)
            .subscribe({
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
        }
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
      // New question - remove it
      this.questions.removeAt(index);
      this.renumberQuestions();
    }
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
    this.location.back();
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
          this.router.navigate(['/plant-care/action/view-questionnaires']);
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

  goBack(): void {
    this.location.back();
  }
}
