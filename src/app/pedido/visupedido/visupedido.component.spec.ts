import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisupedidoComponent } from './visupedido.component';

describe('VisupedidoComponent', () => {
  let component: VisupedidoComponent;
  let fixture: ComponentFixture<VisupedidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisupedidoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisupedidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
