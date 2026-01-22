import { Component, OnInit } from '@angular/core';
import { LoadingSpinnerComponent } from '../../../../components/loading-spinner/loading-spinner.component';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { DistributionHubService } from '../../../../services/distribution-hub/distribution-hub.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarModule } from 'primeng/calendar';
import { HomeDeliveryViewPopupComponent } from "../home-delivery-view-popup/home-delivery-view-popup.component";

@Component({
  selector: 'app-center-home-delivery-orders',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    DropdownModule,
    FormsModule,
    CalendarModule,
    HomeDeliveryViewPopupComponent
],
  templateUrl: './center-home-delivery-orders.component.html',
  styleUrl: './center-home-delivery-orders.component.css'
})
export class CenterHomeDeliveryOrdersComponent implements OnInit {
  isLoading: boolean = false;
  activeTab: string = 'all';

  placeholderDate: string = 'Date';

  selectedDate: string | Date | null = null;
  
  // Data from backend
  allDeliveries: Delivery[] = [];
  deliveryObj: Partial<Delivery> = {};

  // Filtered data for tabs
  allFilteredDeliveries: Delivery[] = [];
  outForDeliveryData: Delivery[] = [];
  onTheWayData: Delivery[] = [];
  holdData: Delivery[] = [];
  returnData: Delivery[] = [];
  deliveredData: Delivery[] = []; // This will hold Delivered status data

  displayedDeliveries: Delivery[] = [];
  showDetailsPopup: boolean = false;
  selectedDeliveryId!: number;

  hasData: boolean = false;

  searchPlaceHolder: string = "Search By Order ID...";

  centerId: number = 66;
  centerName: string = ''
  centerRegCode: string = ''

