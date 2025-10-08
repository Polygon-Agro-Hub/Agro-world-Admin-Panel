import { Component, OnInit } from '@angular/core';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders,
} from '@angular/common/http';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  
} from '@angular/forms';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { NewsService } from '../../../services/plant-care/news.service';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { QuillModule } from 'ngx-quill';
import { Calendar, CalendarModule } from 'primeng/calendar';

interface NewsItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  status: string;
  publishDate: string;
  expireDate: string;
  createdAt: string;
  image: string;
}

@Component({
  selector: 'app-create-news',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    QuillModule,
    LoadingSpinnerComponent,
    CalendarModule,
  ],
  templateUrl: './create-news.component.html',
  styleUrls: ['./create-news.component.css'],
  providers: [DatePipe]
})
export class CreateNewsComponent {
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  createNewsObj: CreateNews = new CreateNews();
  validatedObj: CreateNews = new CreateNews();
  selectedFile: File | null = null;
  itemId: number | null = null;
  newsItems: NewsItem[] = [];
  selectedFileName: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  htmlContent: any;
  isSinhalaValid: boolean = true;
  isEnglishValid: boolean = true;
  isOnlyNumbers: boolean = false;
  isTamilValid: boolean = true;
  isLoading = false;
  createDate: string = '';
  expireDate: string = '';
  today: string = this.getTodayDate();
  isPublishAfterExpireValid: boolean = true;
  isPublishAfterExpireValidEditNews: boolean = true;
  currentPublishDate: string = '';
  currentExpireDate: string = '';

  originalPublishDate: Date | null = null;
  originalExpireDate: Date | null = null;

