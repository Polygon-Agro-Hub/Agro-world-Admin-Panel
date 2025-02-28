import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

interface FeedbacksItems {
  firstName: string;
  lastName: string;
  feedback: string;
  feedbackCreatedAt: number;
}

@Injectable({
  providedIn: "root",
})
export class OptOutFeedbacksService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  // getUserFeedbackDetails(): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`, // Ensure this.token is defined in your service
  //   });

  //   return this.http.get(`${this.apiUrl}opt-out-feedbacks`, {
  //     headers,
  //   });
  // }

  getUserFeedbackDetails(
    page: number,
    limit: number,
  ): Observable<{ feedbackDetails: any[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`, // Ensure this.token is defined in your service
    });

    // Construct the URL with pagination parameters
    let url = `${this.apiUrl}auth/opt-out-feedbacks?page=${page}&limit=${limit}`;

    // Return the HTTP GET request with pagination
    return this.http.get<{ feedbackDetails: any[]; total: number }>(url, {
      headers,
    });
  }

  getAllFeedbackListForBarChart(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`, // Ensure this.token is defined in your service
    });

    return this.http.get(`${this.apiUrl}auth/get-all-feedbacks-for-bar-chart`, {
      headers,
    });
  }
}
