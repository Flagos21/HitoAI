import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogCarreraComponent } from './dialog-carrera.component';

describe('DialogCarreraComponent', () => {
  let component: DialogCarreraComponent;
  let fixture: ComponentFixture<DialogCarreraComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogCarreraComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogCarreraComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
