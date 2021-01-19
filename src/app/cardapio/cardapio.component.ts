import { Component, OnInit } from '@angular/core';
import { sortAndDeduplicateDiagnostics } from 'typescript';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-cardapio',
  templateUrl: './cardapio.component.html',
  styleUrls: ['./cardapio.component.scss']
})
export class CardapioComponent implements OnInit {

  public type: string = '';
  public preco: number = 0;
  public name: string = '';
  public products:  { name, type, preco };
  public productsA: { name, type, preco };
  public productsB: { name, type, preco };
  public productsP: { name, type, preco };

  

  constructor(private productsService: ProductsService) { 
   
    }
  

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
  }

  addProduct() {
    let product = {
      name: this.name,
      type: this.type,
      preco: this.preco
    };

    this.productsService.insertProduct(product).then(d => {
      this.productsService.getProducts().then((products: any) => {
        this.products = products;
      })
    });

  }
 
  removeProduct(id) {

    this.productsService.removeProduct(id).then(d => {
      this.productsService.getProducts().then((products: any) => {
        this.products = products;
        console.log(this.products);
      });
    });
  }
}
