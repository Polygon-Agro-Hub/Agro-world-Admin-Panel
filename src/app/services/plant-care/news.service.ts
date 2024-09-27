import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

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
  createdAt: string;
}


@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) { }

  createNews(newsData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}admin-create-news`, newsData, {
      headers,
    });
  }

  getNewsById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(`${this.apiUrl}get-news-by-id/${id}`, { headers });
  }

  updateNews(id: number, newsData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post(
      `${this.apiUrl}edit-news/${id}`,
      newsData,
      { headers }
    );
  }

 

 

  fetchAllNews(page: number, limit: number, statusFilter: string, createdDateFilter: string): Observable<{ items: NewsItem[], total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}get-all-contents?page=${page}&limit=${limit}`;
    if (statusFilter) {
      url += `&status=${statusFilter}`;
    }

    if (createdDateFilter) {
      url += `&createdAt=${createdDateFilter}`;
    }
    return this.http.get<{ items: NewsItem[], total: number }>(url, { headers});
   
  }


  deleteNews(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}delete-news/${id}`, {
      headers
    });
  }

  

  updateNewsStatus(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(
      `${this.apiUrl}edit-news-status/${id}`,
      {},
      { headers}
    );
  }
}
