import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

// Interfaces
import { IMenuItem } from 'src/app/interfaces/menu/menu.interface';

// Components
import { ListItemComponent } from './list-item/list-item.component';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { MenuService } from 'src/app/services/menu/menu.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: true,
  imports: [ListItemComponent, CommonModule]
})
export class SidebarComponent implements OnInit {

  constructor(
    private _sanitize: DomSanitizer,
    public _menu: MenuService,
  ) { }

  stateMenu: Observable<boolean> = new BehaviorSubject(false);

  // `<svg class="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke-width="1.5"
  //   stroke="currentColor" aria-hidden="true">
  //   <path stroke-linecap="round" stroke-linejoin="round"
  //       d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  //   </svg>`

  public menu_items: IMenuItem[] = [
    {
      link: "/home",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`
        <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M23.121,9.069,15.536,1.483a5.008,5.008,0,0,0-7.072,0L.879,9.069A2.978,2.978,0,0,0,0,11.19v9.817a3,3,0,0,0,3,3H21a3,3,0,0,0,3-3V11.19A2.978,2.978,0,0,0,23.121,9.069ZM15,22.007H9V18.073a3,3,0,0,1,6,0Zm7-1a1,1,0,0,1-1,1H17V18.073a5,5,0,0,0-10,0v3.934H3a1,1,0,0,1-1-1V11.19a1.008,1.008,0,0,1,.293-.707L9.878,2.9a3.008,3.008,0,0,1,4.244,0l7.585,7.586A1.008,1.008,0,0,1,22,11.19Z"/>
        </svg>
      `),
      title: "Home",
      type: ['Aluno', 'Professor']
    },
    {
      link: "/new-class",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="22" height="22" fill="currentColor">
      <g>
        <circle cx="256" cy="128" r="128"/>
        <path d="M256,298.667c-105.99,0.118-191.882,86.01-192,192C64,502.449,73.551,512,85.333,512h341.333   c11.782,0,21.333-9.551,21.333-21.333C447.882,384.677,361.99,298.784,256,298.667z"/>
      </g>
      </svg>`),
      title: "Nova Aula",
      type: ['Professor']
    },
    {
      link: "/classes",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`
        <svg id="Layer_1" viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg" data-name="Layer 1" fill="currentColor">
          <path d="m7.5 13a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5zm7.5 17v-.5a7.5 7.5 0 0 0 -15 0v.5a1 1 0 0 0 2 0v-.5a5.5 5.5 0 0 1 11 0v.5a1 1 0 0 0 2 0zm9-5a7 7 0 0 0 -11.667-5.217 1 1 0 1 0 1.334 1.49 5 5 0 0 1 8.333 3.727 1 1 0 0 0 2 0zm-6.5-9a4.5 4.5 0 1 1 4.5-4.5 4.505 4.505 0 0 1 -4.5 4.5zm0-7a2.5 2.5 0 1 0 2.5 2.5 2.5 2.5 0 0 0 -2.5-2.5z"/>
        </svg>
      `),
      title: "Aulas",
      type: ['Aluno', 'Professor']
    },
    // {
    //   link: "/licenciado",
    //   linkType: "internal",
    //   icon: this._sanitize.bypassSecurityTrustHtml(`<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
    //     <path d="M12,16a4,4,0,1,1,4-4A4,4,0,0,1,12,16Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,12,10Zm6,13A6,6,0,0,0,6,23a1,1,0,0,0,2,0,4,4,0,0,1,8,0,1,1,0,0,0,2,0ZM18,8a4,4,0,1,1,4-4A4,4,0,0,1,18,8Zm0-6a2,2,0,1,0,2,2A2,2,0,0,0,18,2Zm6,13a6.006,6.006,0,0,0-6-6,1,1,0,0,0,0,2,4,4,0,0,1,4,4,1,1,0,0,0,2,0ZM6,8a4,4,0,1,1,4-4A4,4,0,0,1,6,8ZM6,2A2,2,0,1,0,8,4,2,2,0,0,0,6,2ZM2,15a4,4,0,0,1,4-4A1,1,0,0,0,6,9a6.006,6.006,0,0,0-6,6,1,1,0,0,0,2,0Z"/>
    //     </svg>
    //   `),
    //   title: "Licenciado"
    // },
    {
      link: "/contrato",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.656.93,6.464,13.122A4.966,4.966,0,0,0,5,16.657V18a1,1,0,0,0,1,1H7.343a4.966,4.966,0,0,0,3.535-1.464L23.07,5.344a3.125,3.125,0,0,0,0-4.414A3.194,3.194,0,0,0,18.656.93Zm3,3L9.464,16.122A3.02,3.02,0,0,1,7.343,17H7v-.343a3.02,3.02,0,0,1,.878-2.121L20.07,2.344a1.148,1.148,0,0,1,1.586,0A1.123,1.123,0,0,1,21.656,3.93Z"/><path d="M23,8.979a1,1,0,0,0-1,1V15H18a3,3,0,0,0-3,3v4H5a3,3,0,0,1-3-3V5A3,3,0,0,1,5,2h9.042a1,1,0,0,0,0-2H5A5.006,5.006,0,0,0,0,5V19a5.006,5.006,0,0,0,5,5H16.343a4.968,4.968,0,0,0,3.536-1.464l2.656-2.658A4.968,4.968,0,0,0,24,16.343V9.979A1,1,0,0,0,23,8.979ZM18.465,21.122a2.975,2.975,0,0,1-1.465.8V18a1,1,0,0,1,1-1h3.925a3.016,3.016,0,0,1-.8,1.464Z"/>
      </svg>
      `),
      title: "Contrato",
      type: ['Aluno', 'Professor']
    },
    {
      link: "/treinamentos",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`
        <svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24" class="h-6 w-6 shrink-0" fill="currentColor" stroke="currentColor"><path d="M23.808,20.197L15.741,1.557c-.52-1.276-1.979-1.895-3.259-1.371l-.926,.378c-.358,.146-.671,.368-.921,.649-.438-.726-1.234-1.212-2.142-1.212H2.5C1.122,0,0,1.121,0,2.5V21.5c0,1.379,1.122,2.5,2.5,2.5h5.993c1.378,0,2.5-1.121,2.5-2.5V5.689l7.265,16.79c.522,1.286,2.014,1.885,3.259,1.367l.925-.378c1.261-.486,1.906-2.026,1.366-3.271ZM12.505,6.666l3.704-1.51,5.37,12.411-3.704,1.511L12.505,6.666ZM1,6h3.993v12H1V6Zm4.993,0h4v12H5.993V6Zm4-3.5v2.5H5.993V1h2.5c.827,0,1.5,.673,1.5,1.5ZM2.5,1h2.493V5H1V2.5c0-.827,.673-1.5,1.5-1.5ZM1,21.5v-2.5h3.993v4H2.5c-.827,0-1.5-.673-1.5-1.5Zm7.493,1.5h-2.5v-4h4v2.5c0,.827-.673,1.5-1.5,1.5ZM11.934,1.489l.926-.378c.751-.31,1.642,.051,1.959,.832l.993,2.294-3.704,1.51-.997-2.304c-.312-.766,.057-1.643,.823-1.955Zm10.947,20.245c-.155,.369-.445,.656-.816,.808h0l-.925,.378c-.765,.312-1.643-.056-1.959-.829l-.907-2.096,3.704-1.511,.909,2.101c.152,.371,.15,.779-.005,1.149Z"/></svg>
      `),
      title: "Conteúdos",
      type: ['Aluno', 'Professor']
    },
    {
      link: "/conta",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.656.93,6.464,13.122A4.966,4.966,0,0,0,5,16.657V18a1,1,0,0,0,1,1H7.343a4.966,4.966,0,0,0,3.535-1.464L23.07,5.344a3.125,3.125,0,0,0,0-4.414A3.194,3.194,0,0,0,18.656.93Zm3,3L9.464,16.122A3.02,3.02,0,0,1,7.343,17H7v-.343a3.02,3.02,0,0,1,.878-2.121L20.07,2.344a1.148,1.148,0,0,1,1.586,0A1.123,1.123,0,0,1,21.656,3.93Z"/><path d="M23,8.979a1,1,0,0,0-1,1V15H18a3,3,0,0,0-3,3v4H5a3,3,0,0,1-3-3V5A3,3,0,0,1,5,2h9.042a1,1,0,0,0,0-2H5A5.006,5.006,0,0,0,0,5V19a5.006,5.006,0,0,0,5,5H16.343a4.968,4.968,0,0,0,3.536-1.464l2.656-2.658A4.968,4.968,0,0,0,24,16.343V9.979A1,1,0,0,0,23,8.979ZM18.465,21.122a2.975,2.975,0,0,1-1.465.8V18a1,1,0,0,1,1-1h3.925a3.016,3.016,0,0,1-.8,1.464Z"/>
      </svg>
      `),
      title: "Perfil",
      type: ['Aluno', 'Professor']
    },
    {
      link: "/horarios",
      linkType: "internal",
      icon: this._sanitize.bypassSecurityTrustHtml(`
      <svg xmlns="http://www.w3.org/2000/svg" id="Outline" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M18.656.93,6.464,13.122A4.966,4.966,0,0,0,5,16.657V18a1,1,0,0,0,1,1H7.343a4.966,4.966,0,0,0,3.535-1.464L23.07,5.344a3.125,3.125,0,0,0,0-4.414A3.194,3.194,0,0,0,18.656.93Zm3,3L9.464,16.122A3.02,3.02,0,0,1,7.343,17H7v-.343a3.02,3.02,0,0,1,.878-2.121L20.07,2.344a1.148,1.148,0,0,1,1.586,0A1.123,1.123,0,0,1,21.656,3.93Z"/><path d="M23,8.979a1,1,0,0,0-1,1V15H18a3,3,0,0,0-3,3v4H5a3,3,0,0,1-3-3V5A3,3,0,0,1,5,2h9.042a1,1,0,0,0,0-2H5A5.006,5.006,0,0,0,0,5V19a5.006,5.006,0,0,0,5,5H16.343a4.968,4.968,0,0,0,3.536-1.464l2.656-2.658A4.968,4.968,0,0,0,24,16.343V9.979A1,1,0,0,0,23,8.979ZM18.465,21.122a2.975,2.975,0,0,1-1.465.8V18a1,1,0,0,1,1-1h3.925a3.016,3.016,0,0,1-.8,1.464Z"/>
      </svg>
      `),
      title: "Grade Horária",
      type: ['Professor']
    },
  ];

  ngOnInit(): void {
    this.stateMenu = this._menu.menu$;
  
    this.stateMenu.subscribe(state => {
      // console.log(state)
      this.toggleMenu(state);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    })
  }

  toggleMenu(state: boolean) {
    const nav = document.querySelector(".primary-navigation")!;
    const btn = document.querySelector(".navButton")!;

    // const visibility = nav.getAttribute("data-visible");

    if (state === true) {
      nav.setAttribute("data-visible", "true");
      btn.setAttribute("aria-expanded", "true");
    } else if (state === false) {
      nav.setAttribute("data-visible", "false");
      btn.setAttribute("aria-expanded", "false");
    }
  }
}
