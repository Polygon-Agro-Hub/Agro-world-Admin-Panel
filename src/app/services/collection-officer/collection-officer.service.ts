import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

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
  ) {}

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
}
