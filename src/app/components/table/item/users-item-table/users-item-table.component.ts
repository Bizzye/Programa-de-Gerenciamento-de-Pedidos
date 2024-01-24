import { Component, Input } from '@angular/core';
import { NgxMaskPipe } from 'ngx-mask';
import { ICustomer } from 'src/app/interfaces/customer/customer.interface';

@Component({
  selector: 'app-users-item-table',
  templateUrl: './users-item-table.component.html',
  styleUrls: ['./users-item-table.component.scss'],
  standalone: true,
  imports: [ NgxMaskPipe ]
})
export class UsersItemTableComponent {
  @Input({ required: true }) item: ICustomer;
  @Input({ required: true }) lastItem: boolean = false;
}
