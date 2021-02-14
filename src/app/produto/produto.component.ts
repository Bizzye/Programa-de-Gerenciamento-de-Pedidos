import { Component, OnInit } from '@angular/core';

import { ProductsService } from '../services/products.service';
import { UserService} from '../services/user.service';
import { CarrinhoService } from '../services/carrinho.service';
import * as moment from 'moment';
import { RenderService } from '../services/render.service';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';


@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss'],
  providers: [{
    provide: STEPPER_GLOBAL_OPTIONS, useValue: {displayDefaultIndicatorType: false}
  }]
})
export class ProdutoComponent implements OnInit {

  products: { name, type, preco };
  users: { nome1, nome2, nome3, endereco, ref, phone };
  public produtos: any[] = [];
  public entrega: number ;
  public user:{ nome1, nome2, nome3, endereco, ref, phone };
  public vTotal: number;
  public pedido: {};
  public pedidoF: {user: {}, payment, vEntrega, vTotal, pedido: {}, desconto, datahora:{data,hora} };
  public qtd: number;
  public desconto: number;
  public formaP: any;
  c: number = 0;
  data = new Date();
  public cliente: string = '';
  public searchUsers: {};
  public showAll:boolean = true;
  isLinear = true;
  public productsA: { name, type, preco };
  public productsB: { name, type, preco };
  public productsP: { name, type, preco };
  public payment: any;

  constructor( private renderService: RenderService,private productsService: ProductsService, private userService: UserService, private carrinhoS: CarrinhoService) { }

  ngOnInit(): void {
    this.productsService.getProductsB().then((products: any) => {
      this.productsB = products;
    });
    this.productsService.getProductsP().then((products: any) => {
      this.productsP = products;
    });
    this.productsService.getProductsA().then((products: any) => {
      this.productsA = products;
    });
      this.userService.getUsers().then((Users: any) => {
        this.users = Users;
      });
    }

    choose(user) {
      this.user = user;
      console.log(this.user);
    };
    addItem(product){
      this.produtos.push(product);
      console.log(this.produtos);
      this.vTotal = 0;
      for(let i = 0; i < this.produtos.length; i++){
        this.vTotal = this.vTotal + this.produtos[i].preco;
        console.log(this.vTotal);
      };
    };
    
    addCarrinho() {
      this.desconto = 0;
      this.pedidoF = {
        user: this.user,
        vEntrega: this.entrega, 
        vTotal: this.vTotal , 
        pedido: this.produtos, 
        desconto: this.desconto,
        payment: this.payment,
        datahora: {
          data: moment().format('DD/MM/YYYY'),
          hora: moment().unix()
        }
      }
      console.log(this.pedidoF);
      this.carrinhoS.insertorder(this.pedidoF);
    };

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
      
    excluiProduto(index) {
          this.produtos.splice(index, 1);
          this.carrinhoS.produtos.next(this.produtos);
    };
    print(){
      let produtos = [];
      for(let i = 0; i < this.produtos.length; i++){
          if(this.produtos[i].type =="adicional"){
          produtos.push("Adicional de " + this.produtos[i].name);
        } else if(this.produtos[i].type =="prato"){
          produtos.push("Batata de " + this.produtos[i].name);
        } else if(this.produtos[i].type =="bebida"){
          produtos.push("Bebida de " + this.produtos[i].name);
        }
      }
      this.vTotal = this.vTotal + this.entrega;
      let data = [{type: 'text', value: 'Numero do pedido:',style: `text-align:center;`,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: '',css: {"font-size": "22px"}},
      {type: 'text', value: 'Data: ', css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Nome:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.user.nome1 ,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Telefone: ', css: {"font-size": "18px", "margin":"30px"}},
      {type: 'text', value: 'Endereco:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.user.endereco,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Ponto de referencia:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.user.ref,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Pedido:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: produtos,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Taxa de Entrega:',css: {"font-size": "18px", "margin":"30px"}},
      {type: 'text', value: this.entrega,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Forma de Pagamento:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.payment,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Total:',css: {"font-size": "18px", "margin":"30px"}},
      {type: 'text', value: this.vTotal,css: {"font-size": "22px", "margin":"5px"}},
      ];
     
      this.renderService.send('print',JSON.stringify(data));
      let d = JSON.stringify(data);
      console.log(d);

    };
    printW(){
      let data = [{type: 'text', value: 'Numero do pedido:',style: `text-align:center;`,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: '',css: {"font-size": "22px"}},
      {type: 'text', value: 'Data: ', css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Nome:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.user.nome1 ,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Telefone: ', css: {"font-size": "18px", "margin":"30px"}},
      {type: 'text', value: 'Endereco:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.user.endereco,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Ponto de referencia:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.user.ref,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Pedido:',css: {"font-size": "18px", "margin":"50px"}},
      //{type: 'text', value: produtos,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Taxa de Entrega:',css: {"font-size": "18px", "margin":"20px"}},
      //{type: 'text', value: this.entrega,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Forma de Pagamento:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.payment,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Total:',css: {"font-size": "18px", "margin":"30px"}},
      //{type: 'text', value: this.vTotal,css: {"font-size": "22px", "margin":"5px"}},
      ];
     
      this.renderService.send('print',JSON.stringify(data));
      let d = JSON.stringify(data);
    }
    printData(){
      let produtos = [];
      for(let i = 0; i < this.produtos.length; i++){
        if(this.produtos[i].type =="adicional"){
        produtos.push("Adicional de" + this.produtos[i].name);
      } else if(this.produtos[i].type =="prato"){
        produtos.push("Batata de" + this.produtos[i].name);
      } else if(this.produtos[i].type =="bebida"){
        produtos.push("Bebida de" + this.produtos[i].name);
      }
        //return ("{type: 'text', value: this.produtos[i].name},")
      };
      this.vTotal = this.vTotal + this.entrega;
      let data = [{type: 'text', value: 'Numero do pedido:',style: `text-align:center;`,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: '',css: {"font-size": "22px"}},
      {type: 'text', value: 'Data: '+ this.pedidoF.datahora.data, css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Nome:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.user.nome1 ,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Telefone: '+ this.user.phone, css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Endereco:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.user.endereco,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Ponto de referencia:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.user.ref,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Pedido:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: produtos,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Taxa de Entrega:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.entrega,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Forma de Pagamento:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.payment,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Total:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.vTotal,css: {"font-size": "22px", "margin":"5px"}},
      ];
     
      this.renderService.send('print',JSON.stringify(data));
      let d = JSON.stringify(data);
      console.log(d);
    };

  }
