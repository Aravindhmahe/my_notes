import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { UserDetails } from '../models/userdetails.model';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent {
  signupForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initialiseFormControls();
  }

  initialiseFormControls(): void {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    const formControls = this.signupForm.controls;
    const request: UserDetails = {
      username: formControls['username'].value,
      email: formControls['email'].value,
      password: formControls['password'].value,
    };
    this.authService.registerUser(request).subscribe((response) => {
      console.log(response);
    });
  }
}
