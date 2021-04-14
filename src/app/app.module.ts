import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from "@angular/fire";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { environment } from 'src/environments/environment';
import { UsersComponent } from './users/users.component';
import { CardapioComponent } from './cardapio/cardapio.component';
import { PedidoComponent } from './pedido/pedido.component';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProdutoComponent } from './produto/produto.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { VisupedidoComponent } from './pedido/visupedido/visupedido.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ProdDialogComponent } from './produto/prod-dialog/prod-dialog.component';
import { MatSelectModule } from '@angular/material/select';


@NgModule({
  declarations: [
    AppComponent,
    UsersComponent,
    CardapioComponent,
    PedidoComponent,
    ProdutoComponent,
    VisupedidoComponent,
    ProdDialogComponent
  ],
  entryComponents: [ProdDialogComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    FormsModule,
    NgbModule,
    BrowserAnimationsModule,
    MatPaginatorModule,
    MatDialogModule,
    MatSelectModule
  ],
  providers: [],
  exports:[ ],
  bootstrap: [AppComponent]
})
export class AppModule { }
