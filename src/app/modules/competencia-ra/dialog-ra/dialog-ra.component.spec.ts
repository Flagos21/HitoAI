import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogRaComponent } from './dialog-ra.component';

describe('DialogRaComponent', () => {
  let component: DialogRaComponent;
  let fixture: ComponentFixture<DialogRaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogRaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogRaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
