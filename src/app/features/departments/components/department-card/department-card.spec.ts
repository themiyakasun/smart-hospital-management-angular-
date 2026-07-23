import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentCard } from './department-card';

describe('DepartmentCard', () => {
  let component: DepartmentCard;
  let fixture: ComponentFixture<DepartmentCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentCard],
    }).compileComponents();

    fixture = TestBed.createComponent(DepartmentCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
