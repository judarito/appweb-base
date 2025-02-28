import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private authStateSubject = new BehaviorSubject<boolean>(false);
  authState$ = this.authStateSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Check initial auth state
    const session = this.supabaseService.supabaseClient.auth.getSession();
    this.authStateSubject.next(!!session);
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data, error } = await this.supabaseService.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      this.authStateSubject.next(true);
      await this.router.navigate(['/app']);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  }

  async logout(): Promise<void> {
    await this.supabaseService.supabaseClient.auth.signOut();
    this.authStateSubject.next(false);
    await this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }
}
