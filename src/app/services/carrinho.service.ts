import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  private listaProdutos: any[] = [];
  public produtos = new BehaviorSubject([]);

  constructor(private fire: AngularFirestore) { }

  getOrders() {
    return new Promise((resolve, reject) => {
      this.fire.collection("orders").ref.get().then(orders => {
        let ordersData = [];
        orders.docs.map(order => ordersData.push(order.data()));
        resolve(ordersData);
      }).catch(err => {
        reject();
      });
    });
  }

  getDeliveryM() {
    return new Promise((resolve, reject) => {
      this.fire.collection("deliverym").ref.get().then(deliverym => {
        let deliverymData = [];
        deliverym.docs.map(dm => deliverymData.push(dm.data()));
        resolve(deliverymData);
      }).catch(err => {
        reject();
      });
    });
  }

  limpaCarrinho() {
    this.listaProdutos = [];
    this.produtos.next([]);
  }

  addProduto(produto) {
    console.log(produto, '<=== produto');
      this.listaProdutos.push(produto);
      this.produtos.next(this.listaProdutos);
    }
}
