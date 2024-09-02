import { Component, OnInit } from '@angular/core';

import { UserFormComponent } from './user-form/user-form.component';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [UserFormComponent],
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.scss',
})
export class LoadingPageComponent implements OnInit {
  showPanel = false;
  func = '';
  isAuth = false;
  constructor(userService: UserService) {
    userService.autoAuth();
    userService.isAuthObserv.subscribe({
      next: (isAuth) => {
        this.isAuth = isAuth;
      },
    });
  }
  ngOnInit(): void {
    console.log('isAuth: ', this.isAuth);
  }
  changePanel(func: string | null = null) {
    if (func) {
      this.func = func;
    } else {
      localStorage.getItem('username') && localStorage.removeItem('username');
      localStorage.getItem('password') && localStorage.removeItem('password');
      localStorage.getItem('mode') && localStorage.removeItem('mode');
    }
    this.showPanel = !this.showPanel;
  }
}
