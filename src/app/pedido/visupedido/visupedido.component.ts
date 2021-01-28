import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-visupedido',
  templateUrl: './visupedido.component.html',
  styleUrls: ['./visupedido.component.scss']
})
export class VisupedidoComponent implements OnInit {
  
   @Input() choose: {id, user: {nome1,nome2,nome3,id}, vEntrega, vTotal, entregador, pedido: {}, desconto, datahora:{}};

  constructor() { }

  ngOnInit(): void {
    console.log(this.choose);
  }

}
