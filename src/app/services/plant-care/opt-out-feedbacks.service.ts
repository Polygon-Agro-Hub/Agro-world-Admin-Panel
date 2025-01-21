import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface FeedbacksItems {
  firstName: string;
  lastName: string;
  feedback: string;
  feedbackCreatedAt: number;
}

@Injectable({
  providedIn: 'root',
})
export class OptOutFeedbacksService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  getUserFeedbackDetails(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`, // Ensure this.token is defined in your service
    });

    return this.http.get(`${this.apiUrl}opt-out-feedbacks`, {
      headers,
    });
  }
}
