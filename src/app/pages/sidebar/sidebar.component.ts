import { Component, OnInit } from '@angular/core';
export interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  isAdmin?: boolean
}
export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'nc-laptop', class: '' },
  { path: '/admin', title: 'Admins', icon: 'nc-circle-10', class: '' },
  { path: '/users', title: 'Users', icon: 'nc-single-02', class: '' },
  { path: '/survey', title: 'Surveys', icon: 'nc-paper', class: '' },
  { path: '/user-response/id', title: 'User responses', icon: 'nc-mobile', class: '' },
  { path: '/library', title: 'Library', icon: 'nc-bookmark-2', class: '' },
  { path: '/rewards', title: 'Rewards', icon: 'nc-bookmark-2', class: '' },
  { path: '/reward-requests', title: 'Reward Requests', icon: 'nc-bookmark-2', class: '' },
  { path: '/notification', title: 'Send Notifications', icon: 'nc-bell-55', class: '' },
  // { path: '/settings', title: 'Settings', icon: 'nc-settings', class: '' },

];

@Component({
  moduleId: module.id,
  selector: 'sidebar-cmp',
  templateUrl: 'sidebar.component.html',
})

export class SidebarComponent implements OnInit {

  role: string = JSON.parse(localStorage.getItem("admin")).role
  routes: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard', icon: 'nc-laptop', class: '', isAdmin: ["user", "admin"].includes(this.role) },
    { path: '/admin', title: 'Admins', icon: 'nc-circle-10', class: '', isAdmin: ["admin"].includes(this.role) },
    { path: '/users', title: 'Users', icon: 'nc-single-02', class: '', isAdmin: ["admin"].includes(this.role) },
    { path: '/survey', title: 'Surveys', icon: 'nc-paper', class: '', isAdmin: ["user", "admin"].includes(this.role) },
    { path: '/user-response/id', title: 'User responses', icon: 'nc-mobile', class: '', isAdmin: ["user", "admin"].includes(this.role) },
    { path: '/library', title: 'Library', icon: 'nc-bookmark-2', class: '', isAdmin: ["admin"].includes(this.role) },
    { path: '/rewards', title: 'Rewards', icon: 'nc-trophy', class: '', isAdmin: ["admin"].includes(this.role) },
    { path: '/reward-requests', title: 'Reward Requests', icon: 'nc-money-coins ', class: '', isAdmin: ["admin"].includes(this.role) },
    { path: '/notification', title: 'Send Notifications', icon: 'nc-bell-55', class: '', isAdmin: ["admin"].includes(this.role) },
    // { path: '/settings', title: 'Settings', icon: 'nc-settings', class: '', isAdmin: ["admin"].includes(this.role) },

  ];



  constructor(


  ) {
  }

  public menuItems: any[];
  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
  }



}
