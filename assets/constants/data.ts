
export const shippingInfo = [
    {
        options: ['Kakuma 1', 'Kakuma 2', 'Kakuma 3', 'Kakuma 4'],
        label: 'kakuma',
        value: 'Kakuma'
    },
    {
        options: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'],
        label: 'zone',
        value: 'Zone'
    },
    {
        options: ['Block 1', 'Block 2', 'Block 3', 'Block 4', 'Block 5', 
            'Block 6', 'Block 7', 'Block 8', 'Block 9', 'Block 10', 'Block 11', 'Block 12',
            'Block 12', 'Block 14', 'Block 15', 'Block 16'
        ],
        label: 'block',
        value: 'Block'
    }
];

export const CategoryInfo = [
    {
        options: ['Logistics & Transport', 'Apparel & Fashion', 'Food & Groceries', 'Electronics'],
        label: 'categories',
        value: 'Categories'
    }
];
export const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed'},
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },

] as const;
