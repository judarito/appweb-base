import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Role {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private roles = new BehaviorSubject<Role[]>([]);
  roles$ = this.roles.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  async getRoles(): Promise<void> {
    try {
      const { data, error } = await this.supabaseService.supabaseClient
        .from('roles')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      this.roles.next(data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      this.roles.next([]);
      throw error;
    }
  }

  async createRole(role: Omit<Role, 'id'>): Promise<Role[]> {
    try {
      const { data, error } = await this.supabaseService.supabaseClient
        .from('roles')
        .insert([role])
        .select()
        .single();

      if (error) throw error;
      await this.getRoles();
      return [data];
    } catch (error) {
      console.error('Error creating role:', error);
      throw error;
    }
  }

  async updateRole(id: number, role: Partial<Role>): Promise<Role[]> {
    try {
      const { data, error } = await this.supabaseService.supabaseClient
        .from('roles')
        .update(role)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await this.getRoles();
      return [data];
    } catch (error) {
      console.error('Error updating role:', error);
      throw error;
    }
  }

  async deleteRole(id: number): Promise<Role[]> {
    try {
      const { error } = await this.supabaseService.supabaseClient
        .from('roles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await this.getRoles();
      return [];
    } catch (error) {
      console.error('Error deleting role:', error);
      throw error;
    }
  }
}
