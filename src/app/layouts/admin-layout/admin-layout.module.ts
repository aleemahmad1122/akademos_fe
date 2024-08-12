import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AdminComponent } from 'app/pages/admin/admin.component';
import { DragulaModule } from 'ng2-dragula';
// import { DemoUtilsModule } from '../demo-utils/module';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DemoUtilsModule } from '../../demo-utils/module';
import { AboutComponent } from 'app/pages/setting/setting.component';
import { CKEditorModule } from 'ckeditor4-angular';

// import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { UsersComponent } from 'app/pages/users/users.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { AgmCoreModule } from '@agm/core';
import { SurveyComponent } from 'app/pages/surveys/surveys.component';
import { SurveydetailComponent } from 'app/pages/surveydetail/surveydetail.component';
import { NotificationsComponent } from 'app/pages/notifications/notifications.component';
import { LibraryComponent } from 'app/pages/library/library.component';
import { LibrarydetailComponent } from 'app/pages/librarydetail/librarydetail.component';
import { UserresponseComponent } from 'app/pages/user-response/user-response.component';
import { UsersingleresponseComponent } from 'app/pages/user-single-response/user-single-response.component';
import { RewardsComponent } from 'app/pages/rewards/rewards.component';
import { environment } from 'environments/environment';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    DragulaModule.forRoot(),
    CKEditorModule,
    Ng2SearchPipeModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyB6lRoJH7PGm-5ud2z1unNcCBKhsGuLrZs',
      // libraries: ['places']
    }),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    DemoUtilsModule,
    NgSelectModule,
    AgmCoreModule.forRoot({
      apiKey: environment.google_api_key,
      libraries: ["places", "geometry"],
    }),
  ],
  declarations: [
    DashboardComponent,
    IconsComponent,
    AdminComponent,
    AboutComponent,
    UsersComponent,
    SurveyComponent,
    SurveydetailComponent,
    NotificationsComponent,
    LibraryComponent,
    LibrarydetailComponent,
    UserresponseComponent,
    UsersingleresponseComponent,
    RewardsComponent,
    ],


})

export class AdminLayoutModule { }
