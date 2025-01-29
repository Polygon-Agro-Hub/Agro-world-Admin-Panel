import { Injectable } from '@angular/core';
import { environment } from '../../environment/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TokenService } from '../token/services/token.service';

interface centerData {
  id: number;
  regCode: string;
  centerName: string;
  contact01: string;
  contact02: string;
  buildingNumber: string;
  street: string
  district: string;
  province: string;
}

@Injectable({
  providedIn: 'root'
})
export class CollectionCenterService {
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
  constructor(private http: HttpClient, private tokenService: TokenService) { }

  

  getAllCollectionCenter(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-all-center`, {
      headers,
    });
  }

  deleteCollectionCenter(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    console.log("DELETE ITEM", id);
    return this.http.delete(`${this.apiUrl}auth/delete-collection-center/${id}`, {
      headers,
    });
  }

  createCollectionCenter(centerData: any, companies: any): Observable<any> {
    console.log(centerData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    })

    const payload = {
      ...centerData,
      companies,
    };
    console.log('hiii',payload);
    return this.http.post(`${this.apiUrl}auth/create-collection-center`, payload, {
      headers,
    })
    console.log(payload);
  }

  getAllComplain(page: number, limit: number, status: String, searchText: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}auth/get-all-complains?page=${page}&limit=${limit}`

    if (status) {
      url += `&status=${status}`
    }

    if (searchText) {
      url += `&searchText=${searchText}`
    }

    return this.http.get(url, {
      headers,
    });
  }

  getComplainById(id: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-complain-by-id/${id}`, {
      headers,
    });
  }



  getOfficerReportById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}auth/officer-details-monthly/${id}`, {
      headers,
    });
  }



  getAllCollectionCenterPage(page: number, limit: number, searchItem: string = ''): Observable<any> {
    console.log(page, limit, searchItem);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    let url = `${this.apiUrl}auth/get-all-centerpage?page=${page}&limit=${limit}`;
    if (searchItem) {
      url += `&searchItem=${searchItem}`;
    }

    return this.http.get<any>(url, { headers });
  }

  getCenterById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-center-by-id/${id}`, {
      headers,
    });
  }


  updateColectionCenter(centerData: any, id: number): Observable<any> {
    console.log(centerData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    })
    return this.http.patch(`${this.apiUrl}auth/update-center/${id}`, centerData, {
      headers,
    })
  }


  getForCreateId(role: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-last-emp-id/${role}`, {
      headers,
    });
  }



  getCollectionReportByOfficerId(fromDate: string, toDate: string, officerId: number): Observable<any> {
    const params = { fromDate, toDate, collectionOfficerId: officerId.toString() };
    return this.http.get<any>(`${this.apiUrl}auth/get-daily-report`, { params });
  }



  createCompany(companyData: any): Observable<any> {
    console.log(companyData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    })
    return this.http.post(`${this.apiUrl}auth/create-company`, companyData, {
      headers,
    })
  }



  getAllCompanyList(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-all-company-list`, {
      headers,
    });
  }



  getAllManagerList(companyId : any, centerId : any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('This is company Id',companyId)
    return this.http.get(`${this.apiUrl}auth/get-all-manager-list/${companyId}/${centerId}`, {
      headers,
    });
  }



  generateRegCode(province: string, district: string, city: string): Observable<{ regCode: string }> {
    return this.http.post<{ regCode: string }>(`${this.apiUrl}auth/generate-regcode`, { province, district, city });
  }
  
  getAllCompanyDetails(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}auth/get-all-company`, {
      headers,
    });
  }

  updateCompany(companyData:any, id: number): Observable<any> {
    console.log(companyData);

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    })
    return this.http.patch(`${this.apiUrl}auth/update-company/${id}`, companyData, {
      headers,
    })
  }

  getCompanyById( id: number): Observable<any> {

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    })
    return this.http.get(`${this.apiUrl}auth/get-company-by-id/${id}`, {
      headers,
    })
  }

  deleteCompany(id:number): Observable<any>{
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    console.log("DELETE ITEM", id);
    return this.http.delete(`${this.apiUrl}auth/delete-company/${id}`,{
      headers,
    })
  }
}
