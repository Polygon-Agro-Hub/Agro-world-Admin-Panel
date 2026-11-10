import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";
import { environment } from "../../environment/environment";

@Injectable({
  providedIn: "root",
})
export class CollectionOfficerService {
  patchValue(arg0: { language: string[] }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();


  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  createCollectiveOfficer(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append("officerData", JSON.stringify(person)); // Attach officer data as a string

    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }


    // No need to set Content-Type headers manually; Angular will handle it for FormData
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/collection-officer/create-collection-officer`,
      formData,
      {
        headers,
      }
    );
  }

  editCollectiveOfficer(
    person: any,
    id: number,
    selectedImage: any
  ): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person)); // Attach officer data as a string
    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}auth/update-officer-details/${id}`,
      formData,
      {
        headers,
      }
    );
  }

  disclaimOfficer(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}auth/disclaim-officer/${id}`,
      {},
      {
        headers,
      }
    );
  }

  createCenterHead(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append("officerData", JSON.stringify(person)); // Attach officer data as a string

    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }


    // No need to set Content-Type headers manually; Angular will handle it for FormData
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}auth/collection-officer/create-center-head`,
      formData,
      {
        headers,
      }
    );
  }

  editCenterHead(
    person: any,
    id: number,
    selectedImage: any
  ): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person)); // Attach officer data as a string
    if (selectedImage) {
      formData.append('file', selectedImage); // Attach the file (ensure the key matches the expected field name on the backend)
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.put(
      `${this.apiUrl}auth/update-officer-details/${id}`,
      formData,
      {
        headers,
      }
    );
  }

  claimOfficer(id: number, payload: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put(
      `${this.apiUrl}auth/claim-officer/${id}`,
      payload, // Include the payload in the request body
      { headers }
    );
  }

  getAllDriveCategories(search: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    let url = `${this.apiUrl}auth/driver/get-all-drive-categories`;

    if (search) {
      url += `?search=${search}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getDriveCategoryById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(`${this.apiUrl}auth/driver/get-drive-category/${id}`, { headers });
  }

  addDriveCategory(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post<any>(`${this.apiUrl}auth/driver/add-drive-category`, data, { headers });
  }

  updateDriveCategory(id: number, data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.put<any>(`${this.apiUrl}auth/driver/update-drive-category/${id}`, data, { headers });
  }

  getSelfRegisteredDrivers(search: string = '', role: string = ''): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    let url = `${this.apiUrl}auth/get-self-registered-drivers?`;
    const params: string[] = [];
    if (search) params.push(`search=${encodeURIComponent(search)}`);
    if (role) params.push(`role=${encodeURIComponent(role)}`);
    url += params.join('&');

    return this.http.get<any>(url, { headers });
  }

  getDriverRegistrationDetails(id: number | string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    return this.http.get<any>(
      `${this.apiUrl}auth/driver/get-driver-registration-details/${id}`,
      { headers }
    );
  }

  getDistributionCenterNamesByCompany(companyId: number | string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    return this.http.get<any>(
      `${this.apiUrl}auth/driver/get-distribution-center-names-by-company/${companyId}`,
      { headers }
    );
  }

  getDriverCategoryNames(): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    return this.http.get<any>(
      `${this.apiUrl}auth/driver/get-driver-category-names`,
      { headers }
    );
  }

  getDistributionManagerNamesByCompany(
    companyId: number | string,
    centerId: number | string
  ): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    return this.http.get<any>(
      `${this.apiUrl}auth/driver/get-distribution-manager-names-by-company/${companyId}/${centerId}`,
      { headers }
    );
  }

  approveDriver(
    id: number | string,
    data: {
      distributedCenterId: number;
      irmId: number;
      empType: 'Permanent' | 'Temporary';
      driverCategoryId: number;
    }
  ): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    return this.http.post<any>(
      `${this.apiUrl}auth/driver/approve-driver/${id}`,
      data,
      { headers }
    );
  }

  rejectDriver(id: number | string, reason: string): Observable<any> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    return this.http.post<any>(
      `${this.apiUrl}auth/driver/reject-driver/${id}`,
      { reason },
      { headers }
    );
  }

}
