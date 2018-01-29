import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { Globals } from '../globals';

@Component({
  selector: 'app-redeem-points',
  templateUrl: './redeem-points.component.html',
  styleUrls: ['./redeem-points.component.css']
})
export class RedeemPointsComponent implements OnInit {

  listOfAllRedemptionItems: Array<any> = [];
  listOfRedemptionItemsInShoppingCart: Array<any> = [];

  modalViewForOrderSuccessMessage_Ref = null;

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router, private modalService: NgbModal, private globals: Globals) {
  }

  ngOnInit() {
    this.refreshListOfAvailableRedemptionItems();
  }

  // Retrieve All
  refreshListOfAvailableRedemptionItems() {
    this.http.get('api/redemptionItems').subscribe(data => {
      this.listOfAllRedemptionItems = data as Array<any>;
    });
  }

  // Add Item To Shopping Cart
  addToShoppingCart(redemptionItem) {
    this.listOfRedemptionItemsInShoppingCart.push(redemptionItem);
  }

  // Get Total Cost
  getTotalCostInPointsOfShoppingCart() {
    var totalCostInPoints = 0;
    for (var i = 0; i < this.listOfRedemptionItemsInShoppingCart.length; i++) {
      totalCostInPoints += Number(this.listOfRedemptionItemsInShoppingCart[i].costInPoints);
    }
    return totalCostInPoints;
  }

  confirmCheckout(modal) {
    var memberRedemptionOrder = {
      "memberId": this.globals.currentMember._id,
      "redeemedOn": Date.now(),
      "redeemedItems": this.listOfRedemptionItemsInShoppingCart
    };

    this.http.post('api/memberRedemptionOrder', memberRedemptionOrder).subscribe(data => {
      this.modalViewForOrderSuccessMessage_Ref = this.modalService.open(modal);
    });
  }

  closeModalViewForOrderSuccessMessage() {
    this.modalViewForOrderSuccessMessage_Ref.close();
    this.router.navigateByUrl('/userDashboard');
  }
}
