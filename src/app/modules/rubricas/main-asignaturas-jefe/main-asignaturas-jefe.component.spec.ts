import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainAsignaturasJefeComponent } from './main-asignaturas-jefe.component';

describe('MainAsignaturasJefeComponent', () => {
  let component: MainAsignaturasJefeComponent;
  let fixture: ComponentFixture<MainAsignaturasJefeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainAsignaturasJefeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainAsignaturasJefeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
