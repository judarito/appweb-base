import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  template: `
    <div class="home-container">
      <h1>Welcome to the Dashboard</h1>
      <p>You are now logged in!</p>
    </div>
  `,
  styles: [`
    .home-container {
      padding: 20px;
      h1 {
        color: #333;
        margin-bottom: 1rem;
      }
    }
  `],
  standalone: true,
  imports: [CommonModule]
})
export class HomeComponent {}
