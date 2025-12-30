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
    page?: number,
    limit?: number
  ): Observable<{
    feedbackDetails: any[];
    feedbackCount: any;
    deletedUserCount: any;
  }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/opt-out-feedbacks`;

    const params: string[] = [];

    if (page !== undefined) {
      params.push(`page=${page}`);
    }

    if (limit !== undefined) {
      params.push(`limit=${limit}`);
    }

    if (params.length) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<{
      feedbackDetails: any[];
      feedbackCount: any;
      deletedUserCount: any;
    }>(url, { headers });
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
