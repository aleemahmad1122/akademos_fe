import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  url = environment.url
  imgURL = environment.url;


  constructor(private http: HttpClient, private router: Router) { }
  getOrder(): Observable<any> {
    return this.http.get(this.url + 'order/getall')
  }

  getDrivers(): Observable<any> {
    return this.http.get(this.url + 'driver/activedrivers')
  }

  getChefs(): Observable<any> {
    return this.http.get(this.url + 'chefs/allactivechefs')
  }
  update(id, data): Observable<any> {
    return this.http.post(this.url + 'order/update/' + id, data,)
  }
  assignChef(id, data): Observable<any> {
    return this.http.post(this.url + 'order/assignChefByAdmin/' + id, data,)
  }
  assignDriver(id, data): Observable<any> {
    return this.http.post(this.url + 'order/assignDriverByAdmin/' + id, data,)
  }





  //track history component Api's//
  getOrderByChefId(id): Observable<any> {
    return this.http.get(this.url + 'order/historyBychefId/' + id)
  }
  getOrderByDriverId(id): Observable<any> {
    return this.http.get(this.url + 'order/historyByDriverId/' + id)
  }

}



