import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Customer {
    id: bigint;
    name: string;
    createdAt: Time;
    email: string;
    phone: string;
}
export interface Transaction {
    id: bigint;
    balance: number;
    date: Time;
    createdAt: Time;
    description: string;
    credit: number;
    customerId: bigint;
    debit: number;
}
export interface backendInterface {
    createCustomer(name: string, email: string, phone: string): Promise<Customer>;
    createTransaction(customerId: bigint, date: Time, description: string, debit: number, credit: number, balance: number): Promise<Transaction>;
    deleteCustomer(id: bigint): Promise<void>;
    getAllCustomers(): Promise<Array<Customer>>;
    getCustomer(id: bigint): Promise<Customer | null>;
    getTransaction(id: bigint): Promise<Transaction | null>;
    getTransactionsByCustomer(customerId: bigint): Promise<Array<Transaction>>;
    updateCustomer(id: bigint, name: string, email: string, phone: string): Promise<Customer>;
}
