import { P } from '@angular/cdk/keycodes';
import { RouterLink } from '@angular/router';
import { expand } from 'rxjs';

export const navbarData = [
  {
    RouterLink: 'steckholders',
    icon: 'fa-solid fa-users',
    label: 'Stakeholders',
    expanded: false,
    Permission: 'Steckholders Tab',
    children: [
      {
        RouterLink: '/steckholders/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashboard',
      },
      {
        RouterLink: '/steckholders/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/reports',
    icon: 'fa-solid fa-file',
    label: 'Report',
    Permission: 'Report Tab',
  },
  {
    RouterLink: 'finance',
    icon: 'fa-solid fa-coins',
    label: 'Finance',
    expanded: false,
    Permission: 'Finance Tab',
    children: [
      {
        RouterLink: '/finance/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashboard',
      },
      {
        RouterLink: '/finance/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: 'plant-care',
    icon: 'fas fa-leaf',
    label: 'Govi Care',
    expanded: false,
    Permission: 'Govi Care Tab',
    children: [
      {
        RouterLink: '/plant-care/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashboard',
      },
      {
        RouterLink: '/plant-care/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: 'govi-link',
    icon: 'fa-solid fa-magnifying-glass',
    label: 'GoVi Link',
    expanded: false,
    Permission: 'GoviLinkTab',
    children: [
      {
        RouterLink: '/govi-link/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashboard',
      },
      {
        RouterLink: '/govi-link/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/collection-hub',
    icon: 'fa-solid fa-warehouse',
    label: 'Collection Hub',
    Permission: 'Collection Hub Tab',
  },
  {
    RouterLink: '/distribution-hub',
    icon: 'fa-solid fa-building-circle-arrow-right',
    label: 'Distribution Hub',
    expanded: false,
    Permission: 'Distribution Hub Tab',
    children: [
      {
        RouterLink: '/distribution-hub/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashboard',
      },
      {
        RouterLink: '/distribution-hub/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/procurement',
    icon: 'fa-solid fa-box-open',
    label: 'Procurement',
    Permission: 'Procurement Tab',
  },
  {
    RouterLink: '/dispatch',
    icon: 'fa-solid fa-truck-fast',
    label: 'Dispatch',
    Permission: 'Dispatch Tab',
  },
  {
    RouterLink: 'market',
    icon: 'fa-solid fa-shop',
    label: 'GoviMart',
    expanded: false,
    Permission: 'GoviMart Tab',
    children: [
      {
        RouterLink: '/market/dashboard',
        childIcon: 'fa-solid fa-gauge',
        label: 'Dashboard',
      },
      {
        RouterLink: '/market/action',
        childIcon: 'fa-brands fa-creative-commons-nd',
        label: 'Action',
      },
    ],
  },
  {
    RouterLink: '/sales-dash',
    icon: 'fa-solid fa-bullseye',
    label: 'Sales Dash',
    Permission: 'Sales Dash Tab',
  },
  {
    RouterLink: '/complaints',
    icon: 'fa-solid fa-circle-question',
    label: 'Complaints',
    Permission: 'Complaints Tab',
  },
];
