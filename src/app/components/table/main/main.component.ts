import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UsersItemTableComponent } from '../item/users-item-table/users-item-table.component';
import { UsersHeaderTableComponent } from '../header/users-header-table/users-header-table.component';
import { Observable } from 'rxjs';
import { IUsersTable } from 'src/app/interfaces/table/users-table.interface';

@Component({
  selector: 'app-table',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [ CommonModule, UsersItemTableComponent, UsersHeaderTableComponent]
})
export class MainComponent {

  @Input({ required: true }) type: 'User' | 'Produto'

  @Input({ required: true }) list$: Observable<any>;
}
