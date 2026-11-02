import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import Swal from 'sweetalert2';
import { SalesDashService } from '../../../services/sales-dash/sales-dash.service';

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-onboard-w-buyers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DropdownModule],
  templateUrl: './onboard-w-buyers.component.html',
  styleUrl: './onboard-w-buyers.component.css',
})
export class OnboardWBuyersComponent implements OnInit {
  isLoading = false;
  isDragging = false;
  submitted = false;

  form: FormGroup;

  agentOptions: Option[] = [];

  titleOptions: Option[] = [
    { label: 'Mr.', value: 'Mr.' },
    { label: 'Mrs.', value: 'Mrs.' },
    { label: 'Ms.', value: 'Ms.' },
    { label: 'Rev.', value: 'Rev.' },
  ];

  countryCodeOptions: Option[] = [
    { label: '+94', value: '+94' },
    { label: '+91', value: '+91' },
    { label: '+1', value: '+1' },
    { label: '+44', value: '+44' },
  ];

  identificationOptions: Option[] = [
    { label: 'NIC Number', value: 'NIC' },
    { label: 'Passport ID', value: 'PASSPORT' },
  ];

  // BR document
  selectedFile: File | null = null;
  fileError = '';
  readonly allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  private readonly nicPattern = /^([0-9]{9}[vV]|[0-9]{12})$/;
  private readonly passportPattern = /^[A-Za-z][0-9]{7}$/;

