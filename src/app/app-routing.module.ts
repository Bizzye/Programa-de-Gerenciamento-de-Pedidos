import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CardapioComponent } from './components/cardapio/cardapio.component';
import { PedidoComponent } from './components/pedido/pedido.component';
import { ProdutoComponent } from './components/produto/produto.component';
import { UsersComponent } from './components/users/users.component';

const routes: Routes = [
  { path: 'cardapio', component: CardapioComponent },
  { path: 'user', component: UsersComponent },
  { path: 'pedido', component: PedidoComponent },
  { path: 'produto', component: ProdutoComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
