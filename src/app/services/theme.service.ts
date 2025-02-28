import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkMode = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.darkMode.asObservable();

  constructor() {
    // Check if user has a preferred theme stored
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme) {
      this.darkMode.next(savedTheme === 'true');
      this.updateTheme(savedTheme === 'true');
    } else {
      // Check if user prefers dark mode in their OS
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.darkMode.next(prefersDark);
      this.updateTheme(prefersDark);
    }
  }

  toggleTheme(): void {
    const newValue = !this.darkMode.value;
    this.darkMode.next(newValue);
    localStorage.setItem('darkMode', newValue.toString());
    this.updateTheme(newValue);
  }

  private updateTheme(isDark: boolean): void {
    const body = document.body;
    if (isDark) {
      body.classList.add('dark-theme');
      body.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      body.classList.remove('dark-theme');
    }
  }
}
