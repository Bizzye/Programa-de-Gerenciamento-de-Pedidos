import { Component, OnInit } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';
import { UserService } from './services/user.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Hakunapp';
  public bdp : {};

  constructor(private fire: AngularFirestore,
    private user: UserService) {

  }

  ngOnInit() {
  }

}
