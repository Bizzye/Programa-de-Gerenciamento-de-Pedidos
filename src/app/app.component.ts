import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from './services/users/user.service';
//import { ipcMain, } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Hakunapp';
  public bdp : {};
  open: boolean = false;


  constructor(
    private fire: AngularFirestore,
    private user: UserService
  ) {}

  ngOnInit() {
  }

  abrirMenu(){
    const nav = document.querySelector(".primary-navigation");
    const btn = document.querySelector(".navButton");

    const visibility = nav.getAttribute("data-visible");

    if( visibility === "false" ) {
      nav.setAttribute("data-visible", "true");
      btn.setAttribute("aria-expanded", "true");
    } else if( visibility === "true" ) {
      nav.setAttribute("data-visible", "false");
      btn.setAttribute("aria-expanded", "false");
    }
  }

}