  todayDate: Date = new Date();

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ size: ['large', 'huge'] }],
      [{ align: [] }],
      ['clean'],
      [{ font: [] }],
    ],
    syntax: false,
    modules: {
      clipboard: {
        matchVisual: false,
        matchers: [
          [
            'span',
            (node: { style: { fontSize: any } }, delta: any) => {
              // Remove font-size styles from pasted content
              if (node.style && node.style.fontSize) {
                delete node.style.fontSize;
              }
              return delta;
            },
          ],
        ],
      },
    },
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router,
    private tokenService: TokenService,
    private location: Location,
    private datePipe: DatePipe
  ) {}

  validateTitleEnglish(value: string): void {
    // Trim leading spaces
    const trimmedValue = value.trimStart();
    if (trimmedValue !== value) {
      // Update the model with trimmed value
      if (this.itemId === null) {
        this.createNewsObj.titleEnglish = trimmedValue;
      } else {
        this.newsItems[0].titleEnglish = trimmedValue;
      }
    }

    const regex = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/;
    this.isEnglishValid = regex.test(trimmedValue);
  }

  isEnglishOnly(input: string): string {
    const englishRegex =
      /^[\u0041-\u005A\u0061-\u007A\u0030-\u0039\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    return input;
  }

  isSinhalaAndNumberOnly(input: string): string {
    // Trim leading spaces
    const trimmedInput = input.trimStart();

    const sinhalaAndNumberRegex =
      /^[\u0D80-\u0DFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    this.isSinhalaValid = sinhalaAndNumberRegex.test(trimmedInput);

    return trimmedInput;
  }

  isTamilAndNumberOnly(input: string): string {
    const tamilRegex =
      /^[\u0B80-\u0BFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    this.isTamilValid = tamilRegex.test(input.trim());
    return input;
  }

createNews() {
  console.log('clicked');
  console.log(this.createNewsObj);

  const missingFields: string[] = [];

  // Validation for required fields
  if (!this.createNewsObj.titleEnglish || this.createNewsObj.titleEnglish.trim() === '') {
    missingFields.push('Title (English) is Required');
  }

  if (!this.createNewsObj.descriptionEnglish || this.createNewsObj.descriptionEnglish.trim() === '') {
    missingFields.push('Description (English) is Required');
  }

  if (!this.createNewsObj.titleSinhala || this.createNewsObj.titleSinhala.trim() === '') {
    missingFields.push('Title (Sinhala) is Required');
  }

  if (!this.createNewsObj.descriptionSinhala || this.createNewsObj.descriptionSinhala.trim() === '') {
    missingFields.push('Description (Sinhala) is Required');
  }

  if (!this.createNewsObj.titleTamil || this.createNewsObj.titleTamil.trim() === '') {
    missingFields.push('Title (Tamil) is Required');
  }

  if (!this.createNewsObj.descriptionTamil || this.createNewsObj.descriptionTamil.trim() === '') {
    missingFields.push('Description (Tamil) is Required');
  }

  if (!this.originalPublishDate || this.formatDateForBackend(this.originalPublishDate).trim() === '') {
    missingFields.push('Publish Date is Required');
  }

  if (!this.originalExpireDate || this.formatDateForBackend(this.originalExpireDate).trim() === '') {
    missingFields.push('Expire Date is Required');
  }

  if (!this.isPublishAfterExpireValid) {
    missingFields.push('Publish and Expire Dates - Publish date must be before expire date');
  }

  if (!this.selectedFile) {
    missingFields.push('Image - Please upload an image');
  }

  // Display validation errors if any
  if (missingFields.length > 0) {
    let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
    missingFields.forEach((field) => {
      errorMessage += `<li>${field}</li>`;
    });
    errorMessage += '</ul></div>';

    Swal.fire({
      icon: 'error',
      title: 'Missing or Invalid Information',
      html: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });
    return;
  }

  // Validate image type
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (this.selectedFile && !allowedTypes.includes(this.selectedFile.type)) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Image Type',
      text: 'Only JPEG and PNG images are allowed. Please upload a valid image.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    this.selectedFile = null;
    return;
  }

  // Validate language-specific fields
  const formData = new FormData();
  const titleEnglish = this.isEnglishOnly(this.createNewsObj.titleEnglish);
  const descriptionEnglish = this.isEnglishOnly(this.createNewsObj.descriptionEnglish);
  const titleSinhala = this.isSinhalaAndNumberOnly(this.createNewsObj.titleSinhala);
  const descriptionSinhala = this.isSinhalaAndNumberOnly(this.createNewsObj.descriptionSinhala);
  const titleTamil = this.isTamilAndNumberOnly(this.createNewsObj.titleTamil);
  const descriptionTamil = this.isTamilAndNumberOnly(this.createNewsObj.descriptionTamil);

  if (
    titleEnglish === '' ||
    descriptionEnglish === '' ||
    titleSinhala === '' ||
    descriptionSinhala === '' ||
    titleTamil === '' ||
    descriptionTamil === ''
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Input',
      text: 'One or more fields contain invalid characters. Please ensure titles and descriptions use the correct language characters.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  this.createNewsObj.publishDate = this.formatDates(this.originalPublishDate)
  this.createNewsObj.expireDate = this.formatDates(this.originalExpireDate)

  // Append validated data to FormData
  formData.append('titleEnglish', titleEnglish);
  formData.append('descriptionEnglish', descriptionEnglish);
  formData.append('titleSinhala', titleSinhala);
  formData.append('descriptionSinhala', descriptionSinhala);
  formData.append('titleTamil', titleTamil);
  formData.append('descriptionTamil', descriptionTamil);
  formData.append('status', this.createNewsObj.status);
  formData.append('publishDate', this.createNewsObj.publishDate);
  formData.append('expireDate', this.createNewsObj.expireDate);
  if (this.selectedFile) {
    formData.append('image', this.selectedFile);
  }

  // Confirmation dialog
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to create this news item?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, create it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      this.newsService.createNews(formData).subscribe({
        next: (res: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'News created successfully!',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          }).then(() => {
            this.createNewsObj = new CreateNews();
            this.selectedFile = null;
            this.selectedImage = null;
            this.selectedLanguage = 'english';
            this.router.navigate(['/plant-care/action/manage-content']);
          });
        },
        error: (error: any) => {
          this.isLoading = false;
          let errorMessage = 'An unexpected error occurred';
          if (error.error && error.error.error) {
            switch (error.error.error) {
              case 'Invalid file format':
                errorMessage = 'Invalid file format. Please upload a valid image.';
                break;
              case 'Duplicate news title':
                errorMessage = 'A news item with this title already exists.';
                break;
              default:
                errorMessage = error.error.error || 'An unexpected error occurred';
            }
          }
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMessage,
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
            },
          });
        },
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'News creation has been cancelled',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  });
}

