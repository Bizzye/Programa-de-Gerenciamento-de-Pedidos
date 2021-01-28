import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';

import { sortAndDeduplicateDiagnostics } from 'typescript';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  public endereco: string = '';
  public phone: number;
  public nome: string  = '';
  public users: { nome1, nome2, nome3, endereco, phone, id };
  public splitado = [];
  public teste: string;
  public cliente: string = '';
  public searchUsers: {};
  public showAll: boolean = true;

  

  constructor(private userService: UserService) { 
    
  }

  ngOnInit(): void {
    this.userService.getUsers().then((Users: any) => {
      this.users = Users;
      console.log(this.users)
    });
  }

  addUser() {
    this.splitado = this.nome.split(" ",3);
    let nome1 = this.splitado[0];
    let nome2 = this.splitado[1];
    let nome3;
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
      endereco: this.endereco,
      phone: this.phone
    };

    this.userService.insertUser(User).then(d => {
      this.userService.getUsers().then((Users: any) => {
        this.users = Users;
      });
    });

  }

  procura(){
  if(this.cliente.length > 0){
    if(!parseInt(this.cliente)){
        this.userService.searchUserByName(this.cliente).then((Users: any ) => {
          this.searchUsers = Users;
          console.log(this.searchUsers);
          this.showAll = false;
        });
      } else if(parseInt(this.cliente)){
        this.userService.searchUserByPhone(this.cliente).then((Users: any ) => {
          this.searchUsers = Users;
          console.log(this.cliente);
          console.log(this.searchUsers);
          this.showAll = false;
        });}
    } else{
      this.showAll = true;
    }
  }

  removeUser(id) {
    this.userService.removeUser(id).then(d => {
      this.userService.getUsers().then((Users: any) => {
        this.users = Users
        console.log(this.users)
        this.teste = id;
        console.log(this.teste)
      });
    });
  }
  
}
