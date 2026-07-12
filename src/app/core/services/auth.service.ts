import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: any;
  csrfToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authUrl = `${environment.insforgeApiBaseUrl}/api/auth/sessions`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    // InsForge API authenticates client requests using 'Authorization: Bearer <anonKey>'
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.insforgeAppKey}`,
      'Content-Type': 'application/json'
    });
    
    return this.http.post<AuthResponse>(this.authUrl, { email, password }, { headers }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('lumi_admin_token', response.accessToken);
        }
        if (response && response.refreshToken) {
          localStorage.setItem('lumi_admin_refresh_token', response.refreshToken);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('lumi_admin_token');
    localStorage.removeItem('lumi_admin_refresh_token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('lumi_admin_token');
  }

  getToken(): string | null {
    return localStorage.getItem('lumi_admin_token');
  }

  refreshSession(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('lumi_admin_refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${environment.insforgeAppKey}`,
      'Content-Type': 'application/json'
    });

    const refreshUrl = `${environment.insforgeApiBaseUrl}/api/auth/refresh`;
    return this.http.post<AuthResponse>(refreshUrl, { refreshToken }, { headers }).pipe(
      tap(response => {
        if (response && response.accessToken) {
          localStorage.setItem('lumi_admin_token', response.accessToken);
        }
        if (response && response.refreshToken) {
          localStorage.setItem('lumi_admin_refresh_token', response.refreshToken);
        }
      })
    );
  }
}
