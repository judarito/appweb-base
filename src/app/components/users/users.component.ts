import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../../services/users.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule,
    MatPaginatorModule
  ]
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['id', 'nombre', 'email', 'actions'];
  total = 0;
  pageSize = 10;
  currentPage = 1;
  userForm: FormGroup;
  isEditing = false;
  editingUser: User | null = null;

  constructor(
    private usersService: UsersService,
    private loginService: LoginService,
    private formBuilder: FormBuilder,
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
      next: (response) => {
        this.users = response.data;
        this.total = response.total;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('Error loading users', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData = this.userForm.value;
      const contractId = this.loginService.getContractId();
      
      if (!contractId) {
        this.snackBar.open('No contract ID available', 'Close', { duration: 3000 });
        return;
      }

      const user: Omit<User, 'id'> = {
        nombre: userData.nombre,
        email: userData.email,
        id_contrato: contractId
      };

      if (this.isEditing && this.editingUser?.id) {
        // Update existing user
        this.usersService.updateUser(this.editingUser.id, user).subscribe({
          next: () => {
            this.snackBar.open('User updated successfully', 'Close', { duration: 3000 });
            this.resetForm();
            this.loadUsers();
          },
          error: (error) => {
            console.error('Error updating user:', error);
            this.snackBar.open('Error updating user', 'Close', { duration: 3000 });
          }
        });
      } else {
        // Create new user
        this.usersService.createUser(user, userData.password).then(
          () => {
            this.snackBar.open('User created successfully', 'Close', { duration: 3000 });
            this.resetForm();
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

  editUser(user: User): void {
    this.isEditing = true;
    this.editingUser = user;
    this.userForm.patchValue({
      nombre: user.nombre,
      email: user.email
    });
    // Remove password validator for editing
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete the user "${user.nombre}"?`)) {
      this.usersService.deleteUser(user.id!).subscribe({
        next: () => {
          this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
          this.loadUsers();
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.snackBar.open('Error deleting user', 'Close', { duration: 3000 });
        }
      });
    }
  }

  resetForm(): void {
    this.isEditing = false;
    this.editingUser = null;
    this.userForm.reset();
    // Restore password validator
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadUsers();
  }
}
