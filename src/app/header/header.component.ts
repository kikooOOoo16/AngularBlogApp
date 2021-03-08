import {Component, OnDestroy, OnInit} from '@angular/core';
import {AuthService} from '../auth/auth.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  isAuthenticated = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.isAuthenticated = this.authService.getIsAuth();
    this.authSub = this.authService.getAuthStatusObservable()
      .subscribe(authenticatedStatus => {
        this.isAuthenticated = authenticatedStatus;
      });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
  }

  onLogout(): void {
    this.authService.logout();
  }
}
