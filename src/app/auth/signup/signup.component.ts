import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authSub: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authSub = this.authService.getAuthStatusObservable()
      .subscribe(authStatus => {
        this.isLoading = !!authStatus;
      });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  onSignUp(signUpForm: NgForm): void {
    if (signUpForm.invalid) { return; }
    this.isLoading = true;
    this.authService.registerUser(signUpForm.value.email, signUpForm.value.password);
  }
}
