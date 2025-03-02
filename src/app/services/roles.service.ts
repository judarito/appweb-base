import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from as rxFrom } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface Role {
  id: number;
  name: string;
  description: string;
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
export class RolesService {
  private rolesSubject = new BehaviorSubject<PagedResult<Role>>({
    items: [],
    total: 0,
    pageIndex: 0,
    pageSize: 5
  });

  roles$ = this.rolesSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  getRoles(pageIndex: number = 0, pageSize: number = 10): Observable<PagedResult<Role>> {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize - 1;

    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .select('*', { count: 'exact' })
        .range(startIndex, endIndex)
        .order('id', { ascending: true })
    ).pipe(
      map(({ data, error, count }) => {
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

  createRole(role: Omit<Role, 'id'>): Observable<Role> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .insert([role])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Role;
      })
    );
  }

  updateRole(id: number, role: Partial<Role>): Observable<Role> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .update(role)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Role;
      })
    );
  }

  deleteRole(id: number): Observable<void> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}
