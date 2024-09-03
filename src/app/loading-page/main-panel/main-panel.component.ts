import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-main-panel',
  standalone: true,
  imports: [],
  templateUrl: './main-panel.component.html',
  styleUrl: './main-panel.component.scss',
})
export class MainPanelComponent {
  @Output() func = new EventEmitter<string | null>();
  changePanel(func: string | null) {
    localStorage.getItem('username') && localStorage.removeItem('username');
    localStorage.getItem('password') && localStorage.removeItem('password');
    localStorage.getItem('mode') && localStorage.removeItem('mode');
    this.func.emit(func);
  }
}
