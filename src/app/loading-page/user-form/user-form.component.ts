import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';

import { debounceTime, Subscription } from 'rxjs';
import { UserService } from '../../shared/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent implements OnInit {
  // @ViewChild('connectForm') form!: NgForm;
  httpClient = inject(HttpClient);
  destroyRef = inject(DestroyRef);
  form = new FormGroup({
    email: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(9),
        Validators.maxLength(30),
        Validators.email,
      ],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(30),
      ],
    }),
  });
  userService = inject(UserService);
  userSub!: Subscription;
  @Input({ required: true }) mode!: string;
  email = '';
  password = '';
  info = '';
  userEmail = this.form.controls.email;
  userPassword = this.form.controls.password;

  ngOnInit() {
    this.form?.valueChanges?.pipe(debounceTime(1000)).subscribe({
      next: (changes) => {
        const { password, email } = changes;
        if (password) {
          localStorage.setItem('password', JSON.stringify(password));
        }
        if (email) {
          localStorage.setItem('email', JSON.stringify(email));
        }

        localStorage.setItem('mode', JSON.stringify(this.mode));
      },
      error: (err) => console.log('errors: ', err),
    });
    setTimeout(() => {
      const modeJSON = localStorage.getItem('mode');
      if (modeJSON) {
        const mode = JSON.parse(modeJSON);
        if (this.mode === mode) {
          const emailJSON = localStorage.getItem('email');
          const passwordJSON = localStorage.getItem('password');
          if (emailJSON) {
            const email = JSON.parse(emailJSON);
            this.email = email;
          }
          if (passwordJSON) {
            const password = JSON.parse(passwordJSON);
            this.password = password;
          }
        }
      }
    }, 1);
  }
  onCancel() {
    this.userService.setPanelFn({ value: '', message: '' });
  }
  onSubmit() {
    this.email = this.form.value.email!;
    this.password = this.form.value.password!;
    if (this.form.valid) {
      const fragment = this.mode
        .trim()
        .split(' ')
        .reduce((acc, next) => acc + next);

      if (fragment === 'signin') {
        this.userSub = this.userService
          .logInUser(this.email, this.password)
          .subscribe({
            next: (message) => {
              this.info = message;
            },
            error: (err) => {
              this.info = err?.error?.message || err.message;
            },
          });
      } else {
        this.userSub = this.userService
          .registerUser(this.email, this.password)
          .subscribe({
            next: (resp) => {
              this.mode = 'sign in';
              this.info = resp.message;
            },
            error: (err) => {
              this.info = err?.error?.message || err.message;
            },
          });
      }
      this.destroyRef.onDestroy(() => this.userSub.unsubscribe());
    }

    this.password = '';
    this.email = '';
    this.form.reset();
    localStorage.getItem('email') && localStorage.removeItem('email');
    localStorage.getItem('password') && localStorage.removeItem('password');
    localStorage.getItem('mode') && localStorage.removeItem('mode');
  }
}
