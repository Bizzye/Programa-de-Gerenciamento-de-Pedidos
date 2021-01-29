import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TesteService {

  fs = require('fs');
  printer= require("printer");

  constructor() {
    this.fs.readFile("teste.pdf", 'utf8', function(err, file){
      if (err) throw err;
      console.log("Trying to print...");
      this.printer.printDirect({data:file,
          type: 'PDF',
          success:function(jobID){
     console.log("Trabalho enviado à impressora - ID: "+jobID);
          },
          error:function(err){
     console.log(err);
          }
      });
    });
   }
  
}