  constructor(
    private fb: FormBuilder,
    private location: Location,
    private salesAgentService: SalesDashService,
  ) {
    this.form = this.fb.group({
      agent: [null, Validators.required],
      title: ['Mr.', Validators.required],
      firstName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
      ],
      lastName: [
        '',
        [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)],
      ],
      phoneCode: ['+94', Validators.required],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^7[0-9]{8}$/)],
      ],
      email: ['', [Validators.required, Validators.email]],
      identificationType: ['NIC', Validators.required],
      identificationNumber: [
        '',
        [Validators.required, this.idValidator.bind(this)],
      ],
      companyName: ['', Validators.required],
      companyPhoneCode: ['+94', Validators.required],
      companyPhoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{9}$/)],
      ],
    });

    // Reset the ID number when switching between NIC and Passport
    this.form.get('identificationType')!.valueChanges.subscribe(() => {
      const ctrl = this.form.get('identificationNumber')!;
      ctrl.reset('');
      ctrl.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadAgents();
  }

  loadAgents(): void {
    this.isLoading = true;
    this.salesAgentService.getSalesAgents().subscribe({
      next: (res) => {
        this.agentOptions = res.salesAgents;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading agents', err);
        this.isLoading = false;
      },
    });
  }

  get isNic(): boolean {
    return this.form.get('identificationType')?.value === 'NIC';
  }

  get idLabel(): string {
    return this.isNic ? 'NIC Number' : 'Passport ID';
  }

  get idPlaceholder(): string {
    return this.isNic ? '123456789V or 123456789012' : 'N1234567';
  }

  private idValidator(control: AbstractControl): ValidationErrors | null {
    const value = (control.value || '').toString().trim();
    if (!value) return null; // handled by required
    const type = this.form?.get('identificationType')?.value;
    const pattern =
      type === 'PASSPORT' ? this.passportPattern : this.nicPattern;
    return pattern.test(value) ? null : { pattern: true };
  }

  // ---------- helpers ----------
  isInvalid(name: string): boolean {
    const c = this.form.get(name);
    return !!c && c.invalid && (c.dirty || c.touched || this.submitted);
  }

  hasError(name: string, error: string): boolean {
    return this.isInvalid(name) && !!this.form.get(name)?.errors?.[error];
  }

  /** Same messages as the inline errors, collected for the popup. */
  private collectValidationMessages(): string[] {
    const msgs: string[] = [];
    const err = (name: string, key: string) =>
      !!this.form.get(name)?.errors?.[key];

    if (err('agent', 'required')) msgs.push('Agent is required.');

    if (err('firstName', 'required')) msgs.push('First name is required.');
    else if (err('firstName', 'pattern'))
      msgs.push('First name should only contain letters.');

    if (err('lastName', 'required')) msgs.push('Last name is required.');
    else if (err('lastName', 'pattern'))
      msgs.push('Last name should only contain letters.');

    if (err('phoneNumber', 'required')) msgs.push('Phone number is required.');
    else if (err('phoneNumber', 'pattern'))
      msgs.push('Enter a valid mobile number (7XXXXXXXX).');

    if (err('email', 'required')) msgs.push('Email address is required.');
    else if (err('email', 'email')) msgs.push('Enter a valid email address.');

    if (err('identificationNumber', 'required'))
      msgs.push(`${this.idLabel} is required.`);
    else if (err('identificationNumber', 'pattern'))
      msgs.push(
        this.isNic
          ? "Enter a valid NIC number (12 digits, or 9 digits followed by 'V')."
          : 'Enter a valid passport ID (1 letter followed by 7 digits).',
      );

    if (err('companyName', 'required')) msgs.push('Company name is required.');

    if (err('companyPhoneNumber', 'required'))
      msgs.push('Company phone number is required.');
    else if (err('companyPhoneNumber', 'pattern'))
      msgs.push('Enter a valid company phone number (9 digits).');

    if (!this.selectedFile) msgs.push('BR document is required.');
    else if (this.fileError) msgs.push(this.fileError);

    return msgs;
  }

  private showValidationPopup(messages: string[]): void {
    const items = messages
      .map((m) => `<li style="margin-bottom:6px;">${m}</li>`)
      .join('');

    Swal.fire({
      icon: 'warning',
      title: 'Please fix the following',
      html: `<ul style="text-align:left; padding-left:1.25rem; list-style:disc;">${items}</ul>`,
      confirmButtonColor: '#3980C0',
    });
  }

  onDigitsOnlyKeyPress(event: KeyboardEvent): void {
    if (!/[0-9]/.test(event.key)) event.preventDefault();
  }

  onDigitsOnlyInput(
    event: Event,
    controlName: string,
    maxLength: number,
  ): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^0-9]/g, '').slice(0, maxLength);
    input.value = cleaned;
    this.form.get(controlName)?.setValue(cleaned, { emitEvent: false });
  }

  onNameInput(event: Event, controlName: string): void {
    const input = event.target as HTMLInputElement;
    const cleaned = input.value.replace(/[^A-Za-z\s]/g, '');
    input.value = cleaned;
    this.form.get(controlName)?.setValue(cleaned, { emitEvent: false });
  }

  onIdentificationInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const max = this.isNic ? 12 : 8;
    const cleaned = input.value
      .replace(/[^0-9A-Za-z]/g, '')
      .toUpperCase()
      .slice(0, max);
    input.value = cleaned;
    this.form.get('identificationNumber')?.setValue(cleaned);
  }

  // ---------- file upload ----------
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      this.setFile(input.files[0]);
    }
    input.value = ''; // allow re-selecting the same file
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) this.setFile(file);
  }

  private setFile(file: File): void {
    this.fileError = '';
    if (!this.allowedTypes.includes(file.type)) {
      this.fileError = 'Only .jpg, .png or .pdf files are allowed.';
      return;
    }
    if (file.size > this.maxFileSize) {
      this.fileError = 'File size must be 5MB or less.';
      return;
    }
    this.selectedFile = file;
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.fileError = '';
  }

  get isPdf(): boolean {
    return this.selectedFile?.type === 'application/pdf';
  }

  get fileSizeLabel(): string {
    if (!this.selectedFile) return '';
    const mb = this.selectedFile.size / (1024 * 1024);
    if (mb >= 1) return `${parseFloat(mb.toFixed(1))}MB`;
    const kb = this.selectedFile.size / 1024;
    return `${Math.max(1, Math.round(kb))}KB`;
  }

  // ---------- actions ----------
  back(): void {
    this.location.back();
  }

  onCancel(): void {
    this.location.back();
  }

  onSubmit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (!this.selectedFile && !this.fileError) {
      this.fileError = 'BR document is required.';
    }

    // Inline messages stay on the form; the popup lists the same messages
    if (this.form.invalid || !this.selectedFile) {
      this.showValidationPopup(this.collectValidationMessages());
      return;
    }

    const v = this.form.value;
    const formData = new FormData();
    formData.append('salesAgent', v.agent);
    formData.append('title', v.title);
    formData.append('firstName', v.firstName);
    formData.append('lastName', v.lastName);
    formData.append('phoneCode', v.phoneCode);
    formData.append('phoneNumber', v.phoneNumber);
    formData.append('email', v.email);
    formData.append('docType', v.identificationType);
    formData.append('nic', v.identificationNumber);
    formData.append('companyName', v.companyName);
    formData.append('companyPhoneCode', v.companyPhoneCode);
    formData.append('companyPhone', v.companyPhoneNumber);
    formData.append('brDocument', this.selectedFile); // must match multer field name

    this.isLoading = true;
    this.salesAgentService.onboardWholesaleCustomer(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Sent for Approval',
          text:
            res?.message ||
            'Wholesale customer onboarded and sent for approval.',
          confirmButtonColor: '#3980C0',
        }).then(() => {
          this.location.back();
        });
      },
      error: (err) => {
        this.isLoading = false;
        // 409 = duplicate email/phone/NIC, 400 = validation error
        Swal.fire({
          icon: 'error',
          title: 'Could not onboard customer',
          text: err?.error?.error || 'Something went wrong. Please try again.',
          confirmButtonColor: '#3980C0',
        });
      },
    });
  }
}
