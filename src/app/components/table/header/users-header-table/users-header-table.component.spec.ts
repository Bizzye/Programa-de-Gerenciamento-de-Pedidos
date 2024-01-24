import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersHeaderTableComponent } from './users-header-table.component';

describe('UsersHeaderTableComponent', () => {
  let component: UsersHeaderTableComponent;
  let fixture: ComponentFixture<UsersHeaderTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UsersHeaderTableComponent]
    });
    fixture = TestBed.createComponent(UsersHeaderTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
