import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogFormCompetenciaComponent } from './dialog-form-competencia.component';

describe('DialogFormCompetenciaComponent', () => {
  let component: DialogFormCompetenciaComponent;
  let fixture: ComponentFixture<DialogFormCompetenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogFormCompetenciaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogFormCompetenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
