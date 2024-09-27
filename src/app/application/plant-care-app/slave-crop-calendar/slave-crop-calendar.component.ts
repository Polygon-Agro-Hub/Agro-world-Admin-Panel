import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NewsService } from '../../../services/plant-care/news.service';
import { CommonModule } from '@angular/common';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { LoadingSpinnerComponent } from '../../../components/loading-spinner/loading-spinner.component';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';

interface CultivationItems {
  cropName: string;
  variety: string;
  CultivationMethod: string;
  NatureOfCultivation: string;
  CropDuration: string;
}


@Component({
  selector: 'app-slave-crop-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, AngularEditorModule, LoadingSpinnerComponent],
  templateUrl: './slave-crop-calendar.component.html',
  styleUrl: './slave-crop-calendar.component.css'
})
export class SlaveCropCalendarComponent {
  selectedLanguage: 'english' | 'sinhala' | 'tamil' = 'english';
  itemId: number | null = null;
  cultivtionItems: CultivationItems[] = [];

  cultivationId: any | null = null;
  name: string = '';
  category: string = '';
  hasData: boolean = true; 

  selectLanguage(lang: 'english' | 'sinhala' | 'tamil') {
    this.selectedLanguage = lang;
  }

  

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute,
    private newsService: NewsService,
    private ongoingCultivationService: OngoingCultivationService,
    private router: Router
  ) {}


  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cultivationId = params['cultivationId'] ? +params['id'] : null;      
      console.log("This is the Id : ", this.cultivationId);
    });
    this.getCultivation(this.cultivationId);
    
    
  }


  viewTaskByUser() {
    this.router.navigate(['assets/fixed-asset-category'], { 
      // queryParams: { id, firstName, lastName} 
    });
  }


  getCultivation(id: any) {
   
    this.ongoingCultivationService.getOngoingCultivationById(id)
      .subscribe(
        (data) => {
          this.cultivtionItems = data;
          console.log(this.cultivtionItems);
        },
        (error) => {
          console.error('Error fetching news:', error);
          if (error.status === 401) {
            
          }
        }
      );
  }

}
