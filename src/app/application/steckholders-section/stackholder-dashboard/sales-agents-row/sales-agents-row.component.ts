import { Component, OnInit } from "@angular/core";
import { DropdownModule } from "primeng/dropdown";
import { Router } from "@angular/router";
import Swal from "sweetalert2";
import { TokenService } from "../../../../services/token/services/token.service";
import { environment } from "../../../../environment/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { StakeholderService } from "../../../../services/stakeholder/stakeholder.service";

@Component({
  selector: "app-sales-agents-row",
  standalone: true,
  imports: [CommonModule, DropdownModule],
  templateUrl: "./sales-agents-row.component.html",
  styleUrl: "./sales-agents-row.component.css",
})
export class SalesAgentsRowComponent implements OnInit {
  activeSalesAgents!: number;
  allSalesAgents!: number;
  newSalesAgents!: number;

  constructor(
    private router: Router,
    private http: HttpClient,
    private tokenService: TokenService,
    private stakeholderSrv: StakeholderService,
  ) {}

  ngOnInit(): void {
    this.fetchSalesAgentData();
  }

  fetchSalesAgentData() {
    console.log("fetching started");
    // this.isLoading = true;
    this.stakeholderSrv.getSalesAgentData().subscribe(
      (res) => {
        console.log("dtgsgdgdg", res);
        this.activeSalesAgents =
          res.activeSalesAgents[0]?.activeSalesAgents ?? 0;
        this.allSalesAgents = res.allSalesAgents[0]?.totalSalesAgents ?? 0;
        this.newSalesAgents = res.newSalesAgents[0]?.newSalesAgents ?? 0;
      },
      (error) => {
        console.log("Error: ", error);
        // this.isLoading = false;
      },
    );
  }
}
