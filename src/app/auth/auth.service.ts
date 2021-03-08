import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {AuthData} from './auth-data.model';
import {Observable, Subject} from 'rxjs';
import {Router} from '@angular/router';

@Injectable({providedIn: 'root'})
export  class AuthService {
  private isAuthenticated = false;
  private token: string;
  private authStatusObservable = new Subject<boolean>();
  private tokenExpirationTimer: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  createUser(email: string, password: string): void {
    const authData: AuthData = {
      email,
      password
    };
    this.http.post('http://localhost:3000/auth/signup', authData)
      .subscribe(res => {
        console.log(res);
      });
  }

  autoLoginUser(): void {
    const authData = this.getAutStatus();
    if (!authData) {
      return;
    }
    const now = new Date();
    const expiresIn = authData.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authData.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusObservable.next(true);
    }
  }

  loginUser(email: string, password: string): void {
    const authData: AuthData = {
      email,
      password
    };
    this.http.post<{message: string, token: string, expiresIn: number}>('http://localhost:3000/auth/login', authData)
      .subscribe(res => {
        this.token = res.token;
        if (this.token) {
          const expiresInDuration = res.expiresIn;
          this.setAuthTimer(expiresInDuration);
          this.isAuthenticated = true;
          this.authStatusObservable.next(true);
          const now = new Date();
          const expirationDate = new Date( now.getTime() + expiresInDuration * 1000);
          this.saveAuthStatus(this.token, expirationDate);
          this.router.navigate(['/']);
        }
      });
  }

  getToken(): string {
    return this.token;
  }

  getAuthStatusObservable(): Observable<boolean> {
    return this.authStatusObservable.asObservable();
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  logout(): void {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusObservable.next(false);
    this.router.navigate(['/']);
    this.clearAuthStatus();
    clearTimeout(this.tokenExpirationTimer);
  }

  private saveAuthStatus(token: string, expirationDate: Date): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString()); // Serialized and standardized version of the date
  }

  private clearAuthStatus(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
  }

  private getAutStatus(): { token: string, expirationDate: Date } {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    if (!token && !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate)
    };
  }

  private setAuthTimer(duration: number): void {
    console.log(`Setting timer ${duration}`);
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, duration  * 1000);
  }
}
