import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="app-container" [class.dark]="isDarkMode$ | async">
      <app-header
        [isDarkMode$]="isDarkMode$"
        (toggleSidenavEvent)="toggleSidenav()"
        (toggleThemeEvent)="toggleTheme()"
        (logoutEvent)="logout()">
      </app-header>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav [mode]="isMobile ? 'over' : 'side'"
                     [opened]="!isMobile && isOpen" 
                     class="sidenav">
          <app-sidebar
            [userEmail]="userEmail"
            [menuItems]="menuItems"
            (navItemClick)="onNavItemClick()"
            (logoutClick)="logout()">
          </app-sidebar>
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
    :host {
      display: block;
      height: 100%;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background-color: var(--mat-app-background-color);
      color: var(--mat-app-text-color);

      &.dark {
        --mat-app-background-color: #303030;
        --mat-app-text-color: #ffffff;
        --mat-toolbar-container-background-color: #424242;
        --mat-toolbar-container-text-color: #ffffff;
        --mat-sidenav-container-background-color: #303030;
        --mat-sidenav-container-text-color: #ffffff;
        --primary-color: #7b1fa2;
        --primary-lighter: rgba(123, 31, 162, 0.2);
        --warn-color: #f44336;
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
      border-right: none;
      box-shadow: 2px 0 12px rgba(0,0,0,0.1);

      &.mobile {
        width: 85%;
        max-width: 300px;
      }
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

    @media (max-width: 599px) {
      .content-shifted {
        margin-left: 0;
      }
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
    { route: '/app', icon: 'dashboard', label: 'Dashboard' },
    { route: '/app/roles', icon: 'admin_panel_settings', label: 'Roles' },
    { route: '/app/profile', icon: 'person', label: 'Profile' },
    { route: '/app/settings', icon: 'settings', label: 'Settings' }
  ];

  constructor(
    private themeService: ThemeService,
    private loginService: LoginService
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
  }

  ngOnInit() {
    // Check if mobile based on screen width
    this.isMobile = window.innerWidth < 768;
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  toggleSidenav() {
    this.sidenav.toggle();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onNavItemClick() {
    if (this.isMobile) {
      this.toggleSidenav();
    }
  }

  async logout() {
    await this.loginService.logout();
  }
}
