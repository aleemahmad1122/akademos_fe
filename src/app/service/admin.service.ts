import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  url = environment.url;
  constructor(private http: HttpClient, private router: Router) { }

  adminList(): Observable<any> {
    return this.http.get(this.url + 'admin/allAdmin')
  }

  addAdmin(data): Observable<any> {
    return this.http.post(this.url + 'admin/create', data)
  }
  updateAdmin(id, data): Observable<any> {
    return this.http.post(this.url + 'admin/update/' + id, data)
  }

  deleteAdmin(id): Observable<any> {
    return this.http.get(this.url + 'admin/delete/' + id)
  }





}
