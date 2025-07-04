import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const loggedIn = !!localStorage.getItem('rol');
    return loggedIn ? true : this.router.parseUrl('/login');
  }
}
