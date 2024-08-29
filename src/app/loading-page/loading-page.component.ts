import { Component } from '@angular/core';

import { UserFormComponent } from './user-form/user-form.component';

@Component({
  selector: 'app-loading-page',
  standalone: true,
  imports: [UserFormComponent],
  templateUrl: './loading-page.component.html',
  styleUrl: './loading-page.component.scss',
})
export class LoadingPageComponent {
  showPanel = false;
  func = '';
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
