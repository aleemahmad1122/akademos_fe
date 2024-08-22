import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  url = environment.url;
  constructor(private http: HttpClient, private router: Router) { }

  uploadImage(file): Observable<any> {
    const fd = new FormData();
    fd.append('image', file);
    return this.http.post(this.url + 'uploads/', fd);
  }

  ///////////////////////////ALLCOUNTS////////////////////////////////////

  allCounts(): Observable<any> {
    return this.http.get(this.url + 'user/allCounts')
  }

  //////////////////////////ADMIN////////////////////////////////////////

  adminlist(): Observable<any> {
    return this.http.get(this.url + 'admin/allAdmin')
  }

  addadmin(data): Observable<any> {
    return this.http.post(this.url + 'admin/create', data)
  }
  updateadmin(id, data): Observable<any> {
    return this.http.post(this.url + 'admin/update/' + id, data)
  }

  deleteadmin(id): Observable<any> {
    return this.http.get(this.url + 'admin/delete/' + id)
  }

  /////////////////////////USER////////////////////

  addUser(data): Observable<any> {
    return this.http.post(this.url + 'user/create', data)
  }

  updateUser(id, data): Observable<any> {
    return this.http.post(this.url + 'user/update/' + id, data,)
  }
  userCount(): Observable<any> {
    return this.http.get(this.url + 'user/userCount')
  }
  userList(): Observable<any> {
    return this.http.get(this.url + 'user/allusers')
  }
  download(id): Observable<any> {
    return this.http.get(this.url + 'user/download/' + id, { responseType: 'blob' })
  }
  downloadAll(): Observable<any> {
    return this.http.get(this.url + 'user/download-all', { responseType: 'blob' })
  }


  /////////////////////////IMAGES////////////////////

  addImage(data): Observable<any> {
    return this.http.post(this.url + 'image/create', data)
  }

  updateImage(id, data): Observable<any> {
    return this.http.post(this.url + 'image/update/' + id, data,)
  }
  imageCount(): Observable<any> {
    return this.http.get(this.url + 'image/imageCount')
  }
  imageList(): Observable<any> {
    return this.http.get(this.url + 'image/allImage')
  }

  ///////////////////////REVIEW///////////////////
  reviewList(): Observable<any> {
    return this.http.get(this.url + 'review/getAllReview')
  }

  //////////////////////SETTINGS///////////////////////

  setting_list(): Observable<any> {
    return this.http.get(this.url + 'setting/getsettings')
  }


  /////////////////////admin notifications/////////////////
  sendnoti(data): Observable<any> {
    return this.http.post(this.url + 'notification/send', data)
  }
  deleteNotif(id): Observable<any> {
    return this.http.post(this.url + 'notification/deleteByNotifId', id)
  }


  // updateUser(id, data): Observable<any> {
  //   return this.http.post(this.url + 'user/update/' + id, data,)
  // }
  // userCount(): Observable<any> {
  //   return this.http.get(this.url + 'user/userCount')
  // }
  adminnotilist(): Observable<any> {
    return this.http.get(this.url + 'notification/allNotification')
  }

}
