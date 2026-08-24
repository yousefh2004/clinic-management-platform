import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppointmentRequest, AppointmentResponse, AppointmentStatus } from '../models/appointment.model';
import { PageResponse } from '../models/department.model';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly baseUrl = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  list(
    doctorId: string | null,
    patientId: string | null,
    fromDate: string | null,
    toDate: string | null,
    status: AppointmentStatus | null,
    page: number,
    size: number,
    sort?: string
  ): Observable<PageResponse<AppointmentResponse>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (doctorId) params = params.set('doctorId', doctorId);
    if (patientId) params = params.set('patientId', patientId);
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    if (status) params = params.set('status', status);
    if (sort) params = params.set('sort', sort);
    return this.http.get<PageResponse<AppointmentResponse>>(this.baseUrl, { params });
  }

  getById(id: string): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(`${this.baseUrl}/${id}`);
  }

  create(request: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(this.baseUrl, request);
  }

  update(id: string, request: AppointmentRequest): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(`${this.baseUrl}/${id}`, request);
  }

  cancel(id: string): Observable<AppointmentResponse> {
    return this.http.patch<AppointmentResponse>(`${this.baseUrl}/${id}/cancel`, {});
  }

  complete(id: string): Observable<AppointmentResponse> {
    return this.http.patch<AppointmentResponse>(`${this.baseUrl}/${id}/complete`, {});
  }
}