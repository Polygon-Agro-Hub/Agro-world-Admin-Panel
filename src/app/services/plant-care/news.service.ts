import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment/environment";
import { TokenService } from "../token/services/token.service";

interface NewsItem {
  id: number;
  titleEnglish: string;
  titleSinhala: string;
  titleTamil: string;
  descriptionEnglish: string;
  descriptionSinhala: string;
  descriptionTamil: string;
  status: string;
  image: string;
  publishDate: string;
  expireDate: string;
  createdAt: string;
}

@Injectable({
  providedIn: "root",
})
export class NewsService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  createNews(newsData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}auth/admin-create-news`, newsData, {
      headers,
    });
  }

  getNewsById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(`${this.apiUrl}auth/get-news-by-id/${id}`, {
      headers,
    });
  }

  updateNews(id: number, newsData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });

    return this.http.post(`${this.apiUrl}auth/edit-news/${id}`, newsData, {
      headers,
    });
  }

  fetchAllNews(
    page: number,
    limit: number,
    statusFilter: string,
    createdDateFilter: any,
  ): Observable<{ items: NewsItem[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/get-all-contents?page=${page}&limit=${limit}`;
    if (statusFilter) {
      url += `&status=${statusFilter}`;
    }

    if (createdDateFilter) {
      console.log(createdDateFilter);
      
      url += `&createdAt=${createdDateFilter}`;
    }
    return this.http.get<{ items: NewsItem[]; total: number }>(url, {
      headers,
    });
  }

  deleteNews(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}auth/delete-news/${id}`, {
      headers,
    });
  }

  updateNewsStatus(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}auth/edit-news-status/${id}`,
      {},
      { headers },
    );
  }
}
