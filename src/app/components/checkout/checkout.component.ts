import { CheckoutService } from './../../services/checkout.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { last } from 'rxjs';
import { CartItem } from 'src/app/common/cart-item';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { PaymentInfo } from 'src/app/common/payment-info';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';
import { environment } from 'src/environments/environment.development';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;
  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  countries: Country[] = [];
  countriess: Country[] = [{id:8, code:'VN', name:'Vietnam'},{id:9, code:'US', name:'United States'},];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  storage: Storage = sessionStorage;
  theEmail = JSON.parse(this.storage.getItem("userEmail")!);

  //initialize Stripe API
  stripe = Stripe(environment.stripePublishableKey);

  // initialize PaymentInfo object
  paymentInfo: PaymentInfo = new PaymentInfo();

  cardElement: any;
  displayError: any = '';

  isDisabled: boolean = false;

  constructor(private formBuilder: FormBuilder, private cartService: CartService, private luv2ShopFormService: Luv2ShopFormService, private checkoutService: CheckoutService, private router: Router) {}
  ngOnInit(): void {

    // set up Stripe form
    this.setupStripePaymentForm();
    this.checkoutFormGroup = this.formBuilder.group({
      Customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
        lastName:  new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
        email: new FormControl(this.theEmail,
                              [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
        ShippingAddress: this.formBuilder.group({
          street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
          city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
          state: new FormControl('', Validators.required),
          country: new FormControl('', Validators.required),
          zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace])
          
        }),
        BillingAddress: this.formBuilder.group({
          street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
          city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
          state: new FormControl('', Validators.required),
          country: new FormControl('', Validators.required),
          zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace])
        }),
        CreditCard: this.formBuilder.group({
          /*
          cardType: new FormControl('', Validators.required),
          nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.onlyWhiteSpace]),
          cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
          securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
          expirationMonth: [''],
          expirationYear: ['']
          */
        })
      });



      // when form is initally displayed, then populate the country field (so that's why we place this code inside ngOnInIt())
      this.luv2ShopFormService.getCountries().subscribe(
        data => {
          console.log("Retrieved countries: " + JSON.stringify(data));
          this.countries = data;
        }
      );
        
      /*
      // populate credit card months
      const startMonth: number = new Date().getMonth() + 1;
      this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe((data: number[]) => {
        console.log("Retrieved credit card months: " + JSON.stringify(data));
        this.creditCardMonths = data;
      })

      // populate credit card years
      this.luv2ShopFormService.getCreditCardYears().subscribe((data: number[]) => {
        console.log("Retrieved credit card years: " + JSON.stringify(data));
        this.creditCardYears = data;
      });
      */
  
  this.reviewCartDetails();
    }
  setupStripePaymentForm() {
    
    // get a handle of Stripe elements
    var elements = this.stripe.elements();

    // create card element...customize by: hiding zip-code field
    this.cardElement = elements.create('card', {hidePostalCode: true});
    // add an instance of card UI component, into 'card-element' div
    this.cardElement.mount('#card-element');
    // add event binding for the 'change' event on the card element
    this.cardElement.on('change', (event: any) => {
      // get a handle to card-errors element
      this.displayError = document.getElementById('card-errors');

      if(event.complete) {
        this.displayError.textContent = '';
      } else if(event.error) {
        // show validation error to customer
        this.displayError.textContent = event.error.message;
      }
    });
  }
  reviewCartDetails() {
    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe((totalQuantity: number) => this.totalQuantity = totalQuantity);

    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe((totalPrice: number) => this.totalPrice = totalPrice);
  }
  get firstName() { return this.checkoutFormGroup.get('Customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('Customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('Customer.email'); }

  get shippingAddressStreet() {return this.checkoutFormGroup.get('ShippingAddress.street');}
  get shippingAddressCity() {return this.checkoutFormGroup.get('ShippingAddress.city');}
  get shippingAddressState() {return this.checkoutFormGroup.get('ShippingAddress.state');}
  get shippingAddressZipCode() {return this.checkoutFormGroup.get('ShippingAddress.zipCode');}
  get shippingAddressCountry() {return this.checkoutFormGroup.get('ShippingAddress.country');}

  get billingAddressStreet() {return this.checkoutFormGroup.get('BillingAddress.street');}
  get billingAddressCity() {return this.checkoutFormGroup.get('BillingAddress.city');}
  get billingAddressState() {return this.checkoutFormGroup.get('BillingAddress.state');}
  get billingAddressZipCode() {return this.checkoutFormGroup.get('BillingAddress.zipCode');}
  get billingAddressCountry() {return this.checkoutFormGroup.get('BillingAddress.country');}

  get creditCardType() {return this.checkoutFormGroup.get('CreditCard.cardType');}
  get creditCardNameOnCard() {return this.checkoutFormGroup.get('CreditCard.nameOnCard');}
  get creditCardNumber() {return this.checkoutFormGroup.get('CreditCard.cardNumber');}
  get creditCardSecurityCode() {return this.checkoutFormGroup.get('CreditCard.securityCode');}



  onSubmit() {
    console.log("Handling the submit button");
    if(this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // set up order
    let order: Order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    // get cart item (from the CartService)
    const cartItems: CartItem[] = this.cartService.cartItems;

    // create orderItems (array of Order) from cartItems (array of CartItem)
    // - long way
    // let orderItems: OrderItem[] = [];
    // for(let i = 0; i < cartItems.length; i++) {
    //   orderItems[i] = new OrderItem(cartItems[i]);
    // }

    // - short way
    let orderItems: OrderItem[];
    orderItems = cartItems.map(tempCartItem => new OrderItem(tempCartItem));

    // set up purchase
    let purchase: Purchase = new Purchase();

    // populate purchase - customer
    purchase.customer = this.checkoutFormGroup.controls["Customer"].value;

    // populate purchase - shippingAddress  
    purchase.shippingAddress = this.checkoutFormGroup.controls["ShippingAddress"].value; 
    const shippingState: State = JSON.parse(JSON.stringify(purchase.shippingAddress.state));
    const shippingCountry: Country = JSON.parse(JSON.stringify(purchase.shippingAddress.country));
    purchase.shippingAddress.state = shippingState.name;
    purchase.shippingAddress.country = shippingCountry.name;

    // populate purchase - billingAddress
    purchase.billingAddress = this.checkoutFormGroup.controls["BillingAddress"].value;
    const billingState: State = JSON.parse(JSON.stringify(purchase.billingAddress.state));
    const billingCountry: Country = JSON.parse(JSON.stringify(purchase.billingAddress.country));
    purchase.billingAddress.state = billingState.name;
    purchase.billingAddress.country = billingCountry.name;

    // populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;

    // compute payment info
    this.paymentInfo.amount = Math.round(this.totalPrice * 100);
    this.paymentInfo.currency = "USD";

    console.log(`this.paymentInfo.amount: ${this.paymentInfo.amount}`);
    

    /*
    // call REST API via CheckOutService
    this.checkoutService.placeOrder(purchase).subscribe(
      {
        next: (response: any) => {alert(`Your order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
      this.resetCart()},
        error: err => {alert(`There was an error: ${err.message}`)}
      }
    );
      */

     // if valid form, then:
     // -- create paymentintent
     // -- confirm card payment
     // -- place order

     this.isDisabled = true;

     if(!this.checkoutFormGroup.invalid && this.displayError.textContent === '') {
      this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
        (paymentIntentResponse) => {
          this.stripe.confirmCardPayment(paymentIntentResponse.client_secret, {
            payment_method: {
              card: this.cardElement,
              billing_details: {
                email: purchase.customer.email,
                name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
                address: {
                  line1: purchase.billingAddress.street,
                  city: purchase.billingAddress.city,
                  state: purchase.billingAddress.state,
                  postal_code: purchase.billingAddress.zipCode,
                  country: this.billingAddressCountry?.value.code
                }
              }
            }
          }, {handleActions: false}).then((result: any) => {
            if(result.error) {
              // inform the customer of the error
              alert(`There was an error: ${result.error.message}`);
              this.isDisabled = false;
            } else {
              // call REST API via checkoutService
              this.checkoutService.placeOrder(purchase).subscribe({
                next: (response: any) => {
                  alert(`Your order has been received\nOrder Tracking Number: ${response.orderTrackingNumber}`);
                  // reset cart
                  this.resetCart();
                  this.isDisabled = false;
                },
                error: (err: any) => {
                  alert(`There was an error: ${err.message}`);
                  this.isDisabled = false;
                }
              });
            }
          });
        }
      );
     } else {
      this.checkoutFormGroup.markAllAsTouched();
      return;
     }
    console.log(this.checkoutFormGroup.get('Customer')!.value);
    console.log(`The email address is ${this.checkoutFormGroup.get("Customer")!.value.email}`);
    console.log(`Shipping Address Country Name is: ${this.checkoutFormGroup.get("ShippingAddress")!.value.country.name}`);
    console.log(`Shipping Address State Name is: ${this.checkoutFormGroup.get("ShippingAddress")!.value.state.name}`);
    
  }
  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    this.cartService.persistCartItems();

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to Products page
    this.router.navigateByUrl("/products");
  }

  copyShippingAddressToBillingAddress(event: any) {
    if(event.target.checked) {
      this.checkoutFormGroup.controls["BillingAddress"].setValue(this.checkoutFormGroup.controls["ShippingAddress"].value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls["BillingAddress"].reset();
      this.billingAddressStates = [];
    }
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get("CreditCard")!;
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = +creditCardFormGroup.value.expirationYear;
    let startMonth: number;
    if(currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;

    } else {
      startMonth = 1;
    }
    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe((data: number[]) => {
      console.log("Retrieved credit card months: " + JSON.stringify(data));
      this.creditCardMonths = data;
      
    });

    
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName)!;
    const countryName = formGroup.value.country.name;
    const countryCode = formGroup.value.country.code;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);
    
    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if(formGroupName === "ShippingAddress") {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        // select first item by default
        formGroup.get("state")!.setValue(data[0]); 
      }
    );
    
  }

}
