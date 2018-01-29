import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.admin.component.html',
  styleUrls: ['./home.admin.component.css']
})
export class HomeAdminComponent implements OnInit {

  member = {};

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {

  }

  ngOnInit() {
  }

  registerMember() {
    this.http.post('api/member', this.member).subscribe(data => {
      this.router.navigateByUrl('/members');
    });
  }
}