formatDates(date: Date | null): string {
  return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
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
   this.router.navigate(['/plant-care/action']);
    }
  });
}


  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  triggerFileInput() {
    const fileInput = document.getElementById('imageUpload') as HTMLElement;
    fileInput.click();
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.selectedImage = e.target?.result as string | ArrayBuffer;
      };
      reader.readAsDataURL(file);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.itemId = params['id'] ? +params['id'] : null;
    });

    if (this.itemId) {
      this.getNewsById(this.itemId);
    }
  }

  getNewsById(id: any) {
    this.isLoading = true;
    this.newsService.getNewsById(id).subscribe(
      (data) => {
        data.forEach((newsItem: any) => {
          if (newsItem.publishDate) {
            newsItem.publishDate = this.formatDate(newsItem.publishDate);
            this.currentPublishDate;
          }
          if (newsItem.expireDate) {
            newsItem.expireDate = this.formatDate(newsItem.expireDate);
          }
        });
        this.newsItems = data;
        this.currentPublishDate = this.newsItems[0].publishDate;
        this.currentExpireDate = this.newsItems[0].expireDate;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  formatDate(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

updateNews() {
  // Check for valid token
  const token = this.tokenService.getToken();
  if (!token) {
    Swal.fire({
      icon: 'error',
      title: 'Authentication Error',
      text: 'No valid token found. Please log in again.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  const missingFields: string[] = [];

  // Validation for required fields
  if (!this.newsItems[0].titleEnglish || this.newsItems[0].titleEnglish.trim() === '') {
    missingFields.push('Title (English) is Required');
  }

  if (!this.newsItems[0].descriptionEnglish || this.newsItems[0].descriptionEnglish.trim() === '') {
    missingFields.push('Description (English) is Required');
  }

  if (!this.newsItems[0].titleSinhala || this.newsItems[0].titleSinhala.trim() === '') {
    missingFields.push('Title (Sinhala) is Required');
  }

  if (!this.newsItems[0].descriptionSinhala || this.newsItems[0].descriptionSinhala.trim() === '') {
    missingFields.push('Description (Sinhala) is Required');
  }

  if (!this.newsItems[0].titleTamil || this.newsItems[0].titleTamil.trim() === '') {
    missingFields.push('Title (Tamil) is Required');
  }

  if (!this.newsItems[0].descriptionTamil || this.newsItems[0].descriptionTamil.trim() === '') {
    missingFields.push('Description (Tamil) is Required');
  }

  if (!this.newsItems[0].publishDate || this.newsItems[0].publishDate.trim() === '') {
    missingFields.push('Publish Date is Required');
  }

  if (!this.newsItems[0].expireDate || this.newsItems[0].expireDate.trim() === '') {
    missingFields.push('Expire Date is Required');
  }

  if (!this.isPublishAfterExpireValid) {
    missingFields.push('Publish and Expire Dates - Publish date must be before expire date');
  }

  // Display validation errors if any
  if (missingFields.length > 0) {
    let errorMessage = '<div class="text-left"><p class="mb-2">Please fix the following issues:</p><ul class="list-disc pl-5">';
    missingFields.forEach((field) => {
      errorMessage += `<li>${field}</li>`;
    });
    errorMessage += '</ul></div>';

    Swal.fire({
      icon: 'error',
      title: 'Missing or Invalid Information',
      html: errorMessage,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
        htmlContainer: 'text-left',
      },
    });
    return;
  }

  // Validate language-specific fields
  const formData = new FormData();
  const titleEnglish = this.isEnglishOnly(this.newsItems[0].titleEnglish);
  const descriptionEnglish = this.isEnglishOnly(this.newsItems[0].descriptionEnglish);
  const titleSinhala = this.isSinhalaAndNumberOnly(this.newsItems[0].titleSinhala);
  const descriptionSinhala = this.isSinhalaAndNumberOnly(this.newsItems[0].descriptionSinhala);
  const titleTamil = this.isTamilAndNumberOnly(this.newsItems[0].titleTamil);
  const descriptionTamil = this.isTamilAndNumberOnly(this.newsItems[0].descriptionTamil);

  if (
    titleEnglish === '' ||
    descriptionEnglish === '' ||
    titleSinhala === '' ||
    descriptionSinhala === '' ||
    titleTamil === '' ||
    descriptionTamil === ''
  ) {
    Swal.fire({
      icon: 'error',
      title: 'Invalid Input',
      text: 'One or more fields contain invalid characters. Please ensure titles and descriptions use the correct language characters.',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
        title: 'font-semibold text-lg',
      },
    });
    return;
  }

  // Append validated data to FormData
  formData.append('titleEnglish', titleEnglish);
  formData.append('descriptionEnglish', descriptionEnglish);
  formData.append('titleSinhala', titleSinhala);
  formData.append('descriptionSinhala', descriptionSinhala);
  formData.append('titleTamil', titleTamil);
  formData.append('descriptionTamil', descriptionTamil);
  formData.append('publishDate', this.newsItems[0].publishDate);
  formData.append('expireDate', this.newsItems[0].expireDate);
  if (this.newsItems[0].status) {
    formData.append('status', this.newsItems[0].status);
  }
  if (this.selectedFile) {
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(this.selectedFile.type)) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Image Type',
        text: 'Only JPEG and PNG images are allowed. Please upload a valid image.',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
      this.selectedFile = null;
      return;
    }
    formData.append('image', this.selectedFile);
  }

  // Confirmation dialog
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you want to update this news item?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes, update it!',
    cancelButtonText: 'No, cancel',
    reverseButtons: true,
    customClass: {
      popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
      title: 'font-semibold text-lg',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      this.isLoading = true;
      const headers = new HttpHeaders({
        Authorization: `Bearer ${token}`,
      });

      this.http
        .put(`${environment.API_URL}auth/edit-news/${this.itemId}`, formData, { headers })
        .subscribe({
          next: (res: any) => {
            this.isLoading = false;
            Swal.fire({
              icon: 'success',
              title: 'Success',
              text: 'News updated successfully!',
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            }).then(() => {
              this.router.navigate(['/plant-care/action/manage-content']);
            });
          },
          error: (error: any) => {
            this.isLoading = false;
            let errorMessage = 'An unexpected error occurred';
            if (error.error && error.error.error) {
              switch (error.error.error) {
                case 'Invalid file format':
                  errorMessage = 'Invalid file format. Please upload a valid image.';
                  break;
                case 'Duplicate news title':
                  errorMessage = 'A news item with this title already exists.';
                  break;
                default:
                  errorMessage = error.error.error || 'An unexpected error occurred';
              }
            }
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage,
              confirmButtonText: 'OK',
              customClass: {
                popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
                title: 'font-semibold text-lg',
              },
            });
          },
        });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Cancelled',
        text: 'News update has been cancelled',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
          title: 'font-semibold text-lg',
        },
      });
    }
  });
}

  onDeleteImage() {
    if (this.newsItems[0]) {
      this.newsItems[0].image = '';
    }
  }

  onCancel() {
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
    buttonsStyling: true,
  }).then((result) => {
    if (result.isConfirmed) {
       this.location.back(); // This will navigate to the previous page
    }
  });
}

