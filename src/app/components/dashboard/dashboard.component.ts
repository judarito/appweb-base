import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <div class="dashboard-container">
      <h2>Dashboard</h2>
      <div class="dashboard-grid">
        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Welcome</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>Welcome to your application dashboard!</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="dashboard-card">
          <mat-card-header>
            <mat-card-title>Quick Stats</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stats-grid">
              <div class="stat-item">
                <mat-icon>people</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Users</span>
                </div>
              </div>
              <div class="stat-item">
                <mat-icon>assignment</mat-icon>
                <div class="stat-info">
                  <span class="stat-value">0</span>
                  <span class="stat-label">Roles</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      padding: 20px;

      h2 {
        margin-bottom: 20px;
      }
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .dashboard-card {
      height: 100%;
      
      mat-card-content {
        padding: 16px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      background-color: rgba(var(--primary-color-rgb), 0.1);

      mat-icon {
        color: var(--primary-color);
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      .stat-info {
        display: flex;
        flex-direction: column;
      }

      .stat-value {
        font-size: 24px;
        font-weight: 500;
        line-height: 1;
      }

      .stat-label {
        font-size: 14px;
        color: var(--text-secondary-color);
      }
    }
  `]
})
export class DashboardComponent {}
