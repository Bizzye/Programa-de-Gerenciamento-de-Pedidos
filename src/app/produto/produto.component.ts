import { Component, OnInit } from '@angular/core';

import { ProductsService } from '../services/products.service';
import { UserService} from '../services/user.service';
import { CarrinhoService } from '../services/carrinho.service';
import * as moment from 'moment';

@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss']
})
export class ProdutoComponent implements OnInit {

  products: { name, type, preco };
  users: { nome1, nome2, nome3, endereco, telefone };
  public produtos: any[] = [];
  public dms: {nome};
  public entrega: number = 0 ;
  public user: string;
  public vTotal: number = 0;
  public entregachoose: string;
  public pedido: {};
  public pedidoF: {user: {}, vEntrega, vTotal, entregador, pedido: {}, desconto, datahora:{} };
  public usuario = false;
  public produtosCarrinho = false;
  public qtd: number = 0;
  public desconto: number = 0;
  c: number = 0;
  data = new Date();

  constructor(private productsService: ProductsService, private userService: UserService, private carrinhoS: CarrinhoService) { }

  ngOnInit(): void {
      this.productsService.getProducts().then((products: any) => {
        this.products = products;
      });
      this.userService.getUsers().then((Users: any) => {
        this.users = Users;
      });
      this.carrinhoS.getDeliveryM().then((deliverym: any) => {
       this.dms = deliverym;
      });
    }

    choose(user) {
      this.user = user;
      this.usuario = true;
      console.log(this.user);
    };

    entregador(name) {
      this.entregachoose = name;
      console.log(this.entregachoose);
      this.produtosCarrinho = true;
    };

    addItem(product){
      console.log(product.preco);
      this.vTotal = this.vTotal + product.preco + this.entrega + this.desconto ;
      this.produtos.push(product);
      console.log(this.produtos);
      
    };
    
    addCarrinho() {
      this.pedidoF = {
        user: this.user,
        vEntrega: this.entrega, 
        vTotal: this.vTotal , 
        entregador: this.entregachoose, 
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


    excluiProduto(index) {
          this.produtos.splice(index, 1);
          this.carrinhoS.produtos.next(this.produtos);
    };

  }
