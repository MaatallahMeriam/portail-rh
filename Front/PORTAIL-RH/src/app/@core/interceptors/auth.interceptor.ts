import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    console.log('Intercepteur - Token trouvé :', token);
    if (token) {
      const cloned = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      console.log('Intercepteur - Requête avec Authorization :', cloned.headers.get('Authorization'));
      return next.handle(cloned);
    }
    console.log('Intercepteur - Aucun token trouvé');
    return next.handle(req);
  }
}