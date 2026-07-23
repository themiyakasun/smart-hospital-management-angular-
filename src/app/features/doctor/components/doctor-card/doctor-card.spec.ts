import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorCard } from './doctor-card';

describe('DoctorCard', () => {
  let component: DoctorCard;
  let fixture: ComponentFixture<DoctorCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
