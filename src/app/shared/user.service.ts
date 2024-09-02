import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class UserService {
  httpClient = inject(HttpClient);
  token = '';
  expiresIn = '';
  private isAuth = new BehaviorSubject(false);
  get isAuthObserv() {
    return this.isAuth.asObservable();
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
          console.log('FROM MAP: ');
          console.log('this.token: ', this.token);
          console.log('this.expiresIn: ', this.expiresIn);
          this.isAuth.next(true);
          this.addToLocalStorage(this.token, this.expiresIn);
          this.autoAuth();
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
  autoAuth() {
    const tokenData = this.getFromLocalStorage();
    if (tokenData.expiresIn > 0) {
      this.isAuth.next(true);
      this.token = tokenData.token;
      setTimeout(() => {
        this.removeFromLocalStorage();
      }, tokenData.expiresIn);
    }
  }
  private addToLocalStorage(token: string, expiresIn: string) {
    const tokenJSON = JSON.stringify(token);
    const time = new Date().getTime() + Number(expiresIn) * 1000;
    const expiresInData = new Date(time);
    console.log('expiresInData: ', expiresInData);
    console.log('expiresInData.toStringISO(): ', expiresInData.toISOString());
    const expiresInDataJSON = JSON.stringify(expiresInData.toISOString());
    console.log('expiresInDataJSON: ', expiresInDataJSON);
    localStorage.setItem('token', tokenJSON);
    localStorage.setItem('expiresIn', expiresInDataJSON);
  }
  private removeFromLocalStorage() {
    this.token = '';
    this.expiresIn = '';
    localStorage.removeItem('token');
    localStorage.removeItem('expiresIn');
  }
  private getFromLocalStorage() {
    console.log(`from getFromLocalStorage(): `);
    const tokenData = {
      token: '',
      expiresIn: 0,
    };
    const tokenJSON = localStorage.getItem('token');
    const expiresInJSON = localStorage.getItem('expiresIn');

    if (tokenJSON) {
      const token = JSON.parse(tokenJSON);
      console.log('token: ', token);
      tokenData.token = token;
    }
    if (expiresInJSON) {
      const expiresIn = JSON.parse(expiresInJSON);
      const now = new Date().getTime();
      const expirationDate = new Date(expiresIn);
      // console.log('expirationDate: ', expirationDate);
      // console.log('expirationDate.getTime(): ', expirationDate.getTime());
      const isInFuture = expirationDate.getTime() - now;
      // console.log('is in Future: ', isInFuture);
      // console.log('expiresIn: ', expiresIn);
      // console.log(`now: `, now);
      if (isInFuture > 0) {
        tokenData.expiresIn = isInFuture;
      }
    }
    console.log('tokenData: ', tokenData);
    return tokenData;
  }
}
