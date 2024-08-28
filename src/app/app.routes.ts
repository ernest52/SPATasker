import { Routes } from '@angular/router';
import { LoadingPageComponent } from './loading-page/loading-page.component';

export const routes: Routes = [
  { path: '', component: LoadingPageComponent },
  { path: '**', redirectTo: '/' },
];
