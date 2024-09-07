import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  optionsControls = [new FormControl(false), new FormControl(false)];
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
  panelOptions = signal<{ index: number; value: string }[]>([]);
  buttons = false;
  fullDate = signal<{ from: string; to: string }>({ from: '', to: '' });

  errorMessage = signal({ content: '', title: '' });
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
    console.log('this.form: ', this.form);
  }
  setGoal(but: number = 3) {
    console.log(`FROM setGoal()`);
    console.log(' this.options.value: ', this.options.value[1]);
    const date = this.options.value[1] as unknown as string;
    console.log('date: ', date);
    console.log('but: ', but);
    if (but === 0) {
      this.fullDate().from = date;
    } else if (but === 1) {
      this.fullDate().to = date;
    }

    console.log('this.fullDate: ', this.fullDate());
  }
  setOptionFn() {
    console.log('FROM setOptionFn() ');
    const value = this.options.value[0] as unknown as string;
    console.log('this.options.value: ', this.options.value);
    this.setOption.set(value);
    let options;
    this.setOption() === 'daily'
      ? (options =
          'every day,monday,tuesday,wednesday,thursday,friday,saturday,sunday')
      : (options = 'From,To') && (this.buttons = true);
    this.panelOptions.set(
      options.split(',').map((el, index) => ({ index, value: el }))
    );
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
