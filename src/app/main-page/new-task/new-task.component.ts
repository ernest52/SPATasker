import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../shared/user.service';
import type Task from '../../shared/task.model';

import {
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { merge } from 'rxjs';

@Component({
  selector: 'app-new-task',
  standalone: true,
  templateUrl: './new-task.component.html',
  styleUrl: './new-task.component.scss',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewTaskComponent {
  router = inject(Router);
  userService = inject(UserService);
  destroyRef = inject(DestroyRef);
  optionsControls = [new FormControl(''), new FormControl('')];
  form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    content: new FormControl('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.minLength(10),
    ]),
    options: new FormArray(this.optionsControls),
  });
  options = this.form.controls.options;
  setOption = signal('');
  title = this.form.controls.title;
  content = this.form.controls.content;
  panelOptions = signal<{ index: number; value: string }[] | []>([]);
  buttons = false;
  setDailyGoalCorrect = false;
  fullDate = signal<{ from: string; to: string }>({ from: '', to: '' });

  errorMessage = signal({ content: '', title: '', date: '' });
  constructor() {
    merge(this.content.statusChanges, this.content.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
    merge(this.title.statusChanges, this.title.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.updateErrorMessage());
    merge(this.form.controls.options.valueChanges)
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.setOptionFn());
  }
  onSubmit() {
    // console.log('fullDate(): ', this.fullDate());
    if (this.fullDate().from && this.fullDate().to) {
      const now = new Date();
      const today = new Date(now.setDate(now.getDate() - 1));
      const fromDate = new Date(this.fullDate().from);
      const toDate = new Date(this.fullDate().to);
      if (
        today.getTime() > fromDate.getTime() ||
        today.getTime() > toDate.getTime()
      ) {
        this.errorMessage().date = 'You must choose dates from future';
      } else {
        this.errorMessage().date = '';
      }
      if (fromDate.getTime() > toDate.getTime()) {
        const bin = this.fullDate().from;
        this.fullDate().from = this.fullDate().to;
        this.fullDate().to = bin;
      }
    } else {
      if (this.setOption() === 'goal') {
        this.errorMessage().date = 'To set a goal you need to add both date';
      }
    }
    if (this.options.value[0] === 'once') {
      const value = this.options.value[1];
      if (value) {
        const now = new Date();
        const today = new Date(now.setDate(now.getDate() - 1));
        const taskDate = new Date(value);
        const isInFuture = today.getTime() < taskDate.getTime();
        if (isInFuture) {
          this.errorMessage().date = '';
        } else {
          this.errorMessage().date = 'you need to choose future date';
        }
      }
    }
    if (
      !this.errorMessage().content &&
      !this.errorMessage().date &&
      !this.errorMessage().title
    ) {
      console.log('data ready to sent to server');
      const task: Task = {
        title: this.title.value || '',
        content: this.content.value || '',
        repeated: false,
        isATarget: false,
        repeatedAt: '',
        startGoal: '',
        endGoal: '',
        date: '',
      };
      const [type, value] = this.options.value;
      if (value) {
        if (type === 'once') {
          task.date = new Date(value).toISOString();
        } else if (type === 'goal') {
          task.isATarget = true;
          task.startGoal = new Date(this.fullDate().from).toISOString();
          task.endGoal = new Date(this.fullDate().to).toISOString();
          // task.date = task.startGoal;
        } else if (type === 'daily') {
          task.repeated = true;
          task.repeatedAt = this.options.value[1]!;
        }
      } else {
        task.date = new Date().toISOString();
      }
      this.form.reset({});
      const taskSub = this.userService.addNewTask(task).subscribe({
        next: (resp) => {
          console.log(resp.message);
          this.userService.setPanelFn({ value: '', message: resp.message });
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.userService.setPanelFn({
            value: '',
            message: err.error?.message || err.message,
          });
        },
      });
      this.destroyRef.onDestroy(() => taskSub.unsubscribe());
    }
  }
  setGoal(but: number = 3) {
    // console.log(`FROM setGoal()`);
    // console.log(' this.options.value: ', this.options.value[1]);
    const date = this.options.value[1];
    // console.log('date: ', date);
    // console.log('but: ', but);
    if (date) {
      if (but === 0) {
        this.fullDate().from = date;
      } else if (but === 1) {
        this.fullDate().to = date;
      }
    }

    // console.log('this.fullDate: ', this.fullDate());
  }
  setOptionFn() {
    // console.log('FROM setOptionFn() ');

    const value = this.options.value[0];
    // console.log('this.options.value: ', this.options.value);
    if (value) {
      this.setOption.set(value);
      let options;
      this.setOption() === 'daily'
        ? (options =
            'day,monday,tuesday,wednesday,thursday,friday,saturday,sunday')
        : this.setOption() === 'goal'
        ? (options = 'From,To') && (this.buttons = true)
        : '';

      options
        ? this.panelOptions.set(
            options.split(',').map((el, index) => ({ index, value: el }))
          )
        : this.panelOptions.set([]);
      if (
        this.setOption() === 'daily' &&
        this.panelOptions().some((el) => el.value == this.options.value[1])
      ) {
        this.setDailyGoalCorrect = true;
      } else {
        this.setDailyGoalCorrect = false;
      }
    }
  }
  updateErrorMessage() {
    if (this.content.hasError('required')) {
      this.errorMessage().content = 'You must enter a value';
    } else if (this.content.hasError('minlength')) {
      this.errorMessage().content = `${this.content.errors?.['minlength'].actualLength}/${this.content.errors?.['minlength'].requiredLength} required`;
    }
    if (this.title.hasError('required')) {
      this.errorMessage().title = 'you must enter a value';
    }
    if (this.form.controls.content.valid) {
      this.errorMessage().content = '';
    }
    if (this.form.controls.title.valid) {
      this.errorMessage().title = '';
    }
  }
}
