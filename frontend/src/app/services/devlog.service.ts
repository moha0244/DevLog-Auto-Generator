import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DevLogRequest, DevLogResponse } from '../models/github-api.model';

@Injectable({
  providedIn: 'root',
})
export class DevLogService {
  private readonly apiUrl = 'http://localhost:8000/api/v1';

  constructor(private http: HttpClient) {}

  generateDevLog(request: DevLogRequest): Observable<DevLogResponse> {
    return this.http.post<DevLogResponse>(`${this.apiUrl}/devlog/generate`, request);
  }
}
