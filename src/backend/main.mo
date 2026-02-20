import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Order "mo:core/Order";

actor {
  type Customer = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    createdAt : Time.Time;
  };

  type Transaction = {
    id : Nat;
    customerId : Nat;
    date : Time.Time;
    description : Text;
    debit : Float;
    credit : Float;
    balance : Float;
    createdAt : Time.Time;
  };

  module Transaction {
    public func compare(t1 : Transaction, t2 : Transaction) : Order.Order {
      Nat.compare(t1.customerId, t2.customerId);
    };
  };

  var customerIdCounter = 0;
  var transactionIdCounter = 0;

  let customers = Map.empty<Nat, Customer>();
  let transactions = Map.empty<Nat, Transaction>();

  // Customer CRUD operations
  public shared ({ caller }) func createCustomer(name : Text, email : Text, phone : Text) : async Customer {
    customerIdCounter += 1;
    let customer : Customer = {
      id = customerIdCounter;
      name;
      email;
      phone;
      createdAt = Time.now();
    };
    customers.add(customer.id, customer);
    customer;
  };

  public query ({ caller }) func getCustomer(id : Nat) : async ?Customer {
    customers.get(id);
  };

  public shared ({ caller }) func updateCustomer(id : Nat, name : Text, email : Text, phone : Text) : async Customer {
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?existingCustomer) {
        let updatedCustomer : Customer = {
          existingCustomer with
          name;
          email;
          phone;
        };
        customers.add(id, updatedCustomer);
        updatedCustomer;
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Nat) : async () {
    if (not customers.containsKey(id)) {
      Runtime.trap("Customer not found");
    };
    customers.remove(id);
  };

  public query ({ caller }) func getAllCustomers() : async [Customer] {
    customers.values().toArray();
  };

  // Transaction operations
  public shared ({ caller }) func createTransaction(
    customerId : Nat,
    date : Time.Time,
    description : Text,
    debit : Float,
    credit : Float,
    balance : Float,
  ) : async Transaction {
    if (not customers.containsKey(customerId)) {
      Runtime.trap("Customer not found");
    };

    transactionIdCounter += 1;
    let transaction : Transaction = {
      id = transactionIdCounter;
      customerId;
      date;
      description;
      debit;
      credit;
      balance;
      createdAt = Time.now();
    };
    transactions.add(transaction.id, transaction);
    transaction;
  };

  public query ({ caller }) func getTransaction(id : Nat) : async ?Transaction {
    transactions.get(id);
  };

  public query ({ caller }) func getTransactionsByCustomer(customerId : Nat) : async [Transaction] {
    transactions.values().toArray().filter(func(t) { t.customerId == customerId }).sort();
  };
};
