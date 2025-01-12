import { RouterLink } from "@angular/router";

export const navbarData = [
    {
        RouterLink : 'steckholders',
        icon : 'fa-solid fa-users',
        label :  'Stakeholders'
    },
    {
        RouterLink : 'reports',
        icon : 'fa-solid fa-file',
        label :  'Report'
    },
    {
        RouterLink : 'plant-care',
        icon : 'fas fa-leaf',
        label :  'PlantCare'
    },
    {
        RouterLink : 'field-officer',
        icon : 'fa-solid fa-user-tie',
        label :  'Fieldofficers'
    },
    {
        RouterLink:'collection-hub',
        icon : 'fa-solid fa-warehouse',
        label : 'Collection Hub'
    },
    {
        RouterLink:'market',
        icon : 'fa-solid fa-shop',
        label :  'Marketplace',
        expanded: false,
        children: [
            {
                RouterLink: '/market',
                childIcon : 'fa-solid fa-gauge',
                label: 'Dashbord'
            },
            {
                RouterLink: '/market/action',
                childIcon : 'fa-brands fa-creative-commons-nd',
                label: 'Action'
            }
        ]
    },
    {
        RouterLink : 'sales-dash',
        icon : 'fa-solid fa-bullseye',
        label :  'Sales Dash'
    },
    {
        RouterLink : 'complaints',
        icon : 'fa-solid fa-circle-question',
        label :  'Complaints'
    }

    
];