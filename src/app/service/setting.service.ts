import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  url = environment.url;
  constructor(private http: HttpClient, private router: Router) { }

  setting_list(): Observable<any> {
    return this.http.get(this.url + 'setting/getsettings')
  }







  add_aboutinfo(id, data): Observable<any> {
    return this.http.post(this.url + 'setting/create/' + id, data)
  }

  update_logo(data): Observable<any> {
    return this.http.post(this.url + 'setting/update_logo', data)
  }

  add_logo(data): Observable<any> {
    return this.http.post(this.url + 'setting/create_logo', data)
  }





}
