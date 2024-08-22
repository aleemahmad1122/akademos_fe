import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RewardsService {
  url = environment.url;
  constructor(private http: HttpClient, private router: Router) { }

  rewardList(): Observable<any> {
    return this.http.get(this.url + 'reward/allReward')
  }

  addReward(data: any): Observable<any> {
    console.log(data);

    return this.http.post(this.url + 'reward/create', data)
  }
  updateReward(id, data): Observable<any> {
    return this.http.post(this.url + 'reward/update/' + id, data)
  }

  deleteReward(id): Observable<any> {
    return this.http.delete(this.url + 'reward/delete/' + id)
  }
}
