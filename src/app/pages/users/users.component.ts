import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/users/user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MainComponent } from 'src/app/components/table/main/main.component';

import { SwalPortalTargets, SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ICustomer } from 'src/app/interfaces/customer/customer.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  standalone: true,
  imports: [ CommonModule, FormsModule, MainComponent, SweetAlert2Module ],

})
export class UsersComponent implements OnInit {

  public endereco: string = '';
  public phone: number = null;
  public nome: string  = '';
  public users: ICustomer;
  public ref: string = '';
  public splitado = [];
  public teste: string;
  public cliente: string = '';
  public searchUsers: {};
  public showAll: boolean = true;

  users$: Observable<ICustomer[] | null> = new BehaviorSubject(null);

  constructor(
    private _users: UserService,
    public readonly swalTargets: SwalPortalTargets
  ) { }

  ngOnInit(): void {
    this.users$ = this._users.getCustomer();
  }

  addCustomer() {
    this.splitado = this.nome.split(" ",3);
    let nome1 = this.splitado[0];
    let nome2;
    let nome3;
    if(this.splitado.length == 2){
      nome2 = this.splitado[1];
    } else {
      nome2 = '';
    }
    if(this.splitado.length == 3){
      nome3 = this.splitado[2];
    } else {
      nome3 = '';
    }
    nome1 = nome1.toUpperCase();
    nome2 = nome2.toUpperCase();
    nome3 = nome3.toUpperCase();

    console.log(this.splitado);
    let User = {
      nome1, 
      nome2, 
      nome3,
      fullName: this.nome.split(' '),
      endereco: this.endereco,
      phone: this.phone,
      ref: this.ref
    };

    this._users.insertUser(User).then(d => {
      this._users.getUsers().then((Users: any) => {
        this.users = Users;
      });
    });

  }

  search(){
    if(this.cliente.length < 1 || !this.cliente) {
      return
    }

    // this.users$ = 
    this._users.searchCustomer(this.cliente).subscribe(i => {
      console.log(i)
    });
  }

  resetData() {
    this.nome = '';
    this.endereco = '';
    this.phone = null;
    this.ref = '';
  }  
}
