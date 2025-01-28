import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { Observable } from 'rxjs';
import { log } from 'console';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class PublicForumService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();;

  constructor(private http: HttpClient, private tokenService: TokenService) {}
  sendMessage(
    chatId: number,
    replyData: { id: number; replyMessage: string }
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}auth/send-message/${chatId}`, replyData, {
      headers,
    });
  }
  getAllPostReply(postId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(`${this.apiUrl}auth/get-all-reply/${postId}`, { headers });
  }

  deleteReply(repId: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}auth/delete-reply/${repId}`, { headers });
  }

  deletePublicForumPost(postId: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete(`${this.apiUrl}auth/delete-post/${postId}`, { headers });
  }

  getreplyCount(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}auth/get-count-reply`, { headers });
  }
}
