import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogGruposEvaluacionComponent } from './dialog-grupos-evaluacion.component';

describe('DialogGruposEvaluacionComponent', () => {
  let component: DialogGruposEvaluacionComponent;
  let fixture: ComponentFixture<DialogGruposEvaluacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogGruposEvaluacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogGruposEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
