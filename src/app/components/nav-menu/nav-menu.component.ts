import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

export interface NavMenuItem {
  route: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-nav-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatDividerModule
  ],
  template: `
    <mat-nav-list class="nav-list">
      <a mat-list-item *ngFor="let item of menuItems"
         [routerLink]="item.route"
         routerLinkActive="active"
         [routerLinkActiveOptions]="item.route === '/app' ? {exact: true} : {exact: false}"
         (click)="navItemClick.emit()">
        <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
        <span matListItemTitle>{{item.label}}</span>
      </a>
      
      <mat-divider></mat-divider>
      <a mat-list-item (click)="logoutClick.emit()" class="logout-item">
        <mat-icon matListItemIcon>exit_to_app</mat-icon>
        <span matListItemTitle>Logout</span>
      </a>
    </mat-nav-list>
  `,
  styles: [`
    .nav-list {
      padding: 8px;

      :host-context(.dark) & {
        background-color: var(--sidenav-bg-color, #424242);
        color: var(--sidenav-text-color, #ffffff);

        .mat-mdc-list-item {
          color: var(--sidenav-text-color, #ffffff);
        }

        .active {
          background-color: rgba(255, 255, 255, 0.1);
        }
      }
    }

    .active {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .logout-item {
      margin-top: 8px;
    }

    .mat-mdc-list-item {
      border-radius: 4px;
      margin: 4px 0;
    }
  `]
})
export class NavMenuComponent {
  @Input() menuItems: NavMenuItem[] = [];
  @Output() navItemClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
}
