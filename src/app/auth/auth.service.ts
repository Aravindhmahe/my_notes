import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { UserDetails } from './models/userdetails.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private URL_DOMAIN = `http://localhost:3000/`;
  private authToken!: string;
  private isAuthenticated!: boolean;
  private authTimer!: any;
  private userId!: string | null;
  private authStatusListener = new Subject();

  constructor(private http: HttpClient, private router: Router) {}

  public registerUser(userDetails: UserDetails): Observable<any> {
    return this.http.post(this.URL_DOMAIN + `api/auth/signup`, userDetails);
  }

  public getAuth(): boolean {
    return this.isAuthenticated;
  }

  public getUserId(): string | null {
    return this.userId;
  }

  public userLogin(email: string, password: string) {
    const loginDetails = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        this.URL_DOMAIN + `api/auth/login`,
        loginDetails
      )
      .subscribe((response) => {
        this.authToken = response.token;
        if (this.authToken) {
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusTimer(response.expiresIn);
          const now = new Date();
          const expireDate = new Date(
            now.getTime() + response.expiresIn * 1000
          );
          this.saveAuthData(response.token, expireDate, this.userId);
          this.authStatusListener.next(true);
          this.router.navigate(['/']);
        }
      });
  }

  private authStatusTimer(timeout: number): void {
    console.log('Setting timer: ', timeout);
    this.authTimer = setTimeout(() => {
      this.logout();
    }, timeout * 1000);
  }

  autoAuthUser(): void {
    const autoLoginInformation = this.getAuthData();
    const now = new Date();
    if (autoLoginInformation) {
      const expiresIn =
        autoLoginInformation.expiration.getTime() - now.getTime();
      if (expiresIn > 0) {
        this.authToken = autoLoginInformation.token;
        this.isAuthenticated = true;
        this.userId = autoLoginInformation.userId;
        this.authStatusListener.next(true);
        this.authStatusTimer(expiresIn / 1000);
      }
    }
  }

  public getAuthToken(): string {
    return this.authToken;
  }

  public listenAuthStatus(): Observable<any> {
    return this.authStatusListener.asObservable();
  }

  public logout(): void {
    this.authToken = this.userId = '';
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearInterval(this.authTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');

    if (!token || !expiration) {
      return null;
    }

    return { token: token, expiration: new Date(expiration), userId: userId };
  }
}
