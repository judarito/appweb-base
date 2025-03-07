import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { MatPaginatorModule } from '@angular/material/paginator';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService, User, PagedResult } from '../../services/users.service';
import { LoginService } from '../../services/login.service';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    MatPaginatorModule,
    DataTableComponent
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  
  users: User[] = [];
  totalItems: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;
  
  columns: TableColumn[] = [
    { name: 'ID', property: 'id' },
    { name: 'Nombre', property: 'nombre' },
    { name: 'Email', property: 'email' },
    { name: 'Actions', property: 'actions', isAction: true }
  ];

  userForm: FormGroup;
  editingUser: User | null = null;
  dialogRef: any;

  constructor(
    private usersService: UsersService,
    private loginService: LoginService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.userForm = this.formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.usersService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (result: PagedResult<User>) => {
        this.users = result.items;
        this.totalItems = result.total;
      },
      error: (error: HttpErrorResponse) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  handlePageEvent(e: PageEvent): void {
    this.currentPage = e.pageIndex;
    this.pageSize = e.pageSize;
    this.loadUsers();
  }

  openDialog(user?: User): void {
    this.editingUser = user || null;
    
    if (user) {
      this.userForm.patchValue({
        nombre: user.nombre,
        email: user.email
      });
      // Remove password validator for editing
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.userForm.reset();
      // Restore password validator
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
    
    this.dialogRef = this.dialog.open(this.dialogTemplate, {
      width: '400px'
    });

    this.dialogRef.afterClosed().subscribe(() => {
      this.editingUser = null;
      this.userForm.reset();
      // Restore password validator
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    });
  }

  saveUser(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      
      if (this.editingUser) {
        // Update existing user
        const updateData: Partial<User> = {
          nombre: userData.nombre
        };
        
        this.usersService.updateUser(this.editingUser.id!, updateData, userData.password || undefined).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.dialogRef.close();
            this.loadUsers();
          },
          error: (error: HttpErrorResponse) => {
            console.error('Error updating user:', error);
            this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new user
        const newUser: Omit<User, 'id' | 'id_contrato'> = {
          nombre: userData.nombre,
          email: userData.email
        };
        
        this.usersService.createUser(newUser, userData.password).then(
          () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.dialogRef.close();
            this.loadUsers();
          },
          (error) => {
            console.error('Error creating user:', error);
            this.snackBar.open('Error creating user', 'Close', { duration: 3000 });
          }
        );
      }
    }
  }

  confirmDelete(user: User): void {
    if (confirm(`Are you sure you want to delete the user "${user.nombre}"?`)) {
      this.deleteUser(user);
    }
  }

  deleteUser(user: User): void {
    this.usersService.deleteUser(user.id!, user.email).then(
      () => {
        this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
        this.loadUsers();
      },
      (error) => {
        console.error('Error deleting user:', error);
        this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
      }
    );
  }
}
