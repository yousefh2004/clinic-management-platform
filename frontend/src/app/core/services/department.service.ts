import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DepartmentRequest, DepartmentResponse, PageResponse } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly baseUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) {}

  list(name: string, page: number, size: number, sort?: string): Observable<PageResponse<DepartmentResponse>> {
  let params = new HttpParams().set('page', page).set('size', size);
  if (name) params = params.set('name', name);
  if (sort) params = params.set('sort', sort);
  return this.http.get<PageResponse<DepartmentResponse>>(this.baseUrl, { params });
}

  listAll(): Observable<PageResponse<DepartmentResponse>> {
  return this.list('', 0, 100);
}

  getById(id: string): Observable<DepartmentResponse> {
    return this.http.get<DepartmentResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(this.baseUrl, request);
  }

  update(id: string, request: DepartmentRequest): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.baseUrl}/${id}`, request);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}