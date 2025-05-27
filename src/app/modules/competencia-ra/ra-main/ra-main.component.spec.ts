import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaMainComponent } from './ra-main.component';

describe('RaMainComponent', () => {
  let component: RaMainComponent;
  let fixture: ComponentFixture<RaMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaMainComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
