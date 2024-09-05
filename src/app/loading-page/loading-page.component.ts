import { Component, DestroyRef, inject, OnInit } from '@angular/core';

import { UserFormComponent } from './user-form/user-form.component';
import { MainPanelComponent } from './main-panel/main-panel.component';
import { UserService } from '../shared/user.service';
import { MainPageComponent } from '../main-page/main-page.component';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [UserFormComponent, MainPanelComponent, MainPageComponent],
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.scss',
})
export class LoadingPageComponent implements OnInit {
  showPanel = false;
  func = '';
  info = '';
  isAuth = false;
  userService = inject(UserService);
  destroyRef = inject(DestroyRef);
  constructor() {
    this.userService.setPanelObserv.subscribe({
      next: (panelData) => {
        this.func = panelData.value;
        this.info = panelData.message;
        if (this.func === '') {
          this.showPanel = false;
        }
      },
    });
    this.userService.autoAuth();
    this.userService.isAuthObserv.subscribe({
      next: (isAuth) => {
        this.isAuth = isAuth;
      },
    });
  }
  ngOnInit(): void {
    console.log('isAuth: ', this.isAuth);
  }
  logOut() {
    const logOutSub = this.userService.logOut().subscribe();
    console.log(`this.isAuth: `, this.isAuth);
    this.destroyRef.onDestroy(() => {
      logOutSub.unsubscribe();
    });
  }
  changeMode(mode: string | null = null) {
    this.info = '';
    if (mode) {
      this.func = mode;
      this.showPanel = true;
    }
  }
}
