import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private fire: AngularFirestore) { }

  getProducts() {
    return new Promise((resolve, reject) => {
      this.fire.collection("products").ref.get().then(products => {
        let productsData = [];
        products.docs.map(product => productsData.push(product.data()));
        console.log(products.docs.length);
        resolve(productsData);
      }).catch(err => {
        reject();
      });
    });
  }
  
  getProductsP() {
    return new Promise((resolve, reject) => {
      this.fire.collection("products").ref.where('type','==','prato').get().then(products => {
        let productsData = [];
        products.docs.map(product => productsData.push(product.data()));
        console.log(productsData);
        resolve(productsData);
      }).catch(err => {
        reject();
      });
    });
  }
  getProductsB() {
    return new Promise((resolve, reject) => {
      this.fire.collection("products").ref.where('type','==','bebida').get().then(products => {
        let productsData = [];
        products.docs.map(product => productsData.push(product.data()));
        console.log(products.docs.length);
        resolve(productsData);
      }).catch(err => {
        reject();
      });
    });
  }
  getProductsA() {
    return new Promise((resolve, reject) => {
      this.fire.collection("products").ref.where('type','==','adicional').get().then(products => {
        let productsData = [];
        products.docs.map(product => productsData.push(product.data()));
        console.log(products.docs.length);
        resolve(productsData);
      }).catch(err => {
        reject();
      });
    });
  }


  async insertProduct(body) {
    try {
      let id = new Date().getTime().toString();
      body.id = id
      return await this.fire.collection('products').doc(id).set(body);
    } catch (err) {
      console.log(err)
      return err
    }
  }

  async removeProduct(id) {
    try {
      return await this.fire.collection('products').doc(id).delete();
    } catch (err) {
      console.log(err)
      return err
    }
  }

}
