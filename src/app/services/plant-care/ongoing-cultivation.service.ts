import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environment/environment";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class OngoingCultivationService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) {}

  fetchAllOngoingCultivations(
    page: number,
    limit: number,
    searchNIC: string = "",
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/get-all-ongoing-culivations?page=${page}&limit=${limit}`;
    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getOngoingCultivationById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get(
      `${this.apiUrl}auth/get-ongoing-cultivation-by-id/${id}`,
      { headers },
    );
  }

  getUserTasks(
    cropId: number,
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Observable<{ items: any[]; total: number }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<{ items: any[]; total: number }>(
      `${this.apiUrl}auth/get-all-users-crop-task/${cropId}/${userId}?page=${page}&limit=${limit}`,
      { headers },
    );
  }

  deleteUserCropTask(id: string, cropId: any, index: any, userId: any) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(
      `${this.apiUrl}auth/delete-user-task/${id}/${cropId}/${index}/${userId}`,
      {
        headers,
      },
    );
  }

  updateUserTaskStatus(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/edit-user-task-status/${id}`,
      {},
      { headers },
    );
  }
}
