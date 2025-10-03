import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: "root",
})
export class StakeholderService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  getAdminUserData(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
    return this.http.get(`${this.apiUrl}stakeholder/get-admin-user-data`, {
      headers,
    });
  }

 getAllFieldInspectors(): Observable<any[]> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http
    .get<any>(`${this.apiUrl}stakeholder/get-all-field-officers`, { headers })
    .pipe(
      map((res) =>
        res.data.map((item: any) => ({
          id: item.id,
          empId: item.empId,
          firstName: item.firstName,
          lastName: item.lastName,
          role: item.JobRole?.trim() || 'N/A',
          district: item.distrct || 'N/A', // backend typo
          language: item.language
            ? item.language
                .split(',')
                .map((lang: string) => {
                  switch (lang.trim()) {
                    case 'Eng': return 'English';
                    case 'Sin': return 'Sinhala';
                    case 'Tam': return 'Tamil';
                    default: return lang.trim();
                  }
                })
                .join(', ')
            : '',
          status: item.status || 'Pending',
          phone: item.phoneNumber1
            ? `${item.phoneCode1} ${item.phoneNumber1}`
            : null,
          nic: item.nic,
          modifiedBy: item.modifyBy || 'System',
        }))
      )
    );
}


}
