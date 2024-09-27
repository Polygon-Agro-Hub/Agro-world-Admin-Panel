import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OngoingCultivationService } from '../../../services/plant-care/ongoing-cultivation.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface TaskList {
  slavecropcalendardaysId: number;
  taskIndex : any;
  days: string;
  taskEnglish: string;
  status: string;
}

@Component({
  selector: 'app-user-crop-calendar',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './user-crop-calendar.component.html',
  styleUrl: './user-crop-calendar.component.css'
})
export class UserCropCalendarComponent {
  cropCalendarId: any | null = null;
  userId: any | null = null;
  taskList: TaskList[] = [];

  constructor(private ongoingCultivationService: OngoingCultivationService, private http: HttpClient, private router: Router,  private route: ActivatedRoute,) {}

  
  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.cropCalendarId = params['cropCalendarId'] ? +params['cropCalendarId'] : null; 
      this.userId = params['userId'] ? +params['userId'] : null;     
      console.log("This is the crop calendar Id : ", this.cropCalendarId);
      console.log("This is the user Id : ", this.userId);
    });
    console.log(this.cropCalendarId);
    
    this.getchUserTaskList(this.cropCalendarId, this.userId);
    
  }

  getchUserTaskList(cropId: number, userId : number) {
    this.ongoingCultivationService.getUserTasks(cropId, userId)
      .subscribe(
        (data) => {
          this.taskList = data;
          console.log(this.taskList);
        },
        (error) => {
          console.error('Error fetching ongoing cultivations:', error);
          if (error.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
          }
        }
      );
  }

}
