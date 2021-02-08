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
  users: { nome1, nome2, nome3, endereco, telefone };
  public produtos: any[] = [];
  public entrega: number = 0 ;
  public user:{ nome1, nome2, nome3, endereco, telefone };
  public vTotal: number = 0;
  public pedido: {};
  public pedidoF: {user: {}, vEntrega, vTotal, pedido: {}, desconto, datahora:{} };
  public qtd: number;
  public desconto: number;
  c: number = 0;
  data = new Date();
  public cliente: string = '';
  public searchUsers: {};
  public showAll:boolean = true;
  isLinear = true;
  public productsA: { name, type, preco };
  public productsB: { name, type, preco };
  public productsP: { name, type, preco };

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
    };
    
    addCarrinho() {
      this.pedidoF = {
        user: this.user,
        vEntrega: this.entrega, 
        vTotal: this.vTotal , 
        pedido: this.produtos, 
        desconto: this.desconto,
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
    printData(){
      let data = [ {type: 'text', value: 'Sample text siqhfkjnadfnja', style: 'text-align:center;font-weight: bold'},
      {type: 'text', value: 'Another text asdadfad', style: 'color: #fff'},
      {type: 'barCode', value: 'HB4587896 adasd', height: 12, width: 1, fontsize: 9},
      {type: 'qrCode', value: 'https://google.com', height: 55, width: 55, style: 'margin: 10 20px 20 20px'},
      {
       type: 'table',
       // style the table
       style: 'border: 1px solid #ddd',
       // list of the columns to be rendered in the table header
       tableHeader: ['Animal', 'Age'],
       // multi dimensional array depicting the rows and columns of the table body
       tableBody: [
           ['Cat', 2],
           ['Dog', 4],
           ['Horse', 12],
           ['Pig', 4],
       ],
       // list of columns to be rendered in the table footer
       tableFooter: ['Animal', 'Age'],
       // custom style for the table header
       tableHeaderStyle: 'background-color: #000; color: white;',
       // custom style for the table body
       tableBodyStyle: 'border: 0.5px solid #ddd',
       // custom style for the table footer
       tableFooterStyle: 'background-color: #000; color: white;',
     },{
       type: 'table',
       style: 'border: 1px solid #ddd',             // style the table
       // list of the columns to be rendered in the table header
       tableHeader: [{type: 'text', value: 'Animal'},],
       // multi dimensional array depicting the rows and columns of the table body
       tableBody: [
           [{type: 'text', value: 'Cat'} ],
           [{type: 'text', value: 'Dog'}],
           [{type: 'text', value: 'Horse'}],
           [{type: 'text', value: 'Pig'}],
       ],
       // list of columns to be rendered in the table footer
       tableFooter: [{type: 'text', value: 'Animal'}, 'Image'],
       // custom style for the table header
       tableHeaderStyle: 'background-color: #000; color: white;',
       // custom style for the table body
       tableBodyStyle: 'border: 0.5px solid #ddd',
       // custom style for the table footer
       tableFooterStyle: 'background-color: #000; color: white;',
     }, ];
      this.renderService.send('print',JSON.stringify(data));
      let d = JSON.stringify(data);
      console.log(d);
    };

  }
