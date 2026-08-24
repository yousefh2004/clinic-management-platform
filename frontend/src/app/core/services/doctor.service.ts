import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DoctorRequest, DoctorResponse } from '../models/doctor.model';
import { PageResponse } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private readonly baseUrl = `${environment.apiUrl}/doctors`;

  constructor(private http: HttpClient) {}

  list(
    name: string,
    departmentId: string | null,
    active: boolean | null,
    page: number,
    size: number,
    sort?: string
  ): Observable<PageResponse<DoctorResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (name) params = params.set('name', name);
    if (departmentId) params = params.set('departmentId', departmentId);
    if (active !== null) params = params.set('active', active);
    if (sort) params = params.set('sort', sort);
    return this.http.get<PageResponse<DoctorResponse>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<DoctorResponse> {
    return this.http.get<DoctorResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: DoctorRequest): Observable<DoctorResponse> {
    return this.http.post<DoctorResponse>(this.baseUrl, request);
  }

  update(id: string, request: DoctorRequest): Observable<DoctorResponse> {
    return this.http.put<DoctorResponse>(`${this.baseUrl}/${id}`, request);
  }

  deactivate(id: string): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/deactivate`, {});
  }

  searchByName(name: string): Observable<DoctorResponse[]> {
  return this.list(name, null, true, 0, 10).pipe(map((res) => res.content));
}
}