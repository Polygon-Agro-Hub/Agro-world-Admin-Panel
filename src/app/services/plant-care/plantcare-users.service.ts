import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "../../environment/environment";
import { TokenService } from "../token/services/token.service";

export interface PlantCareUser {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  NICnumber: string;
  profileImage: string;
  createdAt: string;
  
}

export interface FixedAsset {
  id: number;
  userId: string;
  tool: string;
  toolType: string;
  brandName: string;
  purchaseDate: string;
  unit: string;
  price: string;
  warranty: string;
  expireDate: string;
  depreciation: string;
  warrantyStatus: string;
  category: string;
  createdAt: string;
}

export interface Farm {
  id: number;
  farmName: string;
  farmIndex: number;
  extentha: number;
  extentac: number;
  extentp: number;
  district: string;
  plotNo: string;
  street: string;
  city: string;
  staffCount: number;
  appUserCount: number;
  imageId: number;
  isBlock: number;
  createdAt: string;
}

export interface FarmResponse {
  result: Farm[];
}

@Injectable({
  providedIn: "root",
})
export class PlantcareUsersService {
  getUserProfile(userId: number) {
    throw new Error("Method not implemented.");
  }
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  getAllPlantCareUsers(
    page: number,
    limit: number,
    searchNIC: string = "",
    regStatus: string = "",
    district: string = "",
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/get-all-users?page=${page}&limit=${limit}`;
    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }

    if (regStatus) {
      url += `&regStatus=${regStatus}`;
    }

    if (district) {
      url += `&district=${district}`;
    }

    return this.http.get<any>(url, { headers });
  }

  deletePlantCareUser(id: number): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete<void>(
      `${this.apiUrl}auth/delete-plant-care-user/${id}`,
      { headers },
    );
  }

  getTotalFixedAssets(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    const url = `${this.apiUrl}auth/get-total-fixed-assets-by-id/${id}`;
    return this.http.get<any>(url, { headers });
  }

  // uploadUserXlsxFile(file: File): Observable<any> {
  //   const headers = new HttpHeaders({
  //     Authorization: `Bearer ${this.token}`,
  //   });

  //   const formData = new FormData();
  //   formData.append('file', file);

  //   return this.http.post(`${this.apiUrl}upload-user-xlsx`, formData, {
  //     headers,
  //   });
  // }

  uploadUserXlsxFile(formData: FormData): Observable<any> {
    console.log(formData);
    
    return this.http
      .post(`${this.apiUrl}auth/upload-user-xlsx`, formData, {
        responseType: "json",
        observe: "body",
      })
      .pipe(
        catchError((error) => {
          // Check if the error response is an Excel file
          if (error.status === 409 && error.error instanceof ArrayBuffer) {
            // Return the file buffer for download
            return new Observable((observer) => {
              observer.next(error.error);
              observer.complete();
            });
          }
          return throwError(() => error);
        }),
      );
  }

  createFeedback(feedbackData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.post(`${this.apiUrl}auth/create-feedback`, feedbackData, {
      headers,
    });
  }

  updateFeedbackOrder(feedbacks: { id: number; orderNumber: number }[]) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(
      `${environment.API_URL}auth/update-feedback-order`,
      { feedbacks },
      { headers },
    );
  }

  deleteFeedback(feedbackId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.delete(`${this.apiUrl}auth/feedback/${feedbackId}`, {
      headers,
    });
  }


  getAllFarmerStaff(id: number, role: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/get-all-farmer-staff?id=${id}`
    if (role) {
      url += `&role=${role}`
    }

    return this.http.get(url, {
      headers,
    });
  }

  getFarmerFarms(userId: number): Observable<FarmResponse> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<FarmResponse>(`${this.apiUrl}auth//get-all-farmer-farms?userId=${userId}`, { headers });
  }
  
deleteFarm(farmId: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  return this.http.delete<any>(`${this.apiUrl}auth/delete-farm?farmId=${farmId}`, { headers });
}

  
  getFarmOwnerById(id: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  const url = `${this.apiUrl}auth/get-farm-owner?id=${id}`;

  return this.http.get(url, { headers });
}

updateFarmOwner(ownerId: number, data: any): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`
  });
  return this.http.put(`${this.apiUrl}auth/update-farm-owner/${ownerId}`, data, { headers });
}


}

