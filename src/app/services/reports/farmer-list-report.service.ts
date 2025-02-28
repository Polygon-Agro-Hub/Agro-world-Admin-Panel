import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class FarmerListReportService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getFarmerListReport(itemId: number, userId: number): Observable<any> {
    return this.http.get<any[]>(
      `${this.apiUrl}auth/farmer-list-report/${itemId}/${userId}`,
    );
  }
}
