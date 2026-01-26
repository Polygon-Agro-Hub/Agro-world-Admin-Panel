import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class FarmerPensionService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}
}
