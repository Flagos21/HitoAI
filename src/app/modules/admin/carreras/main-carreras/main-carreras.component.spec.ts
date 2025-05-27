import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainCarrerasComponent } from './main-carreras.component';

describe('MainCarrerasComponent', () => {
  let component: MainCarrerasComponent;
  let fixture: ComponentFixture<MainCarrerasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainCarrerasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainCarrerasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
