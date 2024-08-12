import { Injectable } from '@angular/core';
import { Router, CanActivateChild } from '@angular/router';
import { Observable } from 'rxjs';
import { LoginService } from 'app/service/login.service';

@Injectable({
  providedIn: 'root'
})
export class GuardGuard implements  CanActivateChild {
  
  constructor(
    private _router : Router,
    private _service : LoginService){}

    canActivateChild():  boolean{

      if (localStorage.getItem('token')) {
        return true;
      } else {
        this._router.navigate(['/login'])
        return false
      }
      
    }
  
}