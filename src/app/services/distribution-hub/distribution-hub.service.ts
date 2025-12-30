import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TokenService } from '../token/services/token.service';
import { environment } from '../../environment/environment';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DistributionHubService {
  resetPassword(itemId: number, arg1: { currentPassword: string; newPassword: string; }) {
    throw new Error('Method not implemented.');
  }
  checkDuplicates(payload: { nic: string; email: string; phoneNumber01: string; phoneNumber02: string; excludeId: number; }) {
    throw new Error('Method not implemented.');
  }
  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();
  constructor(private http: HttpClient, private tokenService: TokenService) { }

  getAllCompanyDetails(search: string = ''): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-companies`;
    if (search) {
      url += `?search=${search}`;
    }

    return this.http.get<any>(url, { headers });
  }

  deleteCompany(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    console.log('DELETE ITEM', id);
    return this.http.delete(`${this.apiUrl}distribution/delete-company/${id}`, {
      headers,
    });
  }

  getAllDistributionCompanyHeads(
    companyId: number,
    page: number,
    limit: number,
    searchText: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    let url = `${this.apiUrl}distribution/get-distributioncompany-head?companyId=${companyId}&page=${page}&limit=${limit}`;
    if (searchText) {
      url += `&searchText=${searchText}`;
    }

    return this.http.get(url, {
      headers,
    });
  }

  createDistributionHead(person: any, selectedImage: any): Observable<any> {
    const formData = new FormData();
    formData.append('officerData', JSON.stringify(person));

    if (selectedImage) {
      formData.append('file', selectedImage);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}distribution/create-distribution-head`,
      formData,
      { headers }
    ).pipe(
      catchError((error: any) => {
        // Handle the new error format from backend
        let errorMessage = 'An unexpected error occurred';

        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.status === 400) {
          errorMessage = error.error?.error || 'Validation failed';
        }

        return throwError(() => ({
          error: errorMessage,
          duplicateFields: error.error?.duplicateFields || []
        }));
      })
    );
  }

  getAllCompanyList(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}distribution/get-all-company-list`, {
      headers,
    });
  }

  getAllDistributedCentersByCompany(companyId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(
      `${this.apiUrl}distribution/get-all-centers-by-company/${companyId}`,
      {
        headers,
      }
    );
  }

  deleteDistributionHead(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/delete-officer/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  getDistributionHeadDetailsById(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get(
      `${this.apiUrl}distribution/get-distribution-head/${id}`,
      { headers }
    );
  }

  updateDistributionHeadDetails(id: number, updateData: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.put(
      `${this.apiUrl}distribution/update-collection-officer/${id}`,
      updateData,
      { headers }
    );
  }

  getAllDistributionCenterByCompany(companyId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(
      `${this.apiUrl}distribution/get-all-distribution-center-by-company/${companyId}`,
      {
        headers,
      }
    );
  }

  fetchAllDistributionOfficers(
    page: number,
    limit: number,
    centerStatus: string = '',
    status: string = '',
    searchNIC: string = '',
    company: string,
    role: string
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log(company);


    let url = `${this.apiUrl}distribution/get-all-distribution-officers?page=${page}&limit=${limit}`;

    if (company) {
      url += `&company=${company}`;
    }

    if (centerStatus) {
      url += `&centerStatus=${centerStatus}`
    }

    if (status) {
      url += `&status=${status}`
    }

    if (role) {
      url += `&role=${role}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }

  fetchAllDistributionOfficercenter(
    page: number,
    limit: number,
    centerStatus: string = '',
    status: string = '',
    searchNIC: string = '',
    company: string,
    role: string,
    centerId: any = ''
  ): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log(company);


    let url = `${this.apiUrl}distribution/get-all-distribution-officers?page=${page}&limit=${limit}`;
    if (centerId) {
      url += `&centerId=${centerId}`;
    }
    if (company) {
      url += `&company=${company}`;
    }

    if (centerStatus) {
      url += `&centerStatus=${centerStatus}`
    }

    if (status) {
      url += `&status=${status}`
    }



    if (role) {
      url += `&role=${role}`;
    }

    if (searchNIC) {
      url += `&nic=${searchNIC}`;
    }
    return this.http.get<any>(url, { headers });
  }

  getDistributionCenterNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-distributed-center-names`;
    return this.http.get<any>(url, { headers });
  }

  getDistributionCenterManagerNames(id: string | null): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-distribution-manager-names/${id}`;
    return this.http.get<any>(url, { headers });
  }

  deleteDistributionOfficer(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/delete-distribution-officer/${id}`;
    return this.http.delete<any>(url, { headers });
  }

  ChangeStatus(id: number | null, status: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/update-status/${id}/${status}`;
    return this.http.get<any>(url, { headers });
  }

  getCompanyNames(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let url = `${this.apiUrl}distribution/get-all-company-names`;
    return this.http.get<any>(url, { headers });
  }

  createDistributionOfficer(
    person: any,
    selectedImage: any,
    driver?: any,
    licFront?: any,
    licBack?: any,
    insFront?: any,
    insBack?: any,
    vehiFront?: any,
    vehiBack?: any,
    vehiSideA?: any,
    vehiSideB?: any
  ): Observable<any> {
    const formData = new FormData();

    // Add driver data if jobRole is Driver
    if (person.jobRole === 'Driver' && driver) {
      formData.append('driverData', JSON.stringify(driver));
      if (licFront) formData.append('licFront', licFront);
      if (licBack) formData.append('licBack', licBack);
      if (insFront) formData.append('insFront', insFront);
      if (insBack) formData.append('insBack', insBack);
      if (vehiFront) formData.append('vehiFront', vehiFront);
      if (vehiBack) formData.append('vehiBack', vehiBack);
      if (vehiSideA) formData.append('vehiSideA', vehiSideA);
      if (vehiSideB) formData.append('vehiSideB', vehiSideB);
    }

    formData.append("officerData", JSON.stringify(person));

    if (selectedImage) {
      formData.append('file', selectedImage);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.post(
      `${this.apiUrl}distribution/create-distribution-officer`,
      formData,
      { headers }
    );
  }

  getAllManagerList(companyId: any, centerId: any): Observable<any> {
    console.log('companyId', companyId, 'centerId', centerId)
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('This is company Id', companyId);
    return this.http.get(
      `${this.apiUrl}distribution/get-all-distribution-manager-list/${companyId}/${centerId}`,
      {
        headers,
      }
    );
  }

  getForCreateId(role: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}distribution/get-last-emp-id/${role}`, {
      headers,
    });
  }

  getAssignForCityes(province: string, district: string): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.get(`${this.apiUrl}distribution/get-all-assigning-cities/${province}/${district}`, {
      headers,
    });
  }

  AssigCityToDistributedCenter(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}distribution/assign-city-to-distributed-center`, data, {
      headers,
    });
  }

  removeAssigCityToDistributedCenter(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    return this.http.post(`${this.apiUrl}distribution/remove-assign-city-to-distributed-center`, data, {
      headers,
    });
  }

  getOfficerReportById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}distribution/officer-details-monthly/${id}`, {
      headers,
    });
  }

 editDistributionOfficer(
  person: any,
  id: number,
  selectedImage: any,
  driver?: any,
  licFront?: any,
  licBack?: any,
  insFront?: any,
  insBack?: any,
  vehiFront?: any,
  vehiBack?: any,
  vehiSideA?: any,
  vehiSideB?: any
): Observable<any> {
  const formData = new FormData();
  
  // Attach officer data
  formData.append('officerData', JSON.stringify(person));
  
  // Attach profile image if provided
  if (selectedImage) {
    formData.append('file', selectedImage);
  }

  // Add driver data if jobRole is Driver
  if (person.jobRole === 'Driver' && driver) {
    formData.append('driverData', JSON.stringify(driver));
    
    // Attach driver-related images only if they are new files
    if (licFront) formData.append('licFront', licFront);
    if (licBack) formData.append('licBack', licBack);
    if (insFront) formData.append('insFront', insFront);
    if (insBack) formData.append('insBack', insBack);
    if (vehiFront) formData.append('vehiFront', vehiFront);
    if (vehiBack) formData.append('vehiBack', vehiBack);
    if (vehiSideA) formData.append('vehiSideA', vehiSideA);
    if (vehiSideB) formData.append('vehiSideB', vehiSideB);
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  return this.http.put(
    `${this.apiUrl}distribution/update-distribution-officer-details/${id}`,
    formData,
    { headers }
  );
}


  claimDistributedOfficer(data: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.patch(`${this.apiUrl}distribution/claim-distributed-Officer`, data, {
      headers,
    });
  }

  getOfficerById(id: number) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get(`${this.apiUrl}distribution/get-officer-details/${id}`, {
      headers,
    });
  }

  getDistributionCentreList(companyId: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });
    console.log('This is company Id', companyId);
    return this.http.get(
      `${this.apiUrl}distribution/get-all-distribution-center-list/${companyId}`,
      {
        headers,
      }
    );
  }

  // Get all return reasons
  getAllReturnReasons(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.apiUrl}distribution/get-all-return-reasons`, { headers });
  }

  // Get return reason by ID
  getReturnReasonById(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.apiUrl}distribution/get-return-reason/${id}`, { headers });
  }

  // Create new return reason
  createReturnReason(reasonData: { rsnEnglish: string; rsnSinhala: string; rsnTamil: string }): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.apiUrl}distribution/create-return-reason`, reasonData, { headers });
  }

  // Delete return reason
  deleteReturnReason(id: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.delete<any>(`${this.apiUrl}distribution/delete-return-reason/${id}`, { headers });
  }

  // Update indexes after reordering
  updateReturnReasonIndexes(reasons: { id: number; indexNo: number }[]): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.post<any>(`${this.apiUrl}distribution/update-return-reason-indexes`, { reasons }, { headers });
  }

  // Get next available index
  getNextReturnReasonIndex(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    return this.http.get<any>(`${this.apiUrl}distribution/get-next-return-reason-index`, { headers });
  }

  getAllHoldReasons(): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http.get<any>(`${this.apiUrl}distribution/get-all-hold-reasons`, { headers });
}


