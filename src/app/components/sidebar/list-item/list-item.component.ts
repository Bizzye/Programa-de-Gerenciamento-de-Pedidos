import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

// Interfaces
import { IMenuItem } from 'src/app/interfaces/menu/menu.interface';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ListItemComponent implements OnInit {

  @Input() item: IMenuItem = {} as IMenuItem;

  constructor(
    // private _sanitize: DomSanitizer,
    public router: Router
  ) {}

  // svg = ;

  ngOnInit(): void {
  }

  openLink(link: string) {
    this.router.navigateByUrl(link);
  }
}
