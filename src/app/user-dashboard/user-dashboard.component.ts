import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Globals } from '../globals';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {

  listOfAllmemberRedemptionOrders: Array<any> = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private globals: Globals) {
    
  }

  ngOnInit() {
    this.refreshListOfMemberRedemptionOrders();
  }

  // Retrieve All
  refreshListOfMemberRedemptionOrders() {
    console.log("MemberId: " + this.globals.currentMember._id);
    this.http.get('api/memberRedemptionOrders/' + this.globals.currentMember._id).subscribe(data => {
      this.listOfAllmemberRedemptionOrders = data as Array<any>;
    });
  }

  getTotalPointsFromMemberRedemptionOrder(redeemedItems) {
    var totalCostInPoints = 0;
    for (var i = 0; i < redeemedItems.length; i++) {
      totalCostInPoints += Number(redeemedItems[i].costInPoints);
    }
    return totalCostInPoints;
  }
}
