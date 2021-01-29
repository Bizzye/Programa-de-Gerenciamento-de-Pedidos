import { Component, OnInit } from '@angular/core';
import { TesteService } from '../teste/teste.service';

@Component({
  selector: 'app-teste',
  templateUrl: './teste.component.html',
  styleUrls: ['./teste.component.scss']
})
export class TesteComponent implements OnInit {

  constructor ( public TService: TesteService  ) { }

  ngOnInit(): void {

  }
  fds(){
    this.TService.fs;
  }
}
