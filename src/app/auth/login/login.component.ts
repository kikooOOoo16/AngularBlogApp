import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthService} from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  isLoading = false;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
  }

  onLogin(loginForm: NgForm): void {
    if (loginForm.invalid) { return; }
    this.isLoading = true;
    this.authService.loginUser(loginForm.value.email, loginForm.value.password);
  }
}
