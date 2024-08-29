import {
  afterNextRender,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss',
})
export class UserFormComponent {
  @ViewChild('connectForm') form!: NgForm;
  @Input({ required: true }) mode!: string;
  name = '';
  password = '';
  constructor() {
    afterNextRender(() => {
      this.form?.valueChanges?.pipe(debounceTime(1000)).subscribe({
        next: (changes) => {
          // console.log('changes:', changes);
          const { password, name } = changes;
          if (password) {
            localStorage.setItem('password', JSON.stringify(password));
            console.log('password:', localStorage.getItem('password'));
          }
          if (name) {
            localStorage.setItem('username', JSON.stringify(name));
            console.log('username:', localStorage.getItem('username'));
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
    });
  }

  onSubmit() {
    console.log('this.form: ', this.form);
    this.form.reset();
    localStorage.getItem('username') && localStorage.removeItem('username');
    localStorage.getItem('password') && localStorage.removeItem('password');
    localStorage.getItem('mode') && localStorage.removeItem('mode');
  }
}
