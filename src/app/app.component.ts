import { Component, OnInit } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Globals } from './globals';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  modalViewForAdminLogin_Ref;
  adminUsername = '';
  adminPassword = '';
  isAdminLoginFailed = false;

  modalViewForMemberLogin_Ref;
  memberEmail = '';
  memberPassword = '';
  isMemberLoginFailed = false;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private globals: Globals, private modalService: NgbModal) {
    console.log('isAdminMode: ' + this.globals.isAdminMode)
    if (this.globals.isAdminMode) {
      this.router.navigateByUrl('/homeAdmin');
    } else if (this.globals.isMemberLoggedIn()) {
      this.router.navigateByUrl('/userDashboard');
    } else {
      this.router.navigateByUrl('/home');
    }
  }

  ngOnInit() {
    
  }

  showAdminLoginForm(modal) {
    this.adminUsername = '';
    this.adminPassword = '';
    this.isAdminLoginFailed = false;

    this.modalViewForAdminLogin_Ref = this.modalService.open(modal);
  }

  tryAdminLogin() {
    if (this.adminUsername === this.globals.adminUsername
      && this.adminPassword === this.globals.adminPassword) {
      this.modalViewForAdminLogin_Ref.close();
      this.globals.isAdminMode = true;
      this.router.navigateByUrl('/students');
      return;
    }

    this.isAdminLoginFailed = true;
  }

  showMemberLoginForm(modal) {
    this.memberEmail = '';
    this.memberPassword = '';
    this.isMemberLoginFailed = false;

    this.modalViewForMemberLogin_Ref = this.modalService.open(modal);
  }

  tryMemberLogin() {
    this.http.get('api/memberByEmail/' + this.memberEmail).subscribe(data => {
      var member: any = data;
      if (this.memberEmail === member.email
        && this.memberPassword === member.password) {
        this.modalViewForMemberLogin_Ref.close();
        this.globals.currentMember = member;
        this.router.navigateByUrl('/userDashboard');
        return;
      }
    });

    this.isMemberLoginFailed = true;
  }

  logout() {
    this.globals.isAdminMode = false;
    this.globals.currentMember = null;
    this.router.navigateByUrl('/home');
  }

}
