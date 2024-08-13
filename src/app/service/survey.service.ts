import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';



interface RewardsListParams {
  fullName?: string;
  minPoints?: string;
  maxPoints?: string;
  paymentMethod?: string;
  gender?: string;
  minAge?: string;
  maxAge?: string;
  minIncome?: string;
  maxIncome?: string;
  status?: string;
  occupation?: string;
  maritalStatus?: string;
}


@Injectable({
  providedIn: 'root'
})

export class SurveyService {
  url = environment.url;
  constructor(private http: HttpClient, private router: Router) { }

  surveyList(status?: string): Observable<any> {
    const endpoint = status ? (status == 'all' ? 'survey/allsurveys' : `survey/allsurveys?status=${status}`) : 'survey/allsurveys';
    return this.http.get(this.url + endpoint);
  }
  getSurveyById(_id): Observable<any> {
    return this.http.get(this.url + 'survey/surveyById/' + _id)
  }

  addSurvey(data): Observable<any> {
    return this.http.post(this.url + 'survey/create', data)
  }
  updateSurvey(id, data): Observable<any> {
    return this.http.post(this.url + 'survey/update/' + id, data)
  }

  deleteSurvey(id): Observable<any> {
    return this.http.get(this.url + 'survey/delete/' + id)
  }
  addLibrary(data): Observable<any> {
    return this.http.post(this.url + 'survey/create-library', data)
  }

  updateLibrary(data): Observable<any> {
    return this.http.post(this.url + 'survey/update-library', data)
  }


  libraryList(): Observable<any> {
    return this.http.get(this.url + 'survey/all-library')
  }

  getLibraryById(_id): Observable<any> {
    return this.http.get(this.url + 'survey/library-by-id/' + _id)
  }



  // rewards list
  rewardsList(params: RewardsListParams): Observable<any> {
    let httpParams = new HttpParams();

    for (const key of Object.keys(params)) {
      if (params[key] !== undefined && params[key] !== null) {
        httpParams = httpParams.append(key, params[key].toString());
      }
    }

    return this.http.get(this.url + 'userresponse/get-all-user-rewards', { params: httpParams });
  }


  updateReward(id, data): Observable<any> {
    return this.http.post(this.url + 'userresponse/update-user-reward/' + id, data)
  }
  // reponse list
  responseList(surveyId): Observable<any> {
    return this.http.get(this.url + 'userresponse/get-user-responseBySurveyId/' + surveyId)
  }
  getResponseById(_id, surveyId): Observable<any> {
    return this.http.get(this.url + 'userresponse/get-user-responseById/' + _id + '/' + surveyId)
  }

  updateUserResponse(id, data): Observable<any> {
    return this.http.post(this.url + 'userresponse/update/' + id, data)
  }

  updateUserReward(id, data): Observable<any> {
    return this.http.post(this.url + 'userresponse/update/' + id, data)
  }


}
