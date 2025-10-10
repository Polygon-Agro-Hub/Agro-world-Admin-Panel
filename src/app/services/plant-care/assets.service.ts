import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environment/environment";
import { Observable } from "rxjs";
import { TokenService } from "../token/services/token.service";

@Injectable({
  providedIn: "root",
})
export class AssetsService {
  constructor(
    private http: HttpClient,
    private tokenService: TokenService,
  ) { }

  private apiUrl = `${environment.API_URL}`;
  private token = this.tokenService.getToken();

  getAllBuildingFixedAsset(itemId: number, category: any, farmId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    console.log("itemId", itemId);
    console.log("category", category);
    console.log("farmId", farmId);

    let url = `${this.apiUrl}auth/get-fixed-assets/${itemId}/${category}/${farmId}`;

    return this.http.get<any>(url, { headers });
  }

  getBuildingOwnershipDetails(buildingAssetId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    console.log("buildingAssetId", buildingAssetId);

    let url = `${this.apiUrl}auth/get-fixed-assets/building-ownership/${buildingAssetId}`;

    return this.http.get<any>(url, { headers });
  }

  getLandOwnershipDetails(landAssetId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    console.log("landAssetId", landAssetId);

    let url = `${this.apiUrl}auth/get-fixed-assets/land-ownership/${landAssetId}`;

    return this.http.get<any>(url, { headers });
  }

  getCurrentAssertById(userId: string, farmId: number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    return this.http.get<any>(
      `${this.apiUrl}auth/get-current-assert/${userId}/${farmId}`,
      { headers },
    );
  }

  getAllCurrentAsset(userId: number, category: string ,farmId:number): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}auth/get-current-assets-view/${userId}/${category}/${farmId}`;
    let res = this.http.get<any>(url, { headers });
    console.log(res);

    return res;
  }

  getAllCurrentAssetRecord(id: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });
    let url = `${this.apiUrl}auth/get-current-asset-report/${id}`;
    let res = this.http.get<any>(url, { headers });
    console.log(res);

    return res;
  }
}