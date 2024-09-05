import { Component, DestroyRef, inject } from '@angular/core';
import { UserService } from '../shared/user.service';

@Component({
  selector: 'app-main-page',
  standalone: true,
  imports: [],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.scss',
})
export class MainPageComponent {
  destroyRef = inject(DestroyRef);
  userService = inject(UserService);
  logOut() {
    const logOutSub = this.userService.logOut().subscribe();
    this.destroyRef.onDestroy(() => {
      logOutSub.unsubscribe();
    });
  }
}
