import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

class PostItem{
  'id':number;
  'userId':string;
  'heading':string;
  'message':string;
  'createdAt':string;
}

@Injectable({
  providedIn: 'root',
})
export class PublicforumService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();;

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  getAllPosts():Observable<any[]>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any[]>(`${this.apiUrl}auth/get-post`, {headers});
  }

  // getUserProfile(userId: number): Observable<any>{
  //   return this.http.get<any>(`${this.apiUrl}/${userId}`);
  // }
}
