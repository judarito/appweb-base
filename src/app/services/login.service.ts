import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject } from 'rxjs';

interface ContractData {
  id: number;
}

interface UserData {
  id: number;
  email: string;
  id_contrato: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly CONTRACT_ID_KEY = 'contractId';
  private readonly USER_ID_KEY = 'userId';
  private authStateSubject = new BehaviorSubject<boolean>(false);
  private contractIdSubject = new BehaviorSubject<number | null>(this.getStoredContractId());
  private userIdSubject = new BehaviorSubject<number | null>(this.getStoredUserId());
  
  authState$ = this.authStateSubject.asObservable();
  contractId$ = this.contractIdSubject.asObservable();
  userId$ = this.userIdSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Check initial auth state
    const session = this.supabaseService.supabaseClient.auth.getSession();
    this.authStateSubject.next(!!session);
  }

  private getStoredContractId(): number | null {
    const storedId = localStorage.getItem(this.CONTRACT_ID_KEY);
    return storedId ? parseInt(storedId, 10) : null;
  }

  private setStoredContractId(id: number | null): void {
    if (id) {
      localStorage.setItem(this.CONTRACT_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(this.CONTRACT_ID_KEY);
    }
    this.contractIdSubject.next(id);
  }

  private getStoredUserId(): number | null {
    const storedId = localStorage.getItem(this.USER_ID_KEY);
    return storedId ? parseInt(storedId, 10) : null;
  }

  private setStoredUserId(id: number | null): void {
    if (id) {
      localStorage.setItem(this.USER_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(this.USER_ID_KEY);
    }
    this.userIdSubject.next(id);
  }

  async login(email: string, password: string): Promise<{ success: boolean; message: string }> {
    try {
      const { data: authData, error: authError } = await this.supabaseService.supabaseClient.auth.signInWithPassword({
        email,
        password
      });

      if (authError) throw authError;

      // Buscar el usuario en la tabla usuarios y obtener el id_contrato
      const { data: userData, error: userError } = await this.supabaseService.supabaseClient
        .from('usuarios')
        .select('id, email, id_contrato')
        .eq('email', email)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('Usuario no encontrado en la tabla usuarios');

      // Almacenar el ID del contrato y del usuario
      console.log('User Data:', userData);
      this.setStoredContractId(userData.id_contrato);
      this.setStoredUserId(userData.id);

      this.authStateSubject.next(true);
      await this.router.navigate(['/app']);
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      this.setStoredContractId(null);
      this.setStoredUserId(null);
      this.authStateSubject.next(false);
      return { success: false, message: error.message || 'An error occurred during login' };
    }
  }

  async logout(): Promise<void> {
    await this.supabaseService.supabaseClient.auth.signOut();
    this.authStateSubject.next(false);
    this.setStoredContractId(null);
    this.setStoredUserId(null);
    await this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value;
  }

  getUser() {
    return this.supabaseService.supabaseClient.auth.getUser();
  }

  async getEmail(): Promise<string> {
    const { data: { user }, error } = await this.getUser();
    return user?.email || '';
  }

  getContractId(): number | null {
    return this.getStoredContractId();
  }

  getUserId(): number | null {
    return this.getStoredUserId();
  }
}
