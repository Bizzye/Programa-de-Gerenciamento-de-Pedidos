import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class CarrinhoService {

  constructor(
    private fire: AngularFirestore
  ) { }

  getOrders() {
    return new Promise((resolve, reject) => {
      this.fire.collection("orders").ref.limit(50).orderBy('id', 'desc').get().then(orders => {
        let ordersData = [];
        orders.docs.map(order => ordersData.push(order.data()));
        console.log(orders.docs.length);
        resolve(ordersData);
      }).catch(err => {
        reject();
      });
    });
  }

  async insertorder(body) {
    try {
      let id = new Date().getTime().toString();
      body.id = id
      return await this.fire.collection('orders').doc(id).set(body);
    } catch (err) {
      console.log(err)
      return err
    }
  }
}
