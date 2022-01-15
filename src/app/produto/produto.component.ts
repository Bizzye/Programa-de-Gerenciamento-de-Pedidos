import { Component, Inject, OnInit } from '@angular/core';

import { ProductsService } from '../services/products.service';
import { UserService} from '../services/user.service';
import { CarrinhoService } from '../services/carrinho.service';
import * as moment from 'moment';
import { RenderService } from '../services/render.service';
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { NullTemplateVisitor } from '@angular/compiler';

@Component({
  selector: 'app-produto',
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss'],
  providers: []
})
export class ProdutoComponent implements OnInit {

  products: { name, type, preco };
  users: { nome1, nome2, nome3, endereco, ref, phone };
  public produtos: any[] = [];
  public entrega: number = null;
  public user:{ nome1, nome2, nome3, endereco, ref, phone };
  public vTotal: number;
  public product: any[] = [];
  public adc: any[] = [];
  public pedidoF: {user: {}, payment, vEntrega, sub, vTotal, pedido: {}, desconto, datahora:{data,hora} };
  public qtd: number;
  public desconto: number = null;
  public sub: number;
  public formaP: any;
  public cliente: string = '';
  public searchUsers: {};
  public showAll:boolean = true;
  public productsA: any[] = [];
  public productsB: { name, type, preco, qtd };
  public productsP: { name, type, preco, qtd };
  public payment: any;
  public step1 = true;
  public step2;
  public step3;
  public openP;
  public openA;
  public openD;
  public PainelAD: boolean = false;
  public message: string;
  public addDialog;
  public showCart;
  public coment = ''; 
  public qntd:number = 0;
  constructor( private dialog: MatDialog, private renderService: RenderService,private productsService: ProductsService, private userService: UserService, private carrinhoS: CarrinhoService) { }

  ngOnInit(): void {
    this.productsService.getProductsB().then((products: any) => {
      products.qtd = 0;
      this.productsB = products;
      console.log(this.productsB);
    });
    this.productsService.getProductsP().then((products: any) => {
      this.productsP = products;
    });
    this.productsService.getProductsA().then((products: any) => {
      this.productsA = products;
      console.log(this.productsA);
    });
      this.userService.getUsers().then((Users: any) => {
        this.users = Users;
      });
    }

    stepper1(){
      this.step1=true;
      this.step2=false;
      this.step3=false;
    };

    stepper2(){
      this.step1=false;
      this.step2=true;
      this.step3=false;
    };

    stepper3(){
      this.step1=false;
      this.step2=false;
      this.step3=true;
      this.vTotal = this.sub + (this.entrega ?? 0);
    };

    reroll(){
      this.stepper1();
      this.user={     
        nome1: null,
        nome2: null,
        nome3: null,
        endereco: null,
        ref: null,
        phone: null
      }
      this.pedidoF= {
        user: {},
        payment: null,
        vEntrega: null,
        sub: null,
        vTotal: null,
        pedido: {},
        desconto: null,
        datahora: {
            data: null,
            hora: null
        }
      }
    };

    more(i){
      this.productsA[i].qtd ++; 
      // for(i=0;i<this.adc.length;i++){
      //   if(this.adc[i]==product){
      //     this.adc.push(product);
      //   }
      //   else{
      //     this.adc[i].qtd++;
      //   }
      //   console.log(this.adc);
      // };
    };

    less(i){
      this.productsA[i].qtd --;
      // for(i=0;i<this.adc.length;i++){
      //   if(this.adc[i].qtd==0){
      //   this.adc.splice(i, 1);
      //   console.log(this.adc);
      //   }
      //   else if(this.adc[i]==product){
      //     this.adc[i].qtd--;
      //   };
      //   console.log(this.adc);
      // };
    };


    openProd(){
    this.openP = !this.openP;
    };

    openAD(){
      this.openA = !this.openA;
    };
      
    openDrink(){
      this.openD = !this.openD;
    };

    choose(user) {
      this.user = user;
      console.log(this.user);
    };

    addItem(product){
      this.produtos.push(product);
      // this.calcSTotal();
      console.log(this.produtos);
    };
    
    calcSTotal(){
      this.sub ?? 0 ;
      for(let i = 0; i < this.produtos.length; i++){
        this.sub = this.sub + this.produtos[i].preco;
        this.sub = Number(this.sub.toFixed(2))
        console.log(this.sub);
      };
    };

    addPrato(product){
      this.product.push(product);
      this.PainelAD = true;
      console.log(this.product);
    };

    addAD(){
      console.log(this.coment)
      for(let i = 0; i < this.productsA.length; i++){
        if(this.productsA[i].qtd>0){
          let test = this.productsA[i];
          this.adc.push(test);
          console.log(this.adc);
        };
      };
      const p = {
        name: this.product[0].name,
        preco: this.product[0].preco,
        adc: this.adc
      };
      this.addItem(p);
      console.log(this.produtos);
      this.close();
      this.PainelAD = false;
      console.log(this);
      // this.productsA.close();
      
    };

