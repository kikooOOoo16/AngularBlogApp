import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {Injectable} from '@angular/core';

@Injectable()
export class AuthInterceptor implements HttpInterceptor{

  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    if (token !== '' && token !== undefined) {
      const authRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
        // set only adds new headers doesn't overwrites unless the header already exists
      });
      return next.handle(authRequest);
    }
    return next.handle(req);
  }
}
