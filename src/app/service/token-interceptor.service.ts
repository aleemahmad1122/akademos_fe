import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { LoginService } from './login.service';
import 'rxjs/add/operator/do';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private injector: Injector, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let _service = this.injector.get(LoginService);


    let tokenizedReq = request.clone({
      setHeaders: {
        jwt: _service.getToken() ? _service.getToken() : ''
      }
    })
    return next.handle(tokenizedReq).do(event => { }, err => {
      if (err instanceof HttpErrorResponse && err.status === 401) {
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    });

  }




}