onDateChange(date: Date | null) {
  this.originalPublishDate = date;
  console.log('publishDate', this.originalPublishDate)
  this.checkPublishDate();
  this.checkPublishExpireDate();
}

onExpireDateChange(date: Date | null) {
  this.originalExpireDate = date
  console.log('expireDate', this.originalExpireDate)
  this.checkExpireDate();
}

formatDateForBackend(date: Date | null): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


  getTodayDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  checkPublishDate() {
    console.log('checkPublishDate called')
    console.log('today', this.todayDate)
  if (this.originalPublishDate) {
    this.todayDate.setHours(0, 0, 0, 0);
    if (this.originalPublishDate < this.todayDate) {
      setTimeout(() => {
        this.originalPublishDate = null;
      });
      Swal.fire({
            icon: 'error',
            title: 'Missing or Invalid Information',
            html: 'Publish date should be later than Today',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
            },
          });
      console.log('ordginal publish date', this.originalPublishDate)
    }
  }
}

  checkPublishDateEditNews() {
  if (this.newsItems[0].publishDate < this.today) {
    this.newsItems[0].publishDate = this.currentPublishDate;
  }
}

  checkExpireDate() {
    console.log('called')

    if (this.originalExpireDate) {
      console.log('expireDate', this.originalExpireDate)
      if (this.originalPublishDate) {
        if (this.originalExpireDate <= this.originalPublishDate) {
          setTimeout(() => {
            this.originalExpireDate = null;
          });
          Swal.fire({
            icon: 'error',
            title: 'Missing or Invalid Information',
            html: 'Expire date should be later than Publish date',
            confirmButtonText: 'OK',
            customClass: {
              popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
              title: 'font-semibold text-lg',
              htmlContainer: 'text-left',
            },
          });
          return;
        }
      }
      this.todayDate.setHours(0, 0, 0, 0);
  
      if (this.originalExpireDate < this.todayDate) {
        setTimeout(() => {
          this.originalExpireDate = null;
        });
        Swal.fire({
          icon: 'error',
          title: 'Missing or Invalid Information',
          html: 'Expire date should be later than Today',
          confirmButtonText: 'OK',
          customClass: {
            popup: 'bg-tileLight dark:bg-tileBlack text-black dark:text-white',
            title: 'font-semibold text-lg',
            htmlContainer: 'text-left',
          },
        });
        return;
      }
    }
  
    // If both dates are valid, do further checks
    if (this.originalPublishDate && this.originalExpireDate) {
      this.checkPublishExpireDate();
    }
}


  checkExpireDateEditNews() {
  // Remove the Swal.fire popup and just update the validation flag
  if (this.newsItems[0].publishDate && this.newsItems[0].expireDate) {
    this.checkPublishExpireDateEditNews();
  }
}

  checkPublishExpireDate() {
    console.log('checkPublishexpireDate called')
  if (this.originalPublishDate && this.originalExpireDate) {
    // const publishDate = new Date(this.createNewsObj.publishDate);
    // const expireDate = new Date(this.createNewsObj.expireDate);
    this.isPublishAfterExpireValid = this.originalPublishDate <= this.originalExpireDate;
  } else {
    this.isPublishAfterExpireValid = true;
  }
}

  checkPublishExpireDateEditNews() {
  if (this.newsItems[0].publishDate && this.newsItems[0].expireDate) {
    const publishDate = new Date(this.newsItems[0].publishDate);
    const expireDate = new Date(this.newsItems[0].expireDate);
    this.isPublishAfterExpireValidEditNews = publishDate <= expireDate;
  } else {
    this.isPublishAfterExpireValidEditNews = true;
  }
}






  backEdit(): void {
    this.router.navigate(['/plant-care/action/manage-content']);
  }

  // Add this method to your component class
  preventLeadingSpace(event: KeyboardEvent, fieldName: string): void {
    const input = event.target as HTMLInputElement;
    const currentValue = input.value;

    // If the field is empty and user tries to type a space, prevent it
    if (currentValue.length === 0 && event.key === ' ') {
      event.preventDefault();
      return;
    }

    // If the field only contains spaces and user tries to add another space, prevent it
    if (currentValue.trim().length === 0 && event.key === ' ') {
      event.preventDefault();
      return;
    }
  }

  onEnglishTitleChange(value: string): void {
  // Capitalize first letter
  let capitalizedValue = value;
  if (value.length > 0) {
    capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
  }
  
  const trimmedValue = capitalizedValue.trimStart();
  if (this.itemId === null) {
    this.createNewsObj.titleEnglish = trimmedValue;
  } else {
    this.newsItems[0].titleEnglish = trimmedValue;
  }
  this.validateTitleEnglish(trimmedValue);
}

