import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { OptOutFeedbacksService } from '../../../services/plant-care/opt-out-feedbacks.service';
import { HttpClient } from '@angular/common/http';
import { response } from 'express';

@Component({
  selector: 'app-opt-out-feedbacks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './opt-out-feedbacks.component.html',
  styleUrl: './opt-out-feedbacks.component.css',
})
export class OptOutFeedbacksComponent {
  feedbacks: FeedbacksData[] = [];

  constructor(
    private plantcareService: OptOutFeedbacksService,
    private http: HttpClient
  ) {}

  fetchAllFeedbacks() {
    this.plantcareService.getUserFeedbackDetails().subscribe(
      (response) => {
        console.log(response);
        this.feedbacks = response;
      },
      (error) => {
        console.error(error);
        if (error.ststus === 401) {
        }
      }
    );
  }

  ngOnInit() {
    this.fetchAllFeedbacks();
  }
}

class FeedbacksData {
  firstName!: string;
  lastName!: string;
  userCreatedAt!: number;
  feedback!: string;
  feedbackCreatedAt!: number;
}
