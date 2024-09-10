import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map } from 'rxjs';
import type Task from './task.model';
@Injectable({ providedIn: 'root' })
export class UserService {
  httpClient = inject(HttpClient);
  token = '';
  expiresIn = '';
  private isAuth = new BehaviorSubject(false);
  private setPanel = new BehaviorSubject({ value: '', message: '' });
  get isAuthObserv() {
    return this.isAuth.asObservable();
  }
  setPanelFn(setPanel: { value: string; message: string }) {
    this.setPanel.next(setPanel);
  }
  get setPanelObserv() {
    return this.setPanel.asObservable();
  }
  addNewTask(task: Task) {
    return this.httpClient.post<{ message: string }>(
      'http://localhost:3000/user/tasks',
      { task }
    );
  }
  logInUser(email: string, password: string) {
    const url = `http://localhost:3000/user/signin`;
    return this.httpClient
      .post<{ message: string; token: string; expiresIn: string }>(url, {
        email,
        password,
      })
      .pipe(
        map((resp) => {
          this.token = resp.token;
          this.expiresIn = resp.expiresIn;
          this.isAuth.next(true);
          this.addToLocalStorage(this.token, this.expiresIn);
          this.autoAuth();
          this.setPanel.next({ value: '', message: resp.message });
          return resp.message;
        })
      );
  }

  registerUser(email: string, password: string) {
    const url = `http://localhost:3000/user/signup`;
    return this.httpClient.post<{ message: string }>(url, {
      email,
      password,
    });
  }
  logOut() {
    this.isAuth.next(false);
    this.token = '';
    this.expiresIn = '';
    this.removeFromLocalStorage();
    // this.setPanel.next({ value: '', message: resp.message });
    return this.httpClient
      .get<{ message: string }>('http://localhost:3000/user/logout')
      .pipe(
        map((resp) => {
          this.setPanel.next({ value: '', message: resp.message });
        })
      );
  }
  autoAuth() {
    const tokenData = this.getFromLocalStorage();
    if (tokenData.expiresIn > 0) {
      this.isAuth.next(true);
      this.token = tokenData.token;
      setTimeout(() => {
        this.logOut();
      }, tokenData.expiresIn);
    } else {
      this.logOut();
    }
  }
  private addToLocalStorage(token: string, expiresIn: string) {
    const tokenJSON = JSON.stringify(token);
    const time = new Date().getTime() + Number(expiresIn) * 1000;
    const expiresInData = new Date(time);

    const expiresInDataJSON = JSON.stringify(expiresInData.toISOString());

    localStorage.setItem('token', tokenJSON);
    localStorage.setItem('expiresIn', expiresInDataJSON);
  }
  private removeFromLocalStorage() {
    // this.isAuth.next(false);
    // this.token = '';
    // this.expiresIn = '';
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
  }
  private getFromLocalStorage() {
    const tokenData = {
      token: '',
      expiresIn: 0,
    };
    const tokenJSON = localStorage.getItem('token');
    const expiresInJSON = localStorage.getItem('expiresIn');

    if (tokenJSON) {
      const token = JSON.parse(tokenJSON);

      tokenData.token = token;
    }
    if (expiresInJSON) {
      const expiresIn = JSON.parse(expiresInJSON);
      const now = new Date().getTime();
      const expirationDate = new Date(expiresIn);
      const isInFuture = expirationDate.getTime() - now;

      if (isInFuture > 0) {
        tokenData.expiresIn = isInFuture;
      }
    }

    return tokenData;
  }
}
