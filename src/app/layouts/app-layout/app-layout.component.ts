import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatDividerModule
  ],
  template: `
    <div class="app-container" [class.dark-theme]="isDarkMode$ | async">
      <mat-toolbar class="toolbar">
        <button mat-icon-button (click)="toggleSidenav()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>My App</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button (click)="toggleTheme()">
          <mat-icon>{{ (isDarkMode$ | async) ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
        <button mat-icon-button (click)="logout()" matTooltip="Logout">
          <mat-icon>logout</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'"
                     [opened]="!isMobile && isOpen" class="sidenav">
          <div class="user-info">
            <div class="user-name">User Name</div>
            <div class="user-email">{{userEmail}}</div>
          </div>
          
          <mat-nav-list class="nav-list">
            <a mat-list-item *ngFor="let item of menuItems"
               [routerLink]="item.route"
               routerLinkActive="active"
               (click)="onNavItemClick()">
              <mat-icon matListItemIcon>{{item.icon}}</mat-icon>
              <span matListItemTitle>{{item.label}}</span>
            </a>
            
            <mat-divider></mat-divider>
            <a mat-list-item (click)="logout()" class="logout-item">
              <mat-icon matListItemIcon>exit_to_app</mat-icon>
              <span matListItemTitle>Logout</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <div class="content" [class.mobile]="isMobile">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }

    .toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
      height: 64px;
      
      &.mobile {
        height: 56px;
      }
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;

      &.mobile {
        margin-top: 56px;
      }
    }

    .sidenav {
      width: 260px;
      border-right: none;
      box-shadow: 2px 0 12px rgba(0,0,0,0.1);

      &.mobile {
        width: 85%;
        max-width: 300px;
      }
    }

    .user-info {
      padding: 24px 16px;
      background: linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%);
      color: white;
    }

    .user-name {
      font-size: 16px;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-email {
      font-size: 14px;
      opacity: 0.9;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .content {
      padding: 20px;
      min-height: calc(100vh - 64px);
      box-sizing: border-box;

      &.mobile {
        min-height: calc(100vh - 56px);
        padding: 16px;
      }
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    mat-nav-list {
      padding-top: 0;
    }

    .mat-list-item {
      margin: 4px 8px;
      border-radius: 4px;
      &:hover {
        background-color: rgba(0,0,0,0.04);
      }
    }

    .active {
      background-color: var(--primary-lighter) !important;
      color: var(--primary-color);
      .mat-icon {
        color: var(--primary-color);
      }
    }

    .logout-item {
      margin-top: 8px;
      color: var(--warn-color);
      .mat-icon {
        color: var(--warn-color);
      }
    }

    @media (max-width: 599px) {
      .content-shifted {
        margin-left: 0;
      }
    }

    :host {
      display: block;
      height: 100%;
    }
  `],
})
export class AppLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isOpen = true;
  isMobile = false;
  isDarkMode$: Observable<boolean>;
  userEmail = 'user@example.com';

  menuItems = [
    {
      icon: 'dashboard',
      label: 'Dashboard',
      route: '/app'
    },
    {
      icon: 'person',
      label: 'Profile',
      route: '/app/profile'
    },
    {
      icon: 'settings',
      label: 'Settings',
      route: '/app/settings'
    },
    {
      icon: 'manage_accounts',
      label: 'Roles',
      route: '/app/roles'
    }
  ];

  constructor(
    private themeService: ThemeService,
    private loginService: LoginService
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy() {
    window.removeEventListener('resize', () => this.checkScreenSize());
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.isOpen = false;
    }
  }

  toggleSidenav() {
    if (this.isMobile) {
      this.sidenav.toggle();
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  closeSidenav() {
    if (this.isMobile) {
      this.sidenav.close();
    }
    this.isOpen = false;
  }

  onNavItemClick() {
    if (this.isMobile) {
      this.closeSidenav();
    }
  }

  logout() {
    this.closeSidenav();
    this.loginService.logout();
  }
}
