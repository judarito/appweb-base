import { Injectable } from '@angular/core';
import { Observable, from as rxFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { SupabaseService } from './supabase.service';

export interface Menu {
  id: number;
  title: string;
  path: string;
  icon: string;
  parent_id: number | null;
  order: number;
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
export class MenuService {
  constructor(private supabaseService: SupabaseService) {}

  getMenus(pageIndex: number = 0, pageSize: number = 10): Observable<PagedResult<Menu>> {
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize - 1;

    return rxFrom(
      Promise.all([
        this.supabaseService.supabaseClient
          .from('menus')
          .select('*', { count: 'exact' })
          .range(startIndex, endIndex)
          .order('order', { ascending: true }),
        this.supabaseService.supabaseClient
          .from('menus')
          .select('*', { count: 'exact' })
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

  createMenu(menu: Omit<Menu, 'id'>): Observable<Menu> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('menus')
        .insert([menu])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Menu;
      })
    );
  }

  updateMenu(id: number, menu: Partial<Menu>): Observable<Menu> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('menus')
        .update(menu)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as Menu;
      })
    );
  }

  deleteMenu(id: number): Observable<void> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('menus')
        .delete()
        .eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) throw error;
      })
    );
  }

  getParentMenus(): Observable<Menu[]> {
    return rxFrom(
      this.supabaseService.supabaseClient
        .from('menus')
        .select('*')
        .is('parend_id', null)
        .order('order', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      })
    );
  }
}