    addCarrinho() {
      console.log(this.desconto);
      if(!this.desconto){
        this.desconto = 0;
      }
      if(!this.entrega) {
        this.message = ("esqueceu da entrega");
        console.log("passou por aqui");
        return this.openDialog();
      }
      if(!this.payment){
        this.message = ("esqueceu da forma de pagamento");
        console.log("passou por aqui");
        return this.openDialog();
      }

      this.vTotal = this.vTotal - this.desconto;
      this.pedidoF = {
        user: this.user,
        vEntrega: this.entrega, 
        sub: this.sub,
        vTotal: this.vTotal , 
        pedido: this.produtos, 
        desconto: this.desconto,
        payment: this.payment,
        datahora: {
          data: moment().format('DD/MM/YYYY'),
          hora: moment().unix()
        }
      }
      console.log(this.pedidoF);
      this.carrinhoS.insertorder(this.pedidoF);

    };

    close(){
      this.product = [];
      this.adc = [];
      for(let i = 0; i < this.productsA.length; i++){
        this.productsA[i].qtd = 0;
      };
      this.PainelAD = false;
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
    openDialog() {

      const dialogConfig = new MatDialogConfig();

      dialogConfig.disableClose = true;
      dialogConfig.autoFocus = true;

      // this.dialog.open(ProdDialogComponent, {data: this.message});
    }
    
    excluiProduto(index) {
          this.produtos.splice(index, 1);
          this.carrinhoS.produtos.next(this.produtos);
    };

    print(){
      let Date = moment().format('DD/MM/YYYY')
      this.vTotal = this.sub + this.entrega;
      let data = [{type: 'text', value: 'Numero do pedido:',style: `text-align:center;`,css: {"font-size": "18px", "margin":"10px"}},
      //{type: 'text', value: '',css: {"font-size": "22px"}},
      {type: 'text', value: 'Data: ' + Date, css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Nome:',css: {"font-size": "18px", "margin":"10px"}},
      //{type: 'text', value: this.user.nome1 ,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Telefone: ', css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Endereco:',css: {"font-size": "18px", "margin":"10px", "margin-bottom":"50px"}},
      //{type: 'text', value: this.user.endereco,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Ponto de referencia:',css: {"font-size": "18px", "margin":"10px", "margin-bottom":"50px"}},
      //{type: 'text', value: this.user.ref,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Pedido:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Taxa de Entrega: ' + this.entrega ,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Forma de Pagamento:',css: {"font-size": "18px", "margin":"10px"}},
      //{type: 'text', value: this.payment,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Sub total: ' + this.sub ,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Total: ' + this.vTotal ,css: {"font-size": "18px", "margin":"20px"}},
      ];
      console.log(data);
      for(let i = 0; i < this.produtos.length; i++){
        let j = 7 + i;
        if(this.produtos[i].type =="adicional"){
        data.splice(j , 0, {type: 'text', value: '-- AD ' + this.produtos[i].name, css:{"font-size": "18px", "margin":""}});
      } else if(this.produtos[i].type =="prato"){
        data.splice(j , 0, {type: 'text', value: 'Batata de ' + this.produtos[i].name, css:{"font-size": "18px", "margin":""}});
      } else if(this.produtos[i].type =="bebida"){
        data.splice(j , 0, {type: 'text', value: 'Bebida de ' + this.produtos[i].name, css:{"font-size": "18px", "margin":""}});
      }
      };
      this.renderService.send('print',JSON.stringify(data));
      console.log(this.vTotal);
      console.log(data);

    };
    
    printData(){
      this.vTotal = this.sub + this.entrega;
      let payment;
      if(this.payment == 'money'){
        payment = 'dinheiro';
      }
      if(this.payment == 'other'){
        payment = 'Outro';
      }
      if(this.payment == 'card'){
        payment = 'cartão';
      }
      let data = [{type: 'text', value: 'Numero do pedido:',style: `text-align:center;`,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: '',css: {"font-size": "22px"}},
      {type: 'text', value: 'Data: '+ this.pedidoF.datahora.data, css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Nome:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.user.nome1 ,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Telefone: '+ this.user.phone, css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Endereco:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.user.endereco,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Ponto de referencia:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.user.ref,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Pedido:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Taxa de Entrega:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.entrega,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Forma de Pagamento:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: payment ,css: {"font-size": "22px", "margin":"5px"}},
      {type: 'text', value: 'Sub total:' + this.sub ,css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: 'Total:',css: {"font-size": "18px", "margin":"10px"}},
      {type: 'text', value: this.vTotal,css: {"font-size": "22px", "margin":"5px"}},
      ];
      console.log(this.vTotal);
      console.log(data);
      for(let i = 0; i < this.produtos.length; i++){
        let j = 11 + i;
        if(this.produtos[i].type =="adicional"){
        data.splice(j , 0, {type: 'text', value: '-- AD ' + this.produtos[i].name,css:{"font-size": "18px"}});
      } else if(this.produtos[i].type =="prato"){
        data.splice(j , 0, {type: 'text', value: 'Batata de ' + this.produtos[i].name,css:{"font-size": "18px"}});
      } else if(this.produtos[i].type =="bebida"){
        data.splice(j , 0, {type: 'text', value: 'Bebida de ' + this.produtos[i].name,css:{"font-size": "18px"}});
      }
      };
      this.renderService.send('print',JSON.stringify(data));
      let d = JSON.stringify(data);
      console.log(d);
    };

  }
