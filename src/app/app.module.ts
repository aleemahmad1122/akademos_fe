import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ToastrModule } from "ngx-toastr";
import { FormsModule } from '@angular/forms';
import { SidebarModule } from './pages/sidebar/sidebar.module';
import { FooterModule } from './shared/footer/footer.module';
import { NavbarModule } from './shared/navbar/navbar.module';
import { FixedPluginModule } from './shared/fixedplugin/fixedplugin.module';
import { AppComponent } from './app.component';
import { AppRoutes } from './app.routing';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginService } from './service/login.service';
import { GuardGuard } from './guard/guard.guard';
import { TokenInterceptorService } from './service/token-interceptor.service';
import { AdminService } from './service/admin.service';
import { LoginGuard } from './guard/login.guard';
import { DragulaModule } from 'ng2-dragula';
import { SettingService } from './service/setting.service';
import { CommonModule } from '@angular/common';
import { AgmCoreModule } from "@agm/core";
import { environment } from "environments/environment";

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    LoginComponent,
  ],
  imports: [
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    CommonModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(), 
    DragulaModule.forRoot(),
    RouterModule.forRoot(AppRoutes, {
      useHash: true
    }),
    SidebarModule,
    NavbarModule,
    ToastrModule.forRoot(),
    FooterModule,
    FixedPluginModule,
    FormsModule,
    AgmCoreModule.forRoot({
      apiKey: environment.google_api_key,
      libraries: ["places", "geometry"],
    }),
  ],
  providers: [
    LoginService,
    GuardGuard,
    LoginGuard,
    AdminService,
    SettingService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptorService,
      multi: true
    }],
    
  bootstrap: [AppComponent]
})
export class AppModule {
}
