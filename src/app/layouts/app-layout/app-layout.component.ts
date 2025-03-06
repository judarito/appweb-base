import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { ThemeService } from '../../services/theme.service';
import { Observable } from 'rxjs';
import { LoginService } from '../../services/login.service';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NavMenuItem } from '../../components/nav-menu/nav-menu.component';

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
      height: 100vh;
    }

    .app-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: var(--app-bg-color, #f5f5f5);
      color: var(--app-text-color, rgba(0, 0, 0, 0.87));

      &.dark {
        --app-bg-color: #303030;
        --app-text-color: #ffffff;
      }
    }

    .sidenav-container {
      flex: 1;
      margin-top: 64px;

      @media (max-width: 599px) {
        margin-top: 56px;
      }
    }

    .sidenav {
      width: 250px;
      background-color: var(--sidenav-bg-color, #ffffff);
      border-right: 1px solid var(--border-color, rgba(0, 0, 0, 0.12));

      :host-context(.dark) & {
        --sidenav-bg-color: #424242;
        --border-color: rgba(255, 255, 255, 0.12);
      }
    }

    .main-content {
      background-color: inherit;
    }

    .content {
      padding: 24px;
      
      &.mobile {
        padding: 16px;
      }
    }
  `]
})
export class AppLayoutComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;
  
  isDarkMode$: Observable<boolean>;
  isMobile = window.innerWidth < 768;
  isOpen = true;
  userEmail = '';

  menuItems: NavMenuItem[] = [
    { route: '/app', icon: 'dashboard', label: 'Dashboard' },
    { route: '/app/roles', icon: 'admin_panel_settings', label: 'Roles' },
    { route: '/app/users', icon: 'people', label: 'Usuarios' },
    { route: '/app/menus', icon: 'menu', label: 'Menus' },
    { route: '/app/profile', icon: 'person', label: 'Profile' },
    { route: '/app/settings', icon: 'settings', label: 'Settings' }
  ];

  constructor(
    private themeService: ThemeService,
    private loginService: LoginService
  ) {
    this.isDarkMode$ = this.themeService.isDarkMode$;
    this.loadUserEmail();

    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth < 768;
    });
  }

  async loadUserEmail() {
    this.userEmail = await this.loginService.getEmail();
  }

  ngOnInit() {}

  toggleSidenav() {
    this.sidenav.toggle();
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  onNavItemClick() {
    if (this.isMobile) {
      this.sidenav.close();
    }
  }

  logout() {
    this.loginService.logout();
  }
}