  statusOptions = [
    { label: 'All', value: null },
    { label: 'Out for Delivery', value: 'Out For Delivery' },
    { label: 'Collected', value: 'Collected' },
    { label: 'On the way', value: 'On the way' },
    { label: 'Return', value: 'Return' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Return Received', value: 'Return Received' },
    { label: 'Delivered', value: 'Delivered' },
    
  ];

  selectedStatus: any = null;
  searchText: string = '';

  showInfoModal: boolean = false;

  constructor(private distributionService: DistributionHubService,) {}

  ngOnInit(): void {
    this.centerFetchDeliveries();
  }

  back(): void {
    window.history.back();
  }

  statusOptionsArr = [
    { label: 'All', value: null },
    { label: 'Return Received', value: 'Return Received' },
    { label: 'Out for Delivery', value: 'Out For Delivery' },
    { label: 'Collected', value: 'Collected' },
    { label: 'On the way', value: 'On the way' },
    { label: 'Return', value: 'Return' },
    { label: 'Hold', value: 'Hold' },
    { label: 'Delivered', value: 'Delivered' },
  ];


  onStatusChange(): void {
    this.centerFetchDeliveries();
  }

  onSearchChange(): void {
    this.centerFetchDeliveries();
  }

  clearSearch(): void {
    this.searchText = '';
    this.centerFetchDeliveries();
  }

  selectTab(tabName: string): void {
    this.activeTab = tabName;

    switch (tabName) {
    
      case 'all':
        this.placeholderDate = 'Date'
        this.searchPlaceHolder = 'Search By Order ID..'
        break;
    
      case 'out-for-delivery':
        this.placeholderDate = 'Out Date'
        this.searchPlaceHolder = 'Search by Order ID, Any Phone..'
        break;

      case 'Return Received':
        this.placeholderDate = 'Recieved Date'
        this.searchPlaceHolder = 'Search by Order ID..'
        break;

      case 'delivered':
        this.searchPlaceHolder = 'Search by Order ID..'
        break;

      default:
        this.searchPlaceHolder = 'Search by Order ID, Any Phone..'
        break;
    }

    this.centerFetchDeliveries(this.activeTab, this.centerId, this.selectedStatus = '', this.searchText = '', this.selectedDate = '');
  }

  centerFetchDeliveries(activeTab: string = this.activeTab, centerId: number = this.centerId, status: string = this.selectedStatus, searchText: string = this.searchText, date: string | Date | null = this.selectedDate): void {
    this.isLoading = true;
    this.distributionService.getcenterHomeDeliveryOrders(activeTab, centerId, status, searchText, date).subscribe({
      next: (response) => {
        if (response.status && response.data) {
          this.allDeliveries = response.data;
          console.log('allDeliveries', this.allDeliveries)

          this.hasData = this.allDeliveries.length > 0
          this.prepareDeliveryData();
          this.filterDataByStatus();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching deliveries:', error);
        this.isLoading = false;
      }
    });
  }

  prepareDeliveryData(): void {
    this.allDeliveries = this.allDeliveries.map((delivery, index) => {
      // Format return time from createdAt or outDlvrTime
      const returnTime = this.formatToReturnTime(delivery.createdAt || delivery.outDlvrTime);
      
      // Format delivery time slot from sheduleTime
      const deliveryTimeSlot = this.formatDeliveryTimeSlot(delivery.sheduleTime);
      
      // Format delivery time for delivered items (use outDlvrTime or createdAt)
      const deliveryTime = this.formatToReturnTime(delivery.outDlvrTime || delivery.createdAt);
      
      return {
        ...delivery,
        no: index + 1,
        driver: 'DIV000001', // Placeholder - update with actual data if available
        phoneNumber: '0781112300', // Placeholder - update with actual data if available
        returnTime: returnTime,
        deliveryTimeSlot: deliveryTimeSlot,
        deliveryTime: deliveryTime, // Add deliveryTime for delivered tab
        orderId: delivery.invNo, // Map invNo to orderId
        centre: delivery.regCode // Map regCode to centre
      };
    });
  }

  private formatToReturnTime(timeString: string): string {
    if (!timeString) return 'N/A';
    
    try {
      const date = new Date(timeString);
      if (isNaN(date.getTime())) {
        if (timeString.includes('.')) return timeString;
        return 'N/A';
      }
      
      let hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      const minutesStr = minutes < 10 ? '0' + minutes : minutes.toString();
      
      return `${hours}.${minutesStr}${ampm}`;
    } catch (error) {
      console.error('Error formatting return time:', error);
      return 'N/A';
    }
  }

  private formatDeliveryTimeSlot(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';
    
    try {
      const date = new Date(sheduleTime);
      if (isNaN(date.getTime())) {
        return sheduleTime;
      }
      
      const hours = date.getHours();
      
      if (hours >= 8 && hours < 14) {
        return '8AM - 2PM';
      } else if (hours >= 14 && hours < 20) {
        return '2PM - 8PM';
      } else {
        return 'Other';
      }
    } catch (error) {
      console.error('Error formatting delivery time slot:', error);
      return 'N/A';
    }
  }

  filterDataByStatus(): void {
    // Filter data for each status
    this.allFilteredDeliveries = this.allDeliveries;
    this.outForDeliveryData = this.allDeliveries.filter(d => d.status === 'Out For Delivery');
    this.onTheWayData = this.allDeliveries.filter(d => d.status === 'On the way');
    this.holdData = this.allDeliveries.filter(d => d.status === 'Hold');
    this.returnData = this.allDeliveries.filter(d => d.status === 'Return');
    this.deliveredData = this.allDeliveries.filter(d => d.status === 'Delivered');
  }

  onSearch(): void {
    this.centerFetchDeliveries();
  }

  // Getter methods for counts
  getTotalCount(): number {
    return this.allDeliveries.length;
  }

  getOutForDeliveryCount(): number {
    return this.outForDeliveryData.length;
  }

  getOnTheWayCount(): number {
    return this.onTheWayData.length;
  }

  getHoldCount(): number {
    return this.holdData.length;
  }

  getReturnCount(): number {
    return this.returnData.length;
  }

  getDeliveredCount(): number {
    return this.deliveredData.length;
  }

  formatTimeRange(sheduleTime: string): string {
    if (!sheduleTime) return 'N/A';
    
    // Remove "Within " prefix if present
    let timeRange = sheduleTime;
    if (timeRange.startsWith('Within ')) {
      timeRange = timeRange.substring(7);
    }
    
    // Convert "8-12 PM" to "8AM - 12PM"
    // Handle various formats
    if (timeRange.includes('AM') || timeRange.includes('PM')) {
      // If it already has AM/PM indicators
      return timeRange.replace('-', ' - ');
    } else {
      // If it's just numbers like "8-12"
      const parts = timeRange.split('-');
      if (parts.length === 2) {
        const start = parts[0].trim();
        const end = parts[1].trim();
        
        // Determine AM/PM based on the hour
        const startNum = parseInt(start);
        const endNum = parseInt(end);
        
        const startSuffix = startNum < 12 ? 'AM' : 'PM';
        const endSuffix = endNum < 12 ? 'AM' : 'PM';
        
        // Convert to 12-hour format if needed
        const startHour = startNum > 12 ? startNum - 12 : startNum;
        const endHour = endNum > 12 ? endNum - 12 : endNum;
        
        return `${startHour}${startSuffix} - ${endHour}${endSuffix}`;
      }
    }
    
    return timeRange;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Out For Delivery':
        return 'bg-[#FCD4FF] text-[#80118A]';
      case 'Delivered':
        return 'bg-[#BBFFC6] text-[#308233]';
      case 'Collected':
        return 'bg-[#F8FEA5] text-[#7E8700]';
      case 'On the way':
        return 'bg-[#FFEDCF] text-[#D17A00]';
      case 'Return':
        return 'bg-[#FFDCDA] text-[#FF1100]';
      case 'Hold':
        return 'bg-[#FFEDCF] text-[#D17A00]';
      case 'Return Received':
        return 'bg-[#FFDCDA] text-[#FF1100]';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  openDetailsPopup(delivery: Delivery): void {
    if (delivery.id == null) {
      console.warn('Delivery id is missing for selected row:', delivery);
      return; 
    }
    this.selectedDeliveryId = delivery.id;
    this.showDetailsPopup = true;
  }

  // Close details popup
  closeDetailsPopup(): void {
    this.showDetailsPopup = false;
  }


  openInfoPopup(delivery: Delivery): void {
    if (delivery.id == null) {
      console.warn('Delivery id is missing for selected row:', delivery);
      return; 
    }
    this.deliveryObj = delivery;
    this.showInfoModal = true;
  }

  // Close details popup
  closeInfoPopup(): void {
    this.showInfoModal = false;
  }

  dateFilter() {
    console.log('date', this.selectedDate);
    this.centerFetchDeliveries()
  }

  onDateClear() {
    this.selectedDate = '';
    this.centerFetchDeliveries()
  }

  onDateChange(newDate: string | Date | null) {
    let dateString: string;
  
    if (!newDate) {
      
      dateString = new Date().toISOString().split('T')[0];
    } 
    else if (newDate instanceof Date) {
      
      dateString = newDate.toISOString().split('T')[0];
    } 
    else {
      
      dateString = newDate;
    }
  
    this.selectedDate = dateString;
    this.centerFetchDeliveries();
  
  }

}


class Delivery {
  id! :number;
  invNo!: string;
  regCode!: string;
  sheduleTime!: string;
  createdAt!: string;
  status!: string;
  outDlvrTime!: string;
  no!: number;
  driver!: string;
  phone1!: string;
  phoneCode1!: string;
  returnTime!: string;
  deliveryTimeSlot!: string;
  // Add these properties for child component compatibility
  orderId!: string;
  centre!: string;
  deliveryTime!: string;
  total!: number;
  customerName!: string;
  customerPhone!: string;
  orderApp!: string;
  sheduleDate!: Date;
  fullName!: string;
  phone2!: string;
  phoneCode2!: string;
  isPaid!: number;
  paymentMethod!: string;
  receivedTime!: string;
  title!: string;
  recieverTitle!: string;
}
