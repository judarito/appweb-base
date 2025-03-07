import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from as rxFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { LoginService } from './login.service';

export interface User {
  id?: number;
  nombre: string;
  email: string;
  id_contrato: number;
}

export interface PagedResult<T> {
  items: T[];
  total: number;
  pageIndex: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private usersSubject = new BehaviorSubject<PagedResult<User>>({
    items: [],
    total: 0,
    pageIndex: 0,
    pageSize: 10
  });

  users$ = this.usersSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private loginService: LoginService
  ) {}

  getUsers(pageIndex: number = 0, pageSize: number = 10): Observable<PagedResult<User>> {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize - 1;
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    return rxFrom(
      Promise.all([
        this.supabaseService.supabaseClient
          .from('usuarios')
          .select('*', { count: 'exact' })
          .eq('id_contrato', contractId)
          .range(startIndex, endIndex)
          .order('id', { ascending: true }),
        this.supabaseService.supabaseClient
          .from('usuarios')
          .select('*', { count: 'exact' })
          .eq('id_contrato', contractId)
      ])
    ).pipe(
      map(([{ data, error }, { count }]) => {
        if (error) throw error;
        
        return {
          items: data || [],
          total: count || 0,
          pageIndex,
          pageSize
        };
      })
    );
  }

  async createUser(user: Omit<User, 'id' | 'id_contrato'>, password: string): Promise<User> {
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    // Primero crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await this.supabaseService.supabaseClient.auth.signUp({
      email: user.email,
      password: password
    });

    if (authError) throw authError;

    // Luego crear el registro en la tabla usuarios
    const { data, error } = await this.supabaseService.supabaseClient
      .from('usuarios')
      .insert([{ ...user, id_contrato: contractId }])
      .select()
      .single();

    if (error) {
      // Si hay error al crear en la tabla, intentar limpiar el usuario de auth
      // Nota: Esto podría requerir permisos administrativos
      console.error('Error creating user in database:', error);
      throw error;
    }

    return data;
  }

  updateUser(id: number, user: Partial<Omit<User, 'id' | 'id_contrato'>>, password?: string): Observable<User> {
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    // Si hay una nueva contraseña, actualizarla en Auth
    if (password) {
      // Nota: Para actualizar la contraseña se necesita el token de admin o que el usuario esté autenticado
      // Esta funcionalidad podría requerir un endpoint de backend personalizado
      console.warn('Password update requires admin privileges or user authentication');
    }

    return rxFrom(
      this.supabaseService.supabaseClient
        .from('usuarios')
        .update(user)
        .eq('id', id)
        .eq('id_contrato', contractId)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as User;
      })
    );
  }

  async deleteUser(id: number, email: string): Promise<void> {
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    // Primero eliminar de la tabla usuarios
    const { error: dbError } = await this.supabaseService.supabaseClient
      .from('usuarios')
      .delete()
      .eq('id', id)
      .eq('id_contrato', contractId);

    if (dbError) throw dbError;

    // Luego intentar eliminar el usuario de Auth
    // Nota: Eliminar usuarios de Auth requiere permisos de admin
    // Esta operación debería realizarse desde un backend seguro
    console.warn('Deleting users from Auth requires admin privileges');
    
    // En una aplicación real, aquí se llamaría a un endpoint de backend
    // que tenga los permisos necesarios para eliminar usuarios de Auth
  }
}
