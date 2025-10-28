import { Component } from '@angular/core';
import { SearchBarComponent } from "../../../shared/components/search-bar/search-bar";
import { HomeCardComponent } from "../../Homecards/home-card-component/home-card-component";

@Component({
  selector: 'app-home-page',
  imports: [SearchBarComponent, HomeCardComponent],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css'
})
export class HomePage {

}
