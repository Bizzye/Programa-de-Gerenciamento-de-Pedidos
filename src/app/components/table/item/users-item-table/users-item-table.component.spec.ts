import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersItemTableComponent } from './users-item-table.component';

describe('UsersItemTableComponent', () => {
  let component: UsersItemTableComponent;
  let fixture: ComponentFixture<UsersItemTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersItemTableComponent]
    });
    fixture = TestBed.createComponent(UsersItemTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
