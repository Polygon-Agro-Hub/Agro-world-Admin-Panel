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
import {
  AngularEditorConfig,
  AngularEditorModule,
} from '@kolkov/angular-editor';
import { NewsService } from '../../../services/plant-care/news.service';
import { log } from 'console';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { TokenService } from '../../../services/token/services/token.service';

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
    AngularEditorModule,
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
  isOnlyNumbers:boolean = false
  isTamilValid: boolean = true;
  isLoading = false;
  createDate: string = '';
  expireDate: string = '';
  today: string = this.getTodayDate();


  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '300px',
    minHeight: '300px',
    maxHeight: 'auto',
    width: 'auto',
    minWidth: '0',
    translate: 'yes',
    enableToolbar: true,
    showToolbar: true,
    placeholder: 'Enter text here...',
    defaultParagraphSeparator: '',
    defaultFontName: '',
    defaultFontSize: '',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      { class: 'georgia', name: 'Georgia' },
      { class: 'verdana', name: 'Verdana' },
      { class: 'helvetica', name: 'Helvetica' },
      { class: 'fm-abaya', name: 'FM Abhaya' }, // Sinhala font
      { class: 'iskoola-pota', name: 'Iskoola Pota' }, // Sinhala font
      { class: 'abhaya-libre', name: 'Abhaya Libre' }, // Sinhala font
      { class: 'latha', name: 'Latha' }, // Tamil font
      { class: 'baloo-tamil', name: 'Baloo Tamil' }, // Tamil font
      { class: 'bamini', name: 'Bamini' }, // Tamil font
    ],
    customClasses: [
      {
        name: 'quote',
        class: 'quote',
      },
      {
        name: 'redText',
        class: 'redText',
      },
      {
        name: 'titleText',
        class: 'titleText',
        tag: 'h1',
      },
    ],
    
    uploadWithCredentials: false,
    sanitize: false,
    toolbarPosition: 'top',
    toolbarHiddenButtons: [
      [
        'insertImage',
        // 'backgroundColor',
        'customClasses',
        'insertVideo',
        'insertHorizontalRule',
        'toggleEditorMode',
        'indent',
        'outdent',
        'fontSize',
        'heading',
      ],
    ],
  };

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private router: Router,
    private tokenService: TokenService

  ) {}

  // validateSinhala(event: any) {
  //   const sinhalaRegex = /^[\u0D80-\u0DFF\s]+$/; // Unicode range for Sinhala characters
  //   const inputValue = event.target.value;

  //   // Check if the input matches the Sinhala regex
  //   this.isSinhalaValid = sinhalaRegex.test(inputValue);
  // }

  // validateEnglish(event: any) {
  //   const englishRegex = /^[A-Za-z\s]+$/; // Regex for English characters
  //   const inputValue = event.target.value;

  //   // Check if the input matches the English regex
  //   this.isEnglishValid = englishRegex.test(inputValue);
  // }

  // validateTamil(event: any) {
  //   const tamilRegex = /^[\u0B80-\u0BFF\s]+$/; // Unicode range for Tamil characters
  //   const inputValue = event.target.value;

  //   // Check if the input matches the Tamil regex
  //   this.isTamilValid = tamilRegex.test(inputValue);
  // }

  validateTitleEnglish(value: string): void {
    // Regular expression to disallow numbers-only input
    const regex = /[a-zA-Z!@#$%^&*(),.?":{}|<>]/; // Ensures the presence of at least one non-digit character
    this.isEnglishValid = regex.test(value.trim());
  }

  isEnglishOnly(input: string): string {
    const englishRegex =
      /^[\u0041-\u005A\u0061-\u007A\u0030-\u0039\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    return input;
  }

  isSinhalaAndNumberOnly(input: string): string {
    // Regular expression for Sinhala characters and numbers
    const sinhalaAndNumberRegex =
      /^[\u0D80-\u0DFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;

    // if (!sinhalaAndNumberRegex.test(input)) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Unsuccessful',
    //     text: 'It allows only Sinhala characters and numbers!',
    //   });
    //   return '';
    // }
    return input;
  }

  isTamilAndNumberOnly(input: string): string {
    const tamilRegex =
      /^[\u0B80-\u0BFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    // if (!tamilRegex.test(input )) {
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Unsuccess',
    //     text: 'It allows only Tamil characters and numbers!',
    //   });
    //   return '';
    // }
    return input;
  }

  createNews() {
    console.log('clicked');
    console.log(this.createNewsObj);

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
      const allowedTypes = ['image/jpeg', 'image/png']; // Allowed MIME types

      if (!allowedTypes.includes(this.selectedFile.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image Type',
          text: 'Only JPEG and PNG images are allowed. Please upload a valid image.',
        });
        this.selectedFile = null; // Clear the invalid file
        return; // Stop further execution
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
      console.log('language does not match');

      return;
    } else {
      this.isLoading = true;
      this.newsService.createNews(formData).subscribe(
        (res: any) => {
          this.isLoading = false;
          console.log('News created successfully', res);
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'news created successfully!',
          });
          this.createNewsObj = new CreateNews();
          this.selectedFile = null;
          this.selectedImage = null;
          this.selectedLanguage = 'english';
          this.router.navigate(['/plant-care/manage-content']);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error creating news', error);
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error creating news',
          });
          this.createNewsObj = new CreateNews();
          this.selectedFile = null; // Reset file input
        }
      );
    }
  }

  // onCancel() {
  //   this.createNewsObj = new CreateNews();
  //   this.selectedFile = null;
  //   this.selectedImage = null;
  //   this.selectedLanguage = 'english';
  //   console.log('Form cleared');
  //   Swal.fire('Form cleared', '', 'info');
  // }

  // onCancel2() {
  //   this.createNewsObj = new CreateNews();
  //   this.selectedFile = null;
  //   this.selectedImage = null;
  //   this.selectedLanguage = 'english';
  //   console.log('Form cleared');
  //   Swal.fire('Form cleared', '', 'info').then(() => {
  //     this.router.navigate(['/plant-care/manage-content']);
  //   });
  // }

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
              this.router.navigate(['/plant-care'])
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
      console.log('Selected file:', file);
      this.selectedFile = file; // Save the file to the component property
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
      console.log('Received item ID:', this.itemId);
    });
    this.getNewsById(this.itemId);
  }

  getNewsById(id: any) {
    this.newsService.getNewsById(id).subscribe(
      (data) => {
        // Convert dates to 'YYYY-MM-DD'
        data.forEach((newsItem: any) => {
          if (newsItem.publishDate) {
            newsItem.publishDate = this.formatDate(newsItem.publishDate);
          }
          if (newsItem.expireDate) {
            newsItem.expireDate = this.formatDate(newsItem.expireDate);
          }
        });
        this.newsItems = data;
        console.log(this.newsItems);
      },
      (error) => {
        console.error('Error fetching news:', error);
        // if (error.status === 401) {
        // }
      }
    );
  }
  
  formatDate(date: string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Extract 'YYYY-MM-DD'
  }
  

  updateNews() {
    const token = this.tokenService.getToken();
    if (!token) {
      console.error('No token found');
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
      const allowedTypes = ['image/jpeg', 'image/png']; // Allowed MIME types

      // Validate the image type
      if (!allowedTypes.includes(this.selectedFile.type)) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Image Type',
          text: 'Only JPEG and PNG images are allowed. Please upload a valid image.',
        });
        this.selectedFile = null; // Clear the invalid file
        return; // Stop further execution
      }

      // Append the file to the form data if valid
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
          console.log('Market Price updated successfully', res);
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Market Price updated successfully!',
          });
          this.router.navigate(['/plant-care/manage-content']);
        },
        (error) => {
          console.error('Error updating news', error);
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
        confirmButtonText: 'OK'
      }).then(() => {
        this.createNewsObj.publishDate = '';
      });
    }
  }

  checkExpireDate() {
    if (!this.createNewsObj.publishDate) {
      Swal.fire({
        icon: 'warning',
        title: 'publish Date Required',
        text: 'Please select a publish Date before setting an Expiration Date.',
        confirmButtonText: 'OK'
      }).then(() => {
        this.createNewsObj.expireDate = '';
      });
    } else {
      if (this.createNewsObj.expireDate < this.createNewsObj.publishDate) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Expire Date',
          text: 'Expire Date cannot be earlier than publish Date!',
          confirmButtonText: 'OK'
        }).then(() => {
          this.createNewsObj.expireDate = '';
        });
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
