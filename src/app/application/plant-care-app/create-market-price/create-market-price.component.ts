import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from '../../../environment/environment';
import { LoadingSpinnerComponent } from "../../../components/loading-spinner/loading-spinner.component";
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
  price: string;
  createdAt: string;
  image: string;
}


@Component({
  selector: 'app-create-market-price',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, LoadingSpinnerComponent],
  templateUrl: './create-market-price.component.html',
  styleUrl: './create-market-price.component.css'
})
export class CreateMarketPriceComponent {
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  createMarketObj: CreateMarket = new CreateMarket();
  selectedFile: File | null = null;
  itemId: number | null = null;
  newsItems: NewsItem[] = [];
  selectedFileName: string | null = null;
  selectedImage: string | ArrayBuffer | null = null;
  isLoading = false;

  constructor(private fb: FormBuilder, private http: HttpClient,private route: ActivatedRoute, private router: Router, private tokenService: TokenService
  ) { }

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.itemId = params['id'] ? +params['id'] : null;
      console.log('Received item ID:', this.itemId);
    });
    this.getMarketPrice(this.itemId);
  }

  getMarketPrice(id: any) {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
    }
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    

    this.http.get<NewsItem[]>(`${environment.API_URL}auth/get-market-price-by-id/${id}`, { headers }).subscribe(
      (data) => {
        this.newsItems = data;
        console.log(this.newsItems);
      },
      (error) => {
        console.error('Error fetching news:', error);
        if (error.status === 401) {
          // Handle unauthorized access (e.g., redirect to login)
        }
      }
    );
  }

  
  triggerFileInput() {
    const fileInput = document.getElementById('imageUpload') as HTMLElement;
    fileInput.click();
  }

  onFileSelected(event: any):void {
    const file: File = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);
      this.selectedFile = file; // Save the file to the component property
      this.selectedFileName = file.name;

      const reader = new FileReader();
      reader.onload = (e) =>{
        this.selectedImage = e.target?.result as string | ArrayBuffer;
      };
      reader.readAsDataURL(file);
    }
  }

  isEnglishOnly(input: string): string {
    const englishRegex = /^[\u0041-\u005A\u0061-\u007A\u0030-\u0039\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    // if(!englishRegex.test(input)){
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Unsuccess',
    //     text: 'It allows English letters, numbers, and common symbols only!',
    //   });
    //   return '';

    // }
    return input
  }


  isSinhalaAndNumberOnly(input: string): string {
    // Regular expression for Sinhala characters and numbers
    const sinhalaAndNumberRegex = /^[\u0D80-\u0DFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
    
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
    const tamilRegex = /^[\u0B80-\u0BFF0-9\s\!\@\#\$\%\^\&\*\(\)\_\+\-\=\[\]\{\}\;\:\'\"\,\<\>\.\?\/\\\|]+$/;
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


  createMarketPrice() {
    console.log('clicked');
    console.log(this.createMarketObj);
    
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }

    const formData = new FormData();
    formData.append('titleEnglish', this.isEnglishOnly(this.createMarketObj.titleEnglish));
    formData.append('titleSinhala', this.isSinhalaAndNumberOnly(this.createMarketObj.titleSinhala));
    formData.append('titleTamil', this.isTamilAndNumberOnly(this.createMarketObj.titleTamil));
    // formData.append('descriptionEnglish', this.isEnglishOnly(this.createMarketObj.descriptionEnglish));
    // formData.append('descriptionSinhala', this.isSinhalaAndNumberOnly(this.createMarketObj.descriptionSinhala));
    // formData.append('descriptionTamil', this.isTamilAndNumberOnly(this.createMarketObj.descriptionTamil));
    formData.append('status', this.createMarketObj.status);
    formData.append('price', this.createMarketObj.price);
    formData.append('createdBy', this.createMarketObj.createdBy);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    if(formData.get('titleEnglish')==='' || formData.get('titleSinhala')==='' || formData.get('titleTamil')==='' ){
      return;
    }else{
      this.isLoading = true;
      this.http.post(`${environment.API_URL}auth/admin-create-market-price`, formData, { headers })
      .subscribe(
        (res: any) => {
          console.log('News created successfully', res);
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'market price created successfully!',
          });
          this.createMarketObj = new CreateMarket();
          this.selectedFile = null; // Reset file input
          this.router.navigate(['/plant-care/manage-market-price'])
        },
        (error: any) => {
          console.error('Error creating news', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccess',
            text: 'Error creating market price',
          });
          this.createMarketObj = new CreateMarket();
          this.selectedFile = null; // Reset file input
        }
      );

    }
    
  }



  // updateMarketPrice() {

  //   if (!token) {
  //     console.error('No token found');
  //     return;
  //   }
  
  //   // Constructing the data as a JSON object
  //   const newsData = {
  //     titleEnglish: this.newsItems[0].titleEnglish,
  //     titleSinhala: this.newsItems[0].titleSinhala,
  //     titleTamil: this.newsItems[0].titleTamil,
  //     descriptionEnglish: this.newsItems[0].descriptionEnglish,
  //     descriptionSinhala: this.newsItems[0].descriptionSinhala,
  //     descriptionTamil: this.newsItems[0].descriptionTamil,
  //     price: this.newsItems[0].price,
  //     // Add additional fields if necessary
  //     // status: this.createNewsObj.status,
  //     // createdBy: this.createNewsObj.createdBy,
  //   };
  
  //   console.log('News Data:', newsData); // Logging the JSON data
  
  //   const headers = new HttpHeaders({
  //     'Authorization': `Bearer ${token}`,
  //     'Content-Type': 'application/json' // Setting the content type to JSON
  //   });
  
 
  //     .subscribe(
  //       (res: any) => {
  //         console.log('News updated successfully', res);
  //         Swal.fire({
  //           icon: 'success',
  //           title: 'Success',
  //           text: 'Market Price updated successfully!',
  //         });
  //       },
  //       (error) => {
  //         console.error('Error updating news', error);
  //         Swal.fire({
  //           icon: 'error',
  //           title: 'Unsuccess',
  //           text: 'Error updating Market Price',
  //         });
  //       }
  //     );
  // }

  updateMarketPrice() {
    const token = this.tokenService.getToken();

    if (!token) {
      console.error('No token found');
      return;
    }
  
    const formData = new FormData();
    formData.append('titleEnglish', this.isEnglishOnly(this.newsItems[0].titleEnglish));
    formData.append('titleSinhala', this.isSinhalaAndNumberOnly(this.newsItems[0].titleSinhala));
    formData.append('titleTamil', this.isTamilAndNumberOnly(this.newsItems[0].titleTamil));
    // formData.append('descriptionEnglish', this.isEnglishOnly(this.newsItems[0].descriptionEnglish));
    // formData.append('descriptionSinhala', this.isSinhalaAndNumberOnly(this.newsItems[0].descriptionSinhala));
    // formData.append('descriptionTamil', this.isTamilAndNumberOnly(this.newsItems[0].descriptionTamil));
    formData.append('price', this.newsItems[0].price);
  
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }
  
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  
    this.isLoading = true;
    this.http.put(`${environment.API_URL}auth/edit-market-price/${this.itemId}`, formData, { headers })
      .subscribe(
        (res: any) => {
          console.log('Market Price updated successfully', res);
          this.isLoading = false;
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Market Price updated successfully!',
          });
          this.router.navigate(['/plant-care/manage-market-price']);
        },
        (error) => {
          console.error('Error updating Market Price', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Unsuccessful',
            text: 'Error updating Market Price',
          });
        }
      );
  }

  onCancel() {
    this.createMarketObj = new CreateMarket(); // Reset the object to clear the form fields
    this.selectedFile = null; // Reset file input
    this.selectedLanguage = 'english'; // Optionally reset language selection to default
    console.log('Form cleared');
    Swal.fire('Form cleared', '', 'info');
  }

  onDeleteImage() {
    if (this.newsItems[0]) {
      this.newsItems[0].image = '';
    }
  
    }
  

}
export class CreateMarket {
  titleEnglish: string = '';
  titleSinhala: string = '';
  titleTamil: string = '';
  descriptionEnglish: string = '';
  descriptionSinhala: string = '';
  descriptionTamil: string = '';
  status: string = 'Draft';
  price: string = '';
  createdBy: any = localStorage.getItem('userId:');
}
