import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAsignaturasProfesorComponent } from './main-asignaturas-profesor.component';

describe('MainAsignaturasProfesorComponent', () => {
  let component: MainAsignaturasProfesorComponent;
  let fixture: ComponentFixture<MainAsignaturasProfesorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainAsignaturasProfesorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAsignaturasProfesorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
