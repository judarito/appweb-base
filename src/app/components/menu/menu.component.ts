import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { HttpErrorResponse } from '@angular/common/http';
import { MenuService, Menu, PagedResult } from '../../services/menu.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    DataTableComponent
  ],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  
  menus: Menu[] = [];
  parentMenus: Menu[] = [];
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  
  columns: TableColumn[] = [
    { name: 'Title', property: 'title' },
    { name: 'Path', property: 'path' },
    { name: 'Icon', property: 'icon' },
    { name: 'Order', property: 'order' },
    { name: 'Actions', property: 'actions', isAction: true }
  ];

  menuForm: FormGroup;
  editingMenu: Menu | null = null;
  dialogRef: any;

  constructor(
    private menuService: MenuService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.menuForm = this.formBuilder.group({
      title: ['', Validators.required],
      path: ['', Validators.required],
      icon: ['', Validators.required],
      parent_id: [null],
      order: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadMenus();
    this.loadParentMenus();
  }

  loadMenus() {
    this.menuService.getMenus(this.currentPage, this.pageSize).subscribe({
      next: (result: PagedResult<Menu>) => {
        this.menus = result.items;
        this.totalItems = result.total;
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error loading menus', 'Close', { duration: 3000 });
      }
    });
  }

  loadParentMenus() {
    this.menuService.getParentMenus().subscribe({
      next: (menus: Menu[]) => {
        this.parentMenus = menus;
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error loading parent menus', 'Close', { duration: 3000 });
      }
    });
  }

  handlePageEvent(e: PageEvent) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadMenus();
  }

  openDialog(menu?: Menu) {
    this.editingMenu = menu || null;
    if (menu) {
      this.menuForm.patchValue(menu);
    } else {
      this.menuForm.reset({order: 0});
    }
    
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '400px'
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.editingMenu = null;
      this.menuForm.reset({order: 0});
    });
  }

  saveMenu() {
    if (this.menuForm.valid) {
      const menuData = this.menuForm.value;
      
      const request = this.editingMenu
        ? this.menuService.updateMenu(this.editingMenu.id, menuData)
        : this.menuService.createMenu(menuData);

      request.subscribe({
        next: () => {
          this.snackBar.open(
            `Menu ${this.editingMenu ? 'updated' : 'created'} successfully`,
            'Close',
            { duration: 3000 }
          );
          this.dialogRef.close();
          this.loadMenus();
          if (!menuData.parent_id) {
            this.loadParentMenus();
          }
        },
        error: (error: HttpErrorResponse) => {
          this.snackBar.open(
            `Error ${this.editingMenu ? 'updating' : 'creating'} menu`,
            'Close',
            { duration: 3000 }
          );
        }
      });
    }
  }

  confirmDelete(menu: Menu) {
    if (confirm(`Are you sure you want to delete the menu "${menu.title}"?`)) {
      this.deleteMenu(menu.id);
    }
  }

  private deleteMenu(id: number) {
    this.menuService.deleteMenu(id).subscribe({
      next: () => {
        this.snackBar.open('Menu deleted successfully', 'Close', { duration: 3000 });
        this.loadMenus();
        this.loadParentMenus();
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error deleting menu', 'Close', { duration: 3000 });
      }
    });
  }
}
