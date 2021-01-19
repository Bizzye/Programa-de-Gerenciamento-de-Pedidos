import { Component, OnInit } from '@angular/core';

import { ProductsService } from '../services/products.service';
import { UserService} from '../services/user.service';
import { CarrinhoService } from '../services/carrinho.service';

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
  public entrega: number ;
  public user: string;
  public vTotal: number;
  public entregachoose: string;
  public pedido: {};//adicionar numero do pedido
  public pedidoF: {user, vEntrega, vTotal, entregador, pedido: {} };
  public usuario = false;
  public produtosCarrinho = false;
  public qtd: number = 0;
  typeA:string ="adicional";
  typeB:string ="bebida";

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

    choose(id) {
      this.user = id;
      this.usuario = true;
      console.log(this.user);
    };

    entregador(id) {
      this.entregachoose = id;
      console.log(this.entregachoose);
      this.produtosCarrinho = true;
    };

    addItem(product){
      this.produtos.push(product);
      console.log(this.produtos);
    };
    
    addCarrinho(product) {
       this.carrinhoS.addProduto(product);
    };


    excluiProduto(index) {
          this.produtos.splice(index, 1);
          this.carrinhoS.produtos.next(this.produtos);
    };
    
    /* realizaCompra() {
      console.log(this.produtos[0]);
       // this.http.post('http://localhost:3000/realizaCompra',post do bd firebase
       {
        produtos: this.produtos,
        usuario: this.users,
        datahora: {
          data: moment().format('DD/MM/YYYY'),
          hora: moment().unix()
        }
      }).subscribe((dado: any) => {
        if (dado.success == true) {
          this.produtos = [];
          this.carrinhoS.limpaCarrinho();
        } else {
          console.log('Ocorreu um Erro.'); //fazer validação dps
        }
      });
    } */

  }
