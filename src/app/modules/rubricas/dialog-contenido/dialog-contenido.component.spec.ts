import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogContenidoComponent } from './dialog-contenido.component';

describe('DialogContenidoComponent', () => {
  let component: DialogContenidoComponent;
  let fixture: ComponentFixture<DialogContenidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogContenidoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogContenidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
