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
  id: any;
  cropName: string;
  variety: string;
  cultivationMethod: string;
  natureOfCultivation: string;
  cropDuration: string;
}

interface NewsItem {
  ongoingCultivationId: any;
  cropName: string;
  cropCalendar : number;
  variety: string;
  cultivationMethod: string;
  natureOfCultivation: string;
  cropDuration: string;
}


@Component({
  selector: 'app-slave-crop-calendar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, HttpClientModule, AngularEditorModule, LoadingSpinnerComponent],
  templateUrl: './slave-crop-calendar.component.html',
  styleUrl: './slave-crop-calendar.component.css'
})
export class SlaveCropCalendarComponent {
  itemId: number | null = null;
  cultivtionItems: CultivationItems[] = [];

  cultivationId: any | null = null;
  name: string = '';
  category: string = '';
  hasData: boolean = true; 
  newsItems: NewsItem[] = [];
  userId: any | null = null;

 
  

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
      this.cultivationId = params['cultivationId'] ? +params['cultivationId'] : null;  
      this.userId = params['userId'] ? +params['userId'] : null;    
      console.log("This is the Id : ", this.cultivationId);
      console.log("This is the user Id : ", this.userId);
    });
    this.fetchAllNews(this.cultivationId);
    
    
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


  fetchAllNews(id: number) {
    this.ongoingCultivationService.getOngoingCultivationById(id)
      .subscribe(
        (data) => {
          this.newsItems = data;
          console.log(data);
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

  viewTaskByUser(cropCalendarId: any, userId : any, onCulscropID: any ) {
    if (cropCalendarId) {
      this.router.navigate(['plant-care/view-crop-task-by-user/user-task-list'], { 
        queryParams: { cropCalendarId, userId, onCulscropID } 
      });
      console.log('Navigating with cultivationId:', cropCalendarId);
      console.log('ish:', onCulscropID);
    } else {
      console.error('cultivationId is not defined:', cropCalendarId);
    }
  }

  

}
