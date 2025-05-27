import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormContenidoComponent } from './dialog-form-contenido.component';

describe('DialogFormContenidoComponent', () => {
  let component: DialogFormContenidoComponent;
  let fixture: ComponentFixture<DialogFormContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormContenidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
