import { RouterLink } from '@angular/router';
import { expand } from 'rxjs';

export const navbarData = [
  {
    RouterLink: 'steckholders',
    icon: 'fa-solid fa-users',
    label: 'Stakeholders',
    expanded: false,
    children: [
      {
        RouterLink: '/admin/steckholders/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashbord',
      },
      {
        RouterLink: '/admin/steckholders/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/admin/reports',
    icon: 'fa-solid fa-file',
    label: 'Report',
  },
  {
    RouterLink: 'plant-care',
    icon: 'fas fa-leaf',
    label: 'Plant Care',
    expanded: false,
    children: [
      {
        RouterLink: '/admin/plant-care/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashbord',
      },
      {
        RouterLink: '/admin/plant-care/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/admin/collection-hub',
    icon: 'fa-solid fa-warehouse',
    label: 'Collection Hub',
  },
  {
    RouterLink: 'market',
    icon: 'fa-solid fa-shop',
    label: 'Market Place',
    expanded: false,
    children: [
      {
        RouterLink: '/admin/market/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashbord',
      },
      {
        RouterLink: '/admin/market/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/admin/sales-dash',
    icon: 'fa-solid fa-bullseye',
    label: 'Sales Dash',
  },
  {
    RouterLink: '/admin/complaints',
    icon: 'fa-solid fa-circle-question',
    label: 'Complaints',
  },
];