getHoldReasonById(id: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http.get<any>(`${this.apiUrl}distribution/get-hold-reason/${id}`, { headers });
}


createHoldReason(reasonData: { rsnEnglish: string; rsnSinhala: string; rsnTamil: string }): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http.post<any>(`${this.apiUrl}distribution/create-hold-reason`, reasonData, { headers });
}


deleteHoldReason(id: number): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http.delete<any>(`${this.apiUrl}distribution/delete-hold-reason/${id}`, { headers });
}


updateHoldReasonIndexes(reasons: { id: number; indexNo: number }[]): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http.post<any>(`${this.apiUrl}distribution/update-hold-reason-indexes`, { reasons }, { headers });
}


getNextHoldReasonIndex(): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
    'Content-Type': 'application/json',
  });

  return this.http.get<any>(`${this.apiUrl}distribution/get-next-hold-reason-index`, { headers });
}

getTodaysDeliveries(regCode?: string, invNo?: string, searchType: string = 'partial'): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    });

    let params = new HttpParams();
    
    if (regCode) {
      params = params.set('regCode', regCode);
    }
    
    if (invNo) {
      params = params.set('invNo', invNo);
    }
    
    params = params.set('searchType', searchType);

    return this.http.get<any>(
      `${this.apiUrl}distribution/get-todays-deliveries`, 
      { 
        headers, 
        params 
      }
    );
  }

  // Get all centers for dropdown filter (from distributed vehicles)
  getAllCentersForVehicles(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}distribution/get-distributed-vehicles?page=1&limit=1000`, { headers });
  }

  // Get all vehicle types for dropdown filter (from distributed vehicles)
  getAllVehicleTypes(): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    return this.http.get<any>(`${this.apiUrl}distribution/get-distributed-vehicles?page=1&limit=1000`, { headers });
  }
}


