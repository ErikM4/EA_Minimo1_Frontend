import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmModal } from './confirm-modal';

describe('ConfirmModal', () => {
  let component: ConfirmModal;
  let fixture: ComponentFixture<ConfirmModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an imperative confirmation and emit when confirmed', () => {
    const confirmed = vi.fn();
    component.confirmed.subscribe(confirmed);

    component.openWith('Confirmar archivado', 'Se archivará el registro.', 'Archivar');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirmar archivado');
    expect(fixture.nativeElement.textContent).toContain('Se archivará el registro.');
    expect(fixture.nativeElement.textContent).toContain('Archivar');

    fixture.nativeElement.querySelector('.danger').click();
    fixture.detectChanges();

    expect(confirmed).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should keep the declarative open input working', () => {
    fixture.componentRef.setInput('open', true);
    fixture.componentRef.setInput('title', 'Confirmación declarativa');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Confirmación declarativa');
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).not.toBeNull();
  });
});
