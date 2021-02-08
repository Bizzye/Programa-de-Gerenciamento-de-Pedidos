import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from './services/user.service';
//import { ipcMain, } from 'electron';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Hakunapp';
  public bdp : {};


  //const fs = (<any>window).require("fs");
  //const electron = (<any>window).require("electron");

  constructor(private fire: AngularFirestore,
    private user: UserService) {

  }

  ngOnInit() {
  }

}
