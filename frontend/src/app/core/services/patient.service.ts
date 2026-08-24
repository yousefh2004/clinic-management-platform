import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PatientRequest, PatientResponse } from '../models/patient.model';
import { PageResponse } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private readonly baseUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  list(
    name: string,
    phoneNumber: string,
    active: boolean | null,
    page: number,
    size: number,
    sort?: string
  ): Observable<PageResponse<PatientResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (name) params = params.set('name', name);
    if (phoneNumber) params = params.set('phoneNumber', phoneNumber);
    if (active !== null) params = params.set('active', active);
    if (sort) params = params.set('sort', sort);
    return this.http.get<PageResponse<PatientResponse>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<PatientResponse> {
    return this.http.get<PatientResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: PatientRequest): Observable<PatientResponse> {
    return this.http.post<PatientResponse>(this.baseUrl, request);
  }

  update(id: string, request: PatientRequest): Observable<PatientResponse> {
    return this.http.put<PatientResponse>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  searchByName(name: string): Observable<PatientResponse[]> {
  return this.list(name, '', true, 0, 10).pipe(map((res) => res.content));
}
}