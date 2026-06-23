import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
  private apiUrl = environment.API_URL;

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  uploadImage(
    file: File,
    folder: string = 'officers/images',
  ): Observable<string> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http
      .post<{
        url: string;
      }>(`${this.apiUrl}upload/image`, formData, { headers })
      .pipe(
        map((res) => res.url),
        catchError((err) => throwError(() => new Error('Image upload failed'))),
      );
  }

  uploadImages(
    files: File[],
    folder: string = 'officers/images',
  ): Observable<string[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file, file.name);
    });

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`,
    });

    return this.http
      .post<{
        urls: string[];
      }>(`${this.apiUrl}upload/images`, formData, { headers })
      .pipe(
        map((res) => res.urls),
        catchError((err) => throwError(() => new Error('Image upload failed'))),
      );
  }
}