onEnglishTitleBlur(event: FocusEvent): void {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  if (value.length > 0) {
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    if (this.itemId === null) {
      this.createNewsObj.titleEnglish = capitalizedValue;
    } else {
      this.newsItems[0].titleEnglish = capitalizedValue;
    }
  }
}
  onSinhalaTitleChange(value: string): void {
    const trimmedValue = value.trimStart();
    if (this.itemId === null) {
      this.createNewsObj.titleSinhala = trimmedValue;
    } else {
      this.newsItems[0].titleSinhala = trimmedValue;
    }
    this.isSinhalaAndNumberOnly(trimmedValue);
  }

  onTamilTitleChange(value: string): void {
    const trimmedValue = value.trimStart();
    if (this.itemId === null) {
      this.createNewsObj.titleTamil = trimmedValue;
    } else {
      this.newsItems[0].titleTamil = trimmedValue;
    }
    this.isTamilAndNumberOnly(trimmedValue);
  }


  // Add this property to your component
private quillEditor: any;

// Editor created event handler
onEditorCreated(editor: any): void {
  this.quillEditor = editor;
  
  // Prevent space at the beginning
  editor.root.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key === ' ') {
      const selection = editor.getSelection();
      if (selection && selection.index === 0) {
        event.preventDefault();
      }
    }
  });
}

// Content change handler
onEnglishDescriptionChange(): void {
  if (this.quillEditor) {
    const content = this.quillEditor.root.innerHTML;
    if (content === '<p><br></p>' || content === '<p></p>') {
      return; // Allow empty content
    }
    
    // Check if content starts with space
    const textContent = this.quillEditor.getText();
    if (textContent.startsWith(' ')) {
      // Remove leading spaces
      const newContent = textContent.replace(/^\s+/, '');
      this.quillEditor.setText(newContent);
      
      // Set cursor to beginning
      this.quillEditor.setSelection(0, 0);
    }
  }
}
}

export class CreateNews {
  titleEnglish: string = '';
  titleSinhala: string = '';
  titleTamil: string = '';
  descriptionEnglish: string = '';
  descriptionSinhala: string = '';
  descriptionTamil: string = '';
  publishDate: string = '';
  expireDate: string = '';
  status: string = 'Draft';

  createdBy: any = localStorage.getItem('userId:');
}
