import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, MatSort } from '@angular/material/sort';

export interface TableColumn {
  name: string;
  property: string;
  isAction?: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule
  ],
  template: `
    <mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
      <ng-container *ngFor="let column of columns" [matColumnDef]="column.property">
        <mat-header-cell *matHeaderCellDef mat-sort-header>{{column.name}}</mat-header-cell>
        <mat-cell *matCellDef="let element">
          <ng-container *ngIf="!column.isAction">
            {{element[column.property]}}
          </ng-container>
          <ng-container *ngIf="column.isAction">
            <button mat-icon-button color="primary" (click)="onEdit.emit(element)">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="onDelete.emit(element)">
              <mat-icon>delete</mat-icon>
            </button>
          </ng-container>
        </mat-cell>
      </ng-container>

      <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
      <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
    </mat-table>

    <mat-paginator
      [length]="totalItems"
      [pageSize]="pageSize"
      [pageSizeOptions]="[5, 10, 25, 100]"
      (page)="onPageChange.emit($event)"
      aria-label="Select page">
    </mat-paginator>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
    
    .mat-mdc-table {
      width: 100%;
      margin-bottom: 16px;
    }
  `]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() set data(value: any[]) {
    this.dataSource = new MatTableDataSource(value);
    this.dataSource.sort = this.sort;
  }
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;

  @Output() onPageChange = new EventEmitter<PageEvent>();
  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  @ViewChild(MatSort) sort!: MatSort;
  
  dataSource = new MatTableDataSource<any>([]);
  
  get displayedColumns(): string[] {
    return this.columns.map(col => col.property);
  }
}
