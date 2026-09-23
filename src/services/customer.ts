// services/customers.ts

import api from "@/utils/api";

export const getCustomers = () => {
    return api.get('customers/');
};

export const getCustomerDetail = (customerId: number) => {
    return api.get(`customers/${customerId}/`);
};