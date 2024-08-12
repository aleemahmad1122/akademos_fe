import { Routes } from '@angular/router';

import { DashboardComponent } from '../../pages/dashboard/dashboard.component';
import { IconsComponent } from '../../pages/icons/icons.component';
import { AdminComponent } from 'app/pages/admin/admin.component';
import { AboutComponent } from 'app/pages/setting/setting.component';
import { UsersComponent } from 'app/pages/users/users.component';
import { SurveyComponent } from 'app/pages/surveys/surveys.component';
import { SurveydetailComponent } from 'app/pages/surveydetail/surveydetail.component';
import { NotificationsComponent } from 'app/pages/notifications/notifications.component';
import { LibraryComponent } from 'app/pages/library/library.component';
import { LibrarydetailComponent } from 'app/pages/librarydetail/librarydetail.component';
import { UserresponseComponent } from 'app/pages/user-response/user-response.component';
import { UsersingleresponseComponent } from 'app/pages/user-single-response/user-single-response.component';
import { RewardsComponent } from 'app/pages/rewards/rewards.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'dashboard', component: DashboardComponent },
  { path: 'icons', component: IconsComponent },
  // { path: 'allusers', component: UserlistComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'rewards', component: RewardsComponent },
  { path: 'users', component: UsersComponent },
  { path: 'survey', component: SurveyComponent },
  { path: 'user-response/:id', component: UserresponseComponent },
  { path: 'notification', component: NotificationsComponent },
  { path: 'library', component: LibraryComponent },
  { path: 'surveydetail/:isEdit/:_id', component: SurveydetailComponent },
  { path: 'librarydetail/:isEdit/:_id', component: LibrarydetailComponent },
  { path: 'user-single-response/:_id/:surveyId', component: UsersingleresponseComponent },
  { path: 'settings', component: AboutComponent },

];
