import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from as rxFrom } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';
import { LoginService } from './login.service';

export interface Role {
  id?: number;
  name: string;
  description: string;
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
export class RolesService {
  private rolesSubject = new BehaviorSubject<PagedResult<Role>>({
    items: [],
    total: 0,
    pageIndex: 0,
    pageSize: 5
  });

  roles$ = this.rolesSubject.asObservable();

  constructor(private supabaseService: SupabaseService, private loginService: LoginService) {}

  getRoles(pageIndex: number = 0, pageSize: number = 10): Observable<PagedResult<Role>> {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize - 1;
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    return rxFrom(
      Promise.all([
        this.supabaseService.supabaseClient
          .from('roles')
          .select('*', { count: 'exact' })
          .eq('id_contrato', contractId)
          .range(startIndex, endIndex)
          .order('id', { ascending: true }),
        this.supabaseService.supabaseClient
          .from('roles')
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

  createRole(role: Omit<Role, 'id' | 'id_contrato'>): Observable<Role> {
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .insert([{ ...role, id_contrato: contractId }])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Role;
      })
    );
  }

  updateRole(id: number, role: Partial<Omit<Role, 'id' | 'id_contrato'>>): Observable<Role> {
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .update(role)
        .eq('id', id)
        .eq('id_contrato', contractId)
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
    const contractId = this.loginService.getContractId();

    if (!contractId) {
      throw new Error('No contract ID available');
    }

    return rxFrom(
      this.supabaseService.supabaseClient
        .from('roles')
        .delete()
        .eq('id', id)
        .eq('id_contrato', contractId)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }
}
