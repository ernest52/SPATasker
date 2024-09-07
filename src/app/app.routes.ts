import { Routes } from '@angular/router';
import { LoadingPageComponent } from './loading-page/loading-page.component';
import { NewTaskComponent } from './main-page/new-task/new-task.component';

export const routes: Routes = [
  {
    path: '',
    component: LoadingPageComponent,
    children: [{ path: 'user/newTask', component: NewTaskComponent }],
  },

  { path: '**', redirectTo: '/' },
];
