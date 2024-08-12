import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  url = environment.url;

  constructor(private http: HttpClient, private router: Router) { }

  checkuser(data): Observable<any> {
    return this.http.post(this.url + 'admin/login', data)
  }
  LoggedIn() {
    return localStorage.getItem('token')
  }
  getToken() {
    return localStorage.getItem('token')
  }
  checkemail(data): Observable<any> {
    return this.http.post(this.url + "admin/check_email", data)
  }
  changepassword(id, data): Observable<any> {
    let dataa = {
      password: data
    }
    return this.http.post(this.url + 'admin/editpassword/' + id, dataa)
  }
}
