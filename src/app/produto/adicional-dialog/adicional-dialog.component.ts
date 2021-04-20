import { Component, OnInit, Inject} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-adicional-dialog',
  templateUrl: './adicional-dialog.component.html',
  styleUrls: ['./adicional-dialog.component.scss']
})
export class AdicionalDialogComponent implements OnInit {

  constructor(@Inject( MAT_DIALOG_DATA ) public data: any) { }

  ngOnInit(): void {
  }

}
