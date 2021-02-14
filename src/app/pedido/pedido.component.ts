import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { CarrinhoService } from '../services/carrinho.service';
import { PaginatorService } from '../services/paginator.service';
import { ProductsService } from '../services/products.service';
import { UserService } from '../services/user.service';


@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit, OnChanges {

  // Array of all items
  private allItems: any = [];
  // Pagination object
  pagination: any = {};
  // Paged items
  pagedItems: any[];

  products:{id, name, type, preco};
  users:{id, nome1, nome2, nome3, endereco, telefone, ref};
  orders: {id, user: {}, vEntrega, vTotal, entregador, pedido: {}, desconto, datahora:{} };
  
  public showOrder = false;
  @Input() order:{id, user: {}, vEntrega, vTotal, entregador, pedido: {}, desconto, datahora:{}};
  
  constructor(private carinhoService: CarrinhoService, private paginatorService: PaginatorService,private productsService: ProductsService, private userService: UserService) { }

  ngOnInit(): void {
    this.carinhoService.getOrders().then((orders: any) => {
      this.allItems = orders;
      this.orders = orders;
      this.setPage(1); 
      console.log(this.allItems);
      console.log(this.pagedItems);
    });
    this.productsService.getProducts().then((products: any) => {
      this.products = products;
      console.log(this.products);
    });
    this.userService.getUsers().then((users: any ) => {
      this.users = users;
    });
  }
  setPage(page: number) {
    if (page < 1 || page > this.pagination.totalPages) {
      return;
    }

    // Get pagination object from service
    this.pagination = this.paginatorService.getPagination(this.allItems.length, page);

    // Get current page of items
    this.pagedItems = this.allItems.slice(this.pagination.startIndex, this.pagination.endIndex + 1);
  }

  fecha(){
    this.showOrder = false;
  }
  choose(i){
    if(this.order != this.pagedItems[i]){
      this.showOrder = false;
      console.log('eu fiz')
    }
    this.showOrder = true
    this.order = (this.pagedItems[i])
    console.log(this.order);
  }

  ngOnChanges():void {
  }
}
