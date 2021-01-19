import { Component, OnInit } from '@angular/core';

import { CarrinhoService } from '../services/carrinho.service';
import { PaginatorService } from '../services/paginator.service';

@Component({
  selector: 'app-pedido',
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.scss']
})
export class PedidoComponent implements OnInit {

  // Array of all items
  private allItems: any = [];
  // Pagination object
  pagination: any = {};

  // Paged items
  pagedItems: any[];

  constructor(private carinhoService: CarrinhoService, private paginatorService: PaginatorService) { }

  ngOnInit(): void {
    this.carinhoService.getOrders().then((orders: any) => {
      this.allItems = orders;
      this.setPage(1); 
      console.log(this.allItems);
      console.log(this.pagedItems);
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

}
