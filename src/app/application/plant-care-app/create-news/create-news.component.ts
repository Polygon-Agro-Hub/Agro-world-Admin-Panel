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
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { NewsService } from '../../../services/plant-care/news.service';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';
import { QuillModule } from 'ngx-quill';

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
  ],
  templateUrl: './create-news.component.html',
  styleUrls: ['./create-news.component.css'],
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

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ align: [] }],
      ['clean'],
      [{ font: [] }],
    ],
    syntax: false,
    modules: {
      clipboard: {
        matchVisual: false,
      },
    },
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router,
    private tokenService: TokenService
  ) {}

  validateTitleEnglish(value: string): void {
    const regex = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/;
    this.isEnglishValid = regex.test(value.trim());
  }

  isEnglishOnly(input: string): string {
    const englishRegex =
      /^[\u0041-\u005A\u0061-\u007A\u0030-\u0039\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    return input;
  }

  isSinhalaAndNumberOnly(input: string): string {
    const sinhalaAndNumberRegex =
      /^[\u0D80-\u0DFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    this.isSinhalaValid = sinhalaAndNumberRegex.test(input.trim());
    return input;
  }

  isTamilAndNumberOnly(input: string): string {
    const tamilRegex =
      /^[\u0B80-\u0BFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    this.isTamilValid = tamilRegex.test(input.trim());
    return input;
  }

  createNews() {
    if (!this.isPublishAfterExpireValid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Dates',
        text: 'Please check the publish date and expire date again',
      });
      return;
    }

    const missingFields: string[] = [];

    if (this.createNewsObj.titleEnglish.trim() === '') {
      missingFields.push('Title (English)');
    }
    if (this.createNewsObj.descriptionEnglish.trim() === '') {
      missingFields.push('Description (English)');
    }
    if (this.createNewsObj.titleSinhala.trim() === '') {
      missingFields.push('Title (Sinhala)');
    }
    if (this.createNewsObj.descriptionSinhala.trim() === '') {
      missingFields.push('Description (Sinhala)');
    }
    if (this.createNewsObj.titleTamil.trim() === '') {
      missingFields.push('Title (Tamil)');
    }
    if (this.createNewsObj.descriptionTamil.trim() === '') {
      missingFields.push('Description (Tamil)');
    }
    if (this.createNewsObj.publishDate.trim() === '') {
      missingFields.push('Publishe Date');
    }
    if (this.createNewsObj.expireDate.trim() === '') {
      missingFields.push('Expire Date');
    }

    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        html: `<strong>Please fill in the following fields:</strong><ul>${missingFields
          .map((field) => `<li>${field}</li>`)
          .join('')}</ul>`,
      });
      return;
    }

    const formData = new FormData();
    formData.append(
      'titleEnglish',
      this.isEnglishOnly(this.createNewsObj.titleEnglish)
    );
    formData.append(
      'titleSinhala',
      this.isSinhalaAndNumberOnly(this.createNewsObj.titleSinhala)
    );
    formData.append(
      'titleTamil',
      this.isTamilAndNumberOnly(this.createNewsObj.titleTamil)
    );
    formData.append(
      'descriptionEnglish',
      this.isEnglishOnly(this.createNewsObj.descriptionEnglish)
    );
    formData.append(
      'descriptionSinhala',
      this.isSinhalaAndNumberOnly(this.createNewsObj.descriptionSinhala)
    );
    formData.append(
      'descriptionTamil',
      this.isTamilAndNumberOnly(this.createNewsObj.descriptionTamil)
    );
    formData.append('status', this.createNewsObj.status);
    formData.append('publishDate', this.createNewsObj.publishDate);
    formData.append('expireDate', this.createNewsObj.expireDate);
    if (this.selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (!allowedTypes.includes(this.selectedFile.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image Type',
          text: 'Only JPEG and PNG images are allowed. Please upload a valid image.',
        });
        this.selectedFile = null;
        return;
      } else {
        formData.append('image', this.selectedFile);
      }
    }

    if (
      formData.get('titleEnglish') === '' ||
      formData.get('descriptionEnglish') === '' ||
      formData.get('titleSinhala') === '' ||
      formData.get('descriptionSinhala') === '' ||
      formData.get('titleTamil') === '' ||
      formData.get('descriptionTamil') === ''
    ) {
      return;
    } else {
      this.isLoading = true;
      this.newsService.createNews(formData).subscribe(
        (res: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'news created successfully!',
          });
          this.createNewsObj = new CreateNews();
          this.selectedFile = null;
          this.selectedImage = null;
          this.selectedLanguage = 'english';
          this.router.navigate(['/plant-care/action/manage-content']);
        },
        (error) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error creating news',
          });
          this.createNewsObj = new CreateNews();
          this.selectedFile = null;
        }
      );
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
    }).then((result) => {
      if (result.isConfirmed) {
        this.selectedFile = null;
        this.selectedImage = null;
        this.router.navigate(['/plant-care/action/manage-content']);
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
    const token = this.tokenService.getToken();
    if (!token) {
      return;
    }

    const editMissingFields: string[] = [];

    if (this.newsItems[0].titleEnglish.trim() === '') {
      editMissingFields.push('Title (English)');
    }
    if (this.newsItems[0].descriptionEnglish.trim() === '') {
      editMissingFields.push('Description (English)');
    }
    if (this.newsItems[0].titleSinhala.trim() === '') {
      editMissingFields.push('Title (Sinhala)');
    }
    if (this.newsItems[0].descriptionSinhala.trim() === '') {
      editMissingFields.push('Description (Sinhala)');
    }
    if (this.newsItems[0].titleTamil.trim() === '') {
      editMissingFields.push('Title (Tamil)');
    }
    if (this.newsItems[0].descriptionTamil.trim() === '') {
      editMissingFields.push('Description (Tamil)');
    }
    if (this.newsItems[0].publishDate.trim() === '') {
      editMissingFields.push('Publishe Date');
    }
    if (this.newsItems[0].expireDate.trim() === '') {
      editMissingFields.push('Expire Date');
    }

    if (editMissingFields.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Missing Fields',
        html: `<strong>Please fill in the following fields:</strong><ul>${editMissingFields
          .map((field) => `<li>${field}</li>`)
          .join('')}</ul>`,
      });
      return;
    }

    const formData = new FormData();
    formData.append(
      'titleEnglish',
      this.isEnglishOnly(this.newsItems[0].titleEnglish)
    );
    formData.append(
      'titleSinhala',
      this.isSinhalaAndNumberOnly(this.newsItems[0].titleSinhala)
    );
    formData.append(
      'titleTamil',
      this.isTamilAndNumberOnly(this.newsItems[0].titleTamil)
    );
    formData.append(
      'descriptionEnglish',
      this.isEnglishOnly(this.newsItems[0].descriptionEnglish)
    );
    formData.append(
      'descriptionSinhala',
      this.isSinhalaAndNumberOnly(this.newsItems[0].descriptionSinhala)
    );
    formData.append(
      'descriptionTamil',
      this.isTamilAndNumberOnly(this.newsItems[0].descriptionTamil)
    );
    formData.append('publishDate', this.newsItems[0].publishDate);
    formData.append('expireDate', this.newsItems[0].expireDate);
    if (this.selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png'];

      if (!allowedTypes.includes(this.selectedFile.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image Type',
          text: 'Only JPEG and PNG images are allowed. Please upload a valid image.',
        });
        this.selectedFile = null;
        return;
      }

      formData.append('image', this.selectedFile);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    this.isLoading = true;
    this.http
      .put(`${environment.API_URL}auth/edit-news/${this.itemId}`, formData, {
        headers,
      })
      .subscribe(
        (res: any) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Market Price updated successfully!',
          });
          this.router.navigate(['/plant-care/action/manage-content']);
        },
        (error) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating news',
          });
        }
      );
  }

  onDeleteImage() {
    if (this.newsItems[0]) {
      this.newsItems[0].image = '';
    }
  }

  getTodayDate(): string {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  checkPublishDate() {
    if (this.createNewsObj.publishDate < this.today) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Publish Date',
        text: 'Publish Date cannot be a past date!',
        confirmButtonText: 'OK',
      }).then(() => {
        this.createNewsObj.publishDate = '';
      });
    }
  }

  checkPublishDateEditNews() {
    if (this.newsItems[0].publishDate < this.today) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid Publish Date',
        text: 'Publish Date cannot be a past date!',
        confirmButtonText: 'OK',
      }).then(() => {
        this.newsItems[0].publishDate = this.currentPublishDate;
      });
    }
  }

  checkExpireDate() {
    if (!this.createNewsObj.publishDate) {
      Swal.fire({
        icon: 'warning',
        title: 'publish Date Required',
        text: 'Please select a publish Date before setting an Expiration Date.',
        confirmButtonText: 'OK',
      }).then(() => {
        this.createNewsObj.expireDate = '';
      });
    } else {
      if (this.createNewsObj.expireDate < this.createNewsObj.publishDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Expire Date',
          text: 'Expire Date cannot be earlier than publish Date!',
          confirmButtonText: 'OK',
        }).then(() => {
          this.createNewsObj.expireDate = '';
        });
      }
    }
  }

  checkExpireDateEditNews() {
    if (!this.newsItems[0].publishDate) {
      Swal.fire({
        icon: 'warning',
        title: 'publish Date Required',
        text: 'Please select a publish Date before setting an Expiration Date.',
        confirmButtonText: 'OK',
      }).then(() => {
        this.newsItems[0].expireDate = this.currentExpireDate;
      });
    } else {
      if (this.newsItems[0].expireDate < this.newsItems[0].publishDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Expire Date',
          text: 'Expire Date cannot be earlier than publish Date!',
          confirmButtonText: 'OK',
        }).then(() => {
          this.newsItems[0].expireDate = this.currentExpireDate;
        });
      }
    }
  }

  checkPublishExpireDate() {
    if (this.createNewsObj.publishDate && this.createNewsObj.expireDate) {
      const publishDate = new Date(this.createNewsObj.publishDate);
      const expireDate = new Date(this.createNewsObj.expireDate);

      if (publishDate > expireDate) {
        this.isPublishAfterExpireValid = false;
      } else {
        this.isPublishAfterExpireValid = true;
      }
    }
  }

  checkPublishExpireDateEditNews() {
    if (this.newsItems[0].publishDate && this.newsItems[0].expireDate) {
      const publishDate = new Date(this.newsItems[0].publishDate);
      const expireDate = new Date(this.newsItems[0].expireDate);

      if (publishDate > expireDate) {
        this.isPublishAfterExpireValidEditNews = false;
        Swal.fire({
          icon: 'error',
          title: 'Invalid publish Date',
          text: 'Publish date can not be later than expire date',
          confirmButtonText: 'OK',
        }).then(() => {
          this.newsItems[0].publishDate = this.currentPublishDate;
          this.newsItems[0].expireDate = this.currentExpireDate;
        });
      } else {
        this.isPublishAfterExpireValidEditNews = true;
      }
    }
  }

  back(): void {
    this.router.navigate(['/plant-care/action']);
  }

  backEdit(): void {
    this.router.navigate(['/plant-care/action/manage-content']);
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
