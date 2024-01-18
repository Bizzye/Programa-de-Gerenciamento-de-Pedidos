import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { environment } from 'src/environments/environment';
import { UsersComponent } from './pages/users/users.component';
import { CardapioComponent } from './pages/cardapio/cardapio.component';
import { PedidoComponent } from './pages/pedido/pedido.component';
import { FormsModule } from '@angular/forms';
import { ProdutoComponent } from './pages/produto/produto.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
    declarations: [
        AppComponent,
        UsersComponent,
        CardapioComponent,
        PedidoComponent,
        ProdutoComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebaseConfig),
        AngularFirestoreModule,
        FormsModule,
        BrowserAnimationsModule,
        MatPaginatorModule,
        MatDialogModule,
        MatSelectModule
    ],
    providers: [],
    exports: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
