import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdicionalDialogComponent } from './adicional-dialog.component';

describe('AdicionalDialogComponent', () => {
  let component: AdicionalDialogComponent;
  let fixture: ComponentFixture<AdicionalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdicionalDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdicionalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
