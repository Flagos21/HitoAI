import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroUsuarioDialogComponent } from './registro-usuario-dialog.component';

describe('RegistroUsuarioDialogComponent', () => {
  let component: RegistroUsuarioDialogComponent;
  let fixture: ComponentFixture<RegistroUsuarioDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroUsuarioDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroUsuarioDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
