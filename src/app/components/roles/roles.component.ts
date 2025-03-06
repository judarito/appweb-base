import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { HttpErrorResponse } from '@angular/common/http';
import { RolesService, Role, PagedResult } from '../../services/roles.service';
import { ThemeService } from '../../services/theme.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    DataTableComponent
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  
  roles: Role[] = [];
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  
  columns: TableColumn[] = [
    { name: 'ID', property: 'id' },
    { name: 'Name', property: 'name' },
    { name: 'Description', property: 'description' },
    { name: 'Actions', property: 'actions', isAction: true }
  ];

  roleForm: FormGroup;
  editingRole: Role | null = null;
  dialogRef: any;

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    public themeService: ThemeService
  ) {
    this.roleForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.rolesService.getRoles(this.currentPage, this.pageSize).subscribe({
      next: (result: PagedResult<Role>) => {
        this.roles = result.items;
        this.totalItems = result.total;
      },
      error: (error: HttpErrorResponse) => {
        this.snackBar.open('Error loading roles', 'Close', { duration: 3000 });
      }
    });
  }

  handlePageEvent(e: PageEvent) {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadRoles();
  }

  openDialog(role?: Role) {
    this.editingRole = role || null;
    if (role) {
      this.roleForm.patchValue(role);
    } else {
      this.roleForm.reset();
    }
    
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '400px'
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.editingRole = null;
      this.roleForm.reset();
    });
  }

  saveRole() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      
      if (!this.editingRole || !this.editingRole.id) {
        // Create new role
        this.rolesService.createRole(roleData).subscribe({
          next: () => {
            this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
            this.loadRoles();
            this.dialogRef.close();
          },
          error: (error) => {
            this.snackBar.open('Error creating role', 'Close', { duration: 3000 });
            console.error('Error creating role:', error);
          }
        });
      } else {
        // Update existing role
        this.rolesService.updateRole(this.editingRole.id, roleData).subscribe({
          next: () => {
            this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
            this.loadRoles();
            this.dialogRef.close();
          },
          error: (error) => {
            this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
            console.error('Error updating role:', error);
          }
        });
      }
    }
  }

  confirmDelete(role: Role) {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.deleteRole(role);
    }
  }

  deleteRole(role: Role): void {
    if (!role.id) return;
    
    if (confirm(`¿Está seguro de que desea eliminar el rol "${role.name}"?`)) {
      this.rolesService.deleteRole(role.id!).subscribe({
        next: () => {
          this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
          this.loadRoles();
        },
        error: (error) => {
          this.snackBar.open('Error deleting role', 'Close', { duration: 3000 });
          console.error('Error deleting role:', error);
        }
      });
    }
  }
}
