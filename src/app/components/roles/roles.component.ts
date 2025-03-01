import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTable, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { RolesService, Role, PagedResult } from '../../services/roles.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatPaginatorModule
  ],
  template: `
    <div class="roles-container">
      <div class="header">
        <h2>Roles Management</h2>
        <button mat-raised-button color="primary" (click)="openDialog()">
          <mat-icon>add</mat-icon>
          Add Role
        </button>
      </div>

      <mat-table [dataSource]="dataSource">
        <ng-container matColumnDef="id">
          <mat-header-cell *matHeaderCellDef>ID</mat-header-cell>
          <mat-cell *matCellDef="let role">{{role.id}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="name">
          <mat-header-cell *matHeaderCellDef>Name</mat-header-cell>
          <mat-cell *matCellDef="let role">{{role.name}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="description">
          <mat-header-cell *matHeaderCellDef>Description</mat-header-cell>
          <mat-cell *matCellDef="let role">{{role.description}}</mat-cell>
        </ng-container>

        <ng-container matColumnDef="actions">
          <mat-header-cell *matHeaderCellDef>Actions</mat-header-cell>
          <mat-cell *matCellDef="let role">
            <button mat-icon-button color="primary" (click)="openDialog(role)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteRole(role)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>

      <mat-paginator
        [length]="totalItems"
        [pageSize]="pageSize"
        [pageSizeOptions]="[5, 10, 25]"
        (page)="onPageChange($event)"
        aria-label="Select page">
      </mat-paginator>
    </div>

    <ng-template #dialogTemplate>
      <h2 mat-dialog-title>{{editingRole ? 'Edit Role' : 'Create Role'}}</h2>
      <mat-dialog-content>
        <form [formGroup]="roleForm">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter role name" required>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" placeholder="Enter role description" required>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" 
                [disabled]="!roleForm.valid"
                (click)="saveRole()">
          {{editingRole ? 'Update' : 'Create'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild(MatTable) table!: MatTable<Role>;

  displayedColumns = ['id', 'name', 'description', 'actions'];
  dataSource = new MatTableDataSource<Role>([]);
  roleForm: FormGroup;
  editingRole: Role | null = null;
  isDarkMode = false;

  // Paginación
  pageSize = 5;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog,
    private formBuilder: FormBuilder,
    private themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]]
    });

    this.themeService.isDarkMode$.subscribe(
      isDark => this.isDarkMode = isDark
    );
  }

  ngOnInit() {
    this.loadRoles();

    this.rolesService.roles$.subscribe(result => {
      this.dataSource.data = result.items;
      this.totalItems = result.total;
      this.pageIndex = result.pageIndex;
      this.pageSize = result.pageSize;
    });
  }

  loadRoles() {
    this.rolesService.loadRoles(this.pageIndex, this.pageSize)
      .subscribe({
        error: (error) => {
          console.error('Error loading roles:', error);
          this.snackBar.open('Error loading roles', 'Close', { duration: 3000 });
        }
      });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadRoles();
  }

  openDialog(role?: Role) {
    this.editingRole = role || null;
    if (role) {
      this.roleForm.patchValue(role);
    } else {
      this.roleForm.reset();
    }
    
    const dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '500px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      height: 'auto',
      panelClass: [
        window.innerWidth < 600 ? 'full-screen-dialog' : '',
        this.isDarkMode ? 'dark-theme' : ''
      ].filter(Boolean)
    });
    
    dialogRef.afterClosed().subscribe(() => {
      this.editingRole = null;
      this.roleForm.reset();
    });
  }

  saveRole() {
    if (this.roleForm.valid) {
      const roleData = this.roleForm.value;
      
      if (this.editingRole) {
        this.rolesService.updateRole(this.editingRole.id, roleData).subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Role updated successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error updating role:', error);
            this.snackBar.open('Error updating role', 'Close', { duration: 3000 });
          }
        });
      } else {
        this.rolesService.createRole(roleData).subscribe({
          next: () => {
            this.dialog.closeAll();
            this.snackBar.open('Role created successfully', 'Close', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error creating role:', error);
            this.snackBar.open('Error creating role', 'Close', { duration: 3000 });
          }
        });
      }
    }
  }

  deleteRole(role: Role) {
    if (confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      this.rolesService.deleteRole(role.id).subscribe({
        next: () => {
          this.snackBar.open('Role deleted successfully', 'Close', { duration: 3000 });
        },
        error: (error) => {
          console.error('Error deleting role:', error);
          this.snackBar.open('Error deleting role', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
