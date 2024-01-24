import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from "@angular/fire/compat";
import { AngularFirestoreModule } from "@angular/fire/compat/firestore";
import { environment } from 'src/environments/environment';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { MenuComponent } from './components/menu/menu.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { NgxMaskDirective, provideEnvironmentNgxMask, NgxMaskPipe } from 'ngx-mask';

@NgModule({
    declarations: [
        AppComponent
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
        MatSelectModule,
        SidebarComponent,
        MenuComponent,
        SweetAlert2Module.forRoot()
    ],
    providers: [
        provideEnvironmentNgxMask(),
    ],
    exports: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
