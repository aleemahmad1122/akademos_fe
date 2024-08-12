import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from 'app/service/login.service';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  
  constructor(
    private _router : Router,
    private _service : LoginService){}

    canActivate():  boolean{

      if (localStorage.getItem('token')) {
        this._router.navigate(['/dashboard'])
        return false;
      } else {
        // this._router.navigate(['/login'])
        return true;
      }
      
    }
  
}