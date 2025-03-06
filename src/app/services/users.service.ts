import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Observable, from, map } from 'rxjs';

export interface User {
  id?: number;
  nombre: string;
  email: string;
  id_contrato: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  constructor(
    private supabaseService: SupabaseService
  ) {}

  getUsers(page: number = 1, pageSize: number = 10): Observable<{ data: User[]; total: number }> {
    const startRange = (page - 1) * pageSize;
    const endRange = startRange + pageSize - 1;

    return from(
      Promise.all([
        this.supabaseService.supabaseClient
          .from('usuarios')
          .select('*', { count: 'exact' })
          .range(startRange, endRange)
          .order('id', { ascending: true }),
        this.supabaseService.supabaseClient
          .from('usuarios')
          .select('*', { count: 'exact' })
      ])
    ).pipe(
      map(([{ data, error }, { count }]) => {
        if (error) throw error;
        return {
          data: data || [],
          total: count || 0
        };
      })
    );
  }

  async createUser(user: Omit<User, 'id'>, password: string): Promise<User> {
    // Primero crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await this.supabaseService.supabaseClient.auth.signUp({
      email: user.email,
      password: password
    });

    if (authError) throw authError;

    // Luego crear el registro en la tabla usuarios
    const { data, error } = await this.supabaseService.supabaseClient
      .from('usuarios')
      .insert([user])
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

  updateUser(id: number, user: Partial<Omit<User, 'id'>>): Observable<User> {
    return from(
      this.supabaseService.supabaseClient
        .from('usuarios')
        .update(user)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as User;
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    return from(
      this.supabaseService.supabaseClient
        .from('usuarios')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}
