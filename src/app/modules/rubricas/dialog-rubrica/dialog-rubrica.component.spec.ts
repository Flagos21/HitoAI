import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRubricaComponent } from './dialog-rubrica.component';

describe('DialogRubricaComponent', () => {
  let component: DialogRubricaComponent;
  let fixture: ComponentFixture<DialogRubricaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRubricaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRubricaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
