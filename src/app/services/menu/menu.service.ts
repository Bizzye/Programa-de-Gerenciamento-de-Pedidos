import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { map } from 'rxjs';
import { BehaviorSubject, Observable, filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private subject = new BehaviorSubject<boolean>(false);
  menu$: Observable<boolean> = this.subject.asObservable();

  constructor(
    private router: Router
  ) {
    this.router.events
    .pipe(
      filter(event => event instanceof NavigationStart)
    ).subscribe(() => {
      this.closeMenu();
    })
  }

  openMenu() {
    this.subject.next(true);
  }

  closeMenu() {
    this.subject.next(false);
  }

  changeState() {
    this.menu$.pipe(
      map(state => {
        if(!state) {
          return this.openMenu();
        }

        return this.closeMenu();
      })
    )
  }
}
