import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';

import { debounceTime } from 'rxjs';

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
    name: new FormControl('', {
      validators: [Validators.required, Validators.minLength(5)],
    }),
    password: new FormControl('', { validators: [Validators.required] }),
  });
  @Input({ required: true }) mode!: string;
  name = '';
  password = '';
  username = this.form.controls.name;
  userPassword = this.form.controls.password;

  ngOnInit() {
    this.form?.valueChanges?.pipe(debounceTime(1000)).subscribe({
      next: (changes) => {
        const { password, name } = changes;
        if (password) {
          localStorage.setItem('password', JSON.stringify(password));
        }
        if (name) {
          localStorage.setItem('username', JSON.stringify(name));
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
          const usernameJSON = localStorage.getItem('username');
          const passwordJSON = localStorage.getItem('password');
          if (usernameJSON) {
            const username = JSON.parse(usernameJSON);
            this.name = username;
          }
          if (passwordJSON) {
            const password = JSON.parse(passwordJSON);
            this.password = password;
          }
        }
      }
    }, 1);
  }
  onSubmit() {
    this.name = this.form.value.name!;
    this.password = this.form.value.password!;

    const fragment = this.mode.split(' ').reduce((acc, next) => acc + next);
    const url = `http://localhost:3000/user/${fragment}`;

    const httpVerb = 'post';
    const userSub = this.httpClient[httpVerb]<{ message: string }>(url, {
      username: this.name,
      password: this.password,
    }).subscribe({
      next: (resp) => {
        console.log(resp.message);
      },
    });

    // this.form.reset();
    localStorage.getItem('username') && localStorage.removeItem('username');
    localStorage.getItem('password') && localStorage.removeItem('password');
    localStorage.getItem('mode') && localStorage.removeItem('mode');
  }
}
