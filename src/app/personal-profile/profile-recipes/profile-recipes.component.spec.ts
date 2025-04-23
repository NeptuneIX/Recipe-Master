import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRecipesComponent } from './profile-recipes.component';

describe('ProfileSavedRecipesComponent', () => {
  let component: ProfileRecipesComponent;
  let fixture: ComponentFixture<ProfileRecipesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfileRecipesComponent]
    });
    fixture = TestBed.createComponent(ProfileRecipesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
