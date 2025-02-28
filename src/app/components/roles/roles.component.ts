import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RolesService, Role } from '../../services/roles.service';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
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

      <mat-table [dataSource]="dataSource" class="mat-elevation-z8">
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
            <button mat-icon-button color="warn" (click)="deleteRole(role.id)">
              <mat-icon>delete</mat-icon>
            </button>
          </mat-cell>
        </ng-container>

        <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
        <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
      </mat-table>
    </div>

    <ng-template #dialogTemplate>
      <h2 mat-dialog-title>{{editingRole ? 'Edit Role' : 'Create Role'}}</h2>
      <mat-dialog-content>
        <form [formGroup]="roleForm">
          <mat-form-field appearance="outline">
            <mat-label>Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter role name">
            <mat-error *ngIf="roleForm.get('name')?.hasError('required')">
              Name is required
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" placeholder="Enter role description"></textarea>
            <mat-error *ngIf="roleForm.get('description')?.hasError('required')">
              Description is required
            </mat-error>
          </mat-form-field>
        </form>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button color="primary" (click)="saveRole()" [disabled]="roleForm.invalid">
          {{editingRole ? 'Update' : 'Create'}}
        </button>
      </mat-dialog-actions>
    </ng-template>
  `,
  styles: [`
    .roles-container {
      padding: 20px;
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        
        h2 {
          margin: 0;
        }
      }

      .mat-table {
        width: 100%;
      }

      .mat-column-actions {
        width: 100px;
        text-align: center;
      }
    }

    mat-dialog-content {
      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-width: 400px;
        padding-top: 16px;
      }
    }
  `]
})
export class RolesComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  
  dataSource = new MatTableDataSource<Role>([]);
  displayedColumns = ['id', 'name', 'description', 'actions'];
  roleForm: FormGroup;
  editingRole: Role | null = null;

  constructor(
    private rolesService: RolesService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.roleForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.rolesService.roles$.subscribe(roles => {
      this.dataSource.data = roles;
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  async loadRoles() {
    try {
      await this.rolesService.getRoles();
    } catch (error) {
      this.showError('Error loading roles');
    }
  }

  openDialog(role?: Role) {
    this.editingRole = role || null;
    if (role) {
      this.roleForm.patchValue(role);
    } else {
      this.roleForm.reset();
    }
    
    const dialogRef = this.dialog.open(this.dialogTemplate);
    
    dialogRef.afterClosed().subscribe(() => {
      this.editingRole = null;
      this.roleForm.reset();
    });
  }

  async saveRole() {
    if (this.roleForm.valid) {
      try {
        if (this.editingRole) {
          await this.rolesService.updateRole(this.editingRole.id, this.roleForm.value);
          this.showSuccess('Role updated successfully');
        } else {
          await this.rolesService.createRole(this.roleForm.value);
          this.showSuccess('Role created successfully');
        }
        this.dialog.closeAll();
      } catch (error) {
        this.showError(this.editingRole ? 'Error updating role' : 'Error creating role');
      }
    }
  }

  async deleteRole(id: number) {
    if (confirm('Are you sure you want to delete this role?')) {
      try {
        await this.rolesService.deleteRole(id);
        this.showSuccess('Role deleted successfully');
      } catch (error) {
        this.showError('Error deleting role');
      }
    }
  }

  private showSuccess(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  private showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
      panelClass: ['error-snackbar']
    });
  }
}
