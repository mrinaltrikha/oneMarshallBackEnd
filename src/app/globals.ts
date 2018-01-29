import { Injectable } from '@angular/core';

@Injectable()
export class Globals {
  currentMember:any;
  isAdminMode = false;

  adminUsername = 'admin';
  adminPassword = 'admin';

  constructor() { }

  isMemberLoggedIn() {
    if (this.currentMember != null) {
      return true;
    }

    return false;
  }
}