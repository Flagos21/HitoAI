import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormIndicadorComponent } from './dialog-form-indicador.component';

describe('DialogFormIndicadorComponent', () => {
  let component: DialogFormIndicadorComponent;
  let fixture: ComponentFixture<DialogFormIndicadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormIndicadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormIndicadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
