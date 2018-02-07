import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Globals } from './globals'

// Import HttpClientModule from @angular/common/http
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import { StudentsComponent } from './students/students.component';
import { MarshallMattersComponent } from './marshall-matters/marshall-matters.component';
import { MembersComponent } from './members/members.component';
import { PartnersComponent } from './partners/partners.component';
import { HomeAdminComponent } from './home.admin/home.admin.component';
import { RedeptionItemsComponent } from './redeption-items/redeption-items.component';
import { RedeemPointsComponent } from './redeem-points/redeem-points.component';
import { HomeComponent } from './home/home.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { CouponsComponent } from './coupons/coupons.component';

const appRoutes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'homeAdmin', component: HomeAdminComponent },
  { path: 'students', component: StudentsComponent },
  { path: 'marshallMatters', component: MarshallMattersComponent },
  { path: 'members', component: MembersComponent },
  { path: 'partners', component: PartnersComponent },
  { path: 'redemptionItems', component: RedeptionItemsComponent },
  { path: 'redeemPoints', component: RedeemPointsComponent },
  { path: 'userDashboard', component: UserDashboardComponent },
  { path: 'coupons', component: CouponsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    StudentsComponent,
    MarshallMattersComponent,
    MembersComponent,
    PartnersComponent,
    HomeAdminComponent,
    RedeptionItemsComponent,
    RedeemPointsComponent,
    HomeComponent,
    UserDashboardComponent,
    CouponsComponent
  ],
  imports: [
    BrowserModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    HttpClientModule,
    FormsModule
  ],
  providers: [Globals],
  bootstrap: [AppComponent]
})

export class AppModule { }
