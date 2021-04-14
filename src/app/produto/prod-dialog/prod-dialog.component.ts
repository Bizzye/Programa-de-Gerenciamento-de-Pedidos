import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-prod-dialog',
  templateUrl: './prod-dialog.component.html',
  styleUrls: ['./prod-dialog.component.scss']
})
export class ProdDialogComponent implements OnInit {

  constructor(@Inject( MAT_DIALOG_DATA ) public data: any) { }

  ngOnInit(): void {
  }

}
