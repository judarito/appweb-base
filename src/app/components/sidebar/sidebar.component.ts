import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavMenuComponent, NavMenuItem } from '../nav-menu/nav-menu.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    NavMenuComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() userEmail = '';
  @Input() menuItems: NavMenuItem[] = [];
  @Output() navItemClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
}
