import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-settings',
  template: `
    <div class="settings-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Settings</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <p>Your settings will be displayed here.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .settings-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
  `],
  standalone: true,
  imports: [CommonModule, MatCardModule]
})
export class SettingsComponent {}
