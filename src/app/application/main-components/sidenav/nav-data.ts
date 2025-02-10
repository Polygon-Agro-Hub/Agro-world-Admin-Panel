import { RouterLink } from '@angular/router';
import { expand } from 'rxjs';

export const navbarData = [
  {
    RouterLink: 'steckholders/dashboard',
    icon: 'fa-solid fa-users',
    label: 'Stakeholders',
    expanded: false,
    children: [
      {
        RouterLink: '/steckholders/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashbord',
      },
      {
        RouterLink: '/steckholders/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: 'reports',
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
        RouterLink: '/plant-care',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashbord',
      },
      {
        RouterLink: '/plant-care/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: 'collection-hub',
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
        RouterLink: '/market',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashbord',
      },
      {
        RouterLink: '/market/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: 'sales-dash',
    icon: 'fa-solid fa-bullseye',
    label: 'Sales Dash',
  },
  {
    RouterLink: 'complaints',
    icon: 'fa-solid fa-circle-question',
    label: 'Complaints',
  },
];
