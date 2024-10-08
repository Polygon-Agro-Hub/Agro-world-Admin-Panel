import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { log } from 'console';

@Injectable({
  providedIn: 'root',
})
export class PublicForumService {
  private apiUrl = `${environment.API_BASE_URL}`;
  private token = `${environment.TOKEN}`;

  constructor(private http: HttpClient) {}

  sendMessage(
    chatId: number,
    replyData: { id: number; replyMessage: string }
  ): Observable<any> {
    console.log('send msg url', `${this.apiUrl}send-message/${chatId}`);
    return this.http.post(`${this.apiUrl}send-message/${chatId}`, replyData);
  }
  getAllPostReply(postId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(`${this.apiUrl}get-all-reply/${postId}`, { headers });
  }

  deleteReply(repId: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}delete-reply/${repId}`, { headers });
  }

  getreplyCount(chatId: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}get-count/${chatId}`, { headers });
  }
}
