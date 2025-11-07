import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';
import { TokenService } from '../token/services/token.service';

@Injectable({
  providedIn: 'root',
})
export class OngoingCultivationService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(private http: HttpClient, private tokenService: TokenService) {}

  // fetchAllOngoingCultivations(
  //   page: number,
  //   limit: number,
  //   searchNIC: string = ''
  // ): Observable<any> {
  //   console.log('searchNIC', searchNIC);
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //   });

  //   let url = `${this.apiUrl}auth/get-all-ongoing-culivations?page=${page}&limit=${limit}`;
  //   if (searchNIC) {
  //     url += `&nic=${searchNIC}`;
  //   }
  //   return this.http.get<any>(url, { headers });
  // }

  fetchAllOngoingCultivations(
  page: number,
  limit: number,
  searchNIC: string = '',
  farmId?: number,
  userId?: number
): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  let url = `${this.apiUrl}auth/get-all-ongoing-culivations?page=${page}&limit=${limit}`;

  if (searchNIC) {
    url += `&nic=${encodeURIComponent(searchNIC)}`;
  }
  if (farmId) {
    url += `&farmId=${farmId}`;
  }
  if (userId) {
    url += `&userId=${userId}`;
  }

  return this.http.get<any>(url, { headers });
}

getOngoingCultivationById(cultivationId: number, userId: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.tokenService.getToken()}`,
  });

  // Add userId as query parameter
  const url = `${this.apiUrl}auth/get-ongoing-cultivation-by-id/${cultivationId}/${userId}`;
  return this.http.get<any>(url, { headers });
}


  getUserTasks(
    cropId: number,
    userId: number | null,
    page: number = 1,
    limit: number = 10
  ): Observable<{
    items: any[];
    total: number;
    firstStartingDate: string | null;
  }> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<{
      items: any[];
      total: number;
      firstStartingDate: string | null;
    }>(
      `${this.apiUrl}auth/get-all-users-crop-task/${cropId}/${userId}?page=${page}&limit=${limit}`,
      { headers }
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
      }
    );
  }

  deleteOngoingCultivation(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<any>(
      `${this.apiUrl}auth/ongoing-cultivations/${id}`,
      {
        headers,
      }
    );
  }

  updateUserTaskStatus(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/edit-user-task-status/${id}`,
      {},
      { headers }
    );
  }

   getFarmsByUser(userId: number | null, searchText:string=''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
    let url = `${this.apiUrl}auth/get-farms-by-user?userId=${userId}`;

    if(searchText) url+=`&searchText=${searchText}`

    return this.http.get<any>(url, { headers });
  }

  // Delete a farm by ID
  deleteFarm(farmId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.delete<any>(`${this.apiUrl}auth/delete-farm/${farmId}`, { headers });
  }
}
