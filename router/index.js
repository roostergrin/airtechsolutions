const router = [
  {
    name: 'Home',
    path: '/',
    navigation: false,
    mobile: true
  },
  {
    name: 'About',
    path: '/about',
    navigation: true,
    children: [
      {
        name: 'Our Mission',
        path: '#our-mission'
      },
      {
        name: 'Why Choose Us',
        path: '#why-choose-us'
      },
      {
        name: 'Our Services',
        path: '#our-services'
      },
      {
        name: 'Insurance & Credentials',
        path: '#insurance-credentials'
      },
      {
        name: 'Vendor Management Credentials',
        path: '#vendor-management-credentials'
      },
      {
        name: 'Equipment & Capabilities',
        path: '#equipment-capabilities'
      },
      {
        name: 'Before & After',
        path: '#before-after'
      },
      {
        name: 'Areas We Serve',
        path: '/areas-we-serve'
      },
      {
        name: 'Property Types We Serve',
        path: '#property-types-we-serve'
      }
    ]
  },
  {
    name: 'Services',
    path: '/services',
    navigation: true,
    children: [
      {
        name: 'Window Cleaning',
        path: '/commercial-window-cleaning-boston-west-newton-ma'
      },
      {
        name: 'Office Exterior Cleaning',
        path: '/commercial-office-exterior-cleaning-boston-west-newton-ma'
      },
      {
        name: 'Professional Exterior Cleaning',
        path: '/professional-commercial-exterior-cleaning-boston-ma'
      },
      {
        name: 'Exterior Soft Washing',
        path: '/commercial-soft-washing-boston-west-newton-ma'
      },
      {
        name: 'Drone Cleaning',
        path: '/commercial-drone-cleaning-boston-west-newton-ma'
      },
      {
        name: 'Dryer Vent Cleaning',
        path: '/commercial-dryer-vent-cleaning-boston-west-newton-ma'
      },
      {
        name: 'Bathroom Exhaust Cleaning',
        path: '/commercial-bathroom-exhaust-cleaning-boston-west-newton-ma'
      },
      {
        name: 'Bathroom Exhaust Repair',
        path: '/commercial-bathroom-exhaust-repair-boston-west-newton-ma'
      },
      {
        name: 'Gutter Cleaning',
        path: '/commercial-gutter-cleaning-boston-west-newton-ma'
      },
      {
        name: 'HVAC Cleaning',
        path: '/commercial-hvac-cleaning-boston-west-newton-ma'
      },
      {
        name: 'Air Quality Testing',
        path: '/commercial-air-quality-testing-boston-west-newton-ma'
      }
    ]
  },
  {
    name: 'Blog',
    path: '/blog',
    navigation: false,
    footer: true
  },
  {
    name: 'Service Guides',
    path: '/service-guides',
    navigation: false,
    footer: true
  },
  {
    name: 'Properties We Serve',
    path: '/services-for-multi-family-properties',
    navigation: true,
    children: [
      {
        name: 'Multi-family Properties',
        path: '/services-for-multi-family-properties'
      },
      {
        name: 'Office Properties',
        path: '/services-for-office-properties'
      },
      {
        name: 'Hotels',
        path: '/services-for-hotels'
      },
      {
        name: 'Hospitals & Healthcare Facilities',
        path: '/services-for-hospitals-and-healthcare-facilities'
      },
      {
        name: 'Industrial Properties',
        path: '/services-for-industrial-properties'
      }
    ]
  },
  {
    name: 'FAQ',
    path: '/faq',
    navigation: true
  },
  {
    name: 'Contact',
    path: '/contact',
    navigation: true
  }
]

export default router
