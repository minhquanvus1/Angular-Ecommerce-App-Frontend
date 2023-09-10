import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from 'src/app/common/cart-item';
import { Product } from 'src/app/common/product';
import { CartService } from 'src/app/services/cart.service';
import { GetResponseProducts, ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  // templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number = 1;
  currentCategoryName: string = "";
  searchMode: boolean = false;

  // properties for Pagination
  thePageNumber: number = 1;
  thePageSize: number = 5;
  theTotalElements: number = 0;
 
  previousKeyword: string = "";

  constructor(private productService: ProductService, private cartService: CartService, private route: ActivatedRoute) {}
  ngOnInit(): void {
    // route.paramMap returns an Observable<ParamMap>, containing object of path parameter --> this will track the changes in the route parameters over time
    this.route.paramMap.subscribe( () => this.listProducts());
    
  }
  listProducts(): void {
    this.searchMode = this.route.snapshot.paramMap.has("keyword");
    if(this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }

  }
handleSearchProducts() {

  const theKeyWord: string = this.route.snapshot.paramMap.get("keyword")!;

  if(this.previousKeyword != theKeyWord) {
    this.thePageNumber = 1;
  }
  this.previousKeyword = theKeyWord;
  console.log(`keyword=${theKeyWord}, thePageNumber=${this.thePageNumber}`);
  this.productService.searchProductsPaginate(this.thePageNumber - 1, this.thePageSize, theKeyWord)
  .subscribe(this.processResult());

  // now search for the products using keyword
 // this.productService.searchProducts(theKeyWord).subscribe((data: Product[]) => this.products = data);
}
  processResult() {
    return (data: GetResponseProducts) => {
      this.products = data._embedded.products;
      this.thePageNumber = data.page.number + 1;
      this.thePageSize = data.page.size;
      this.theTotalElements = data.page.totalElements;
    };
  }
  handleListProducts() {
    // check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has("id");
    if(hasCategoryId) {
      // get the "id" param string. convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get("id")!;
      this.currentCategoryName = this.route.snapshot.paramMap.get("name")!;
    } else {
      // not category id available ... default to category id 1
      this.currentCategoryId = 1;
      this.currentCategoryName = "Books";
    }

    if(this.previousCategoryId != this.currentCategoryId) {
      this.thePageNumber = 1;
    }
    this.previousCategoryId = this.currentCategoryId;
    console.log(`currentCategoryId=${this.currentCategoryId}, thePageNumber=${this.thePageNumber}`);
    this.productService.getProductListPaginate(this.thePageNumber - 1, this.thePageSize, this.currentCategoryId)
    .subscribe(this.processResult());

    // get the products for this given category id
    // this.productService.getProductList(this.currentCategoryId)
    // .subscribe((data) => this.products = data)
  }

  updatePageSize(pageSize: string) {
    this.thePageSize = +pageSize;
    this.thePageNumber = 1;
    this.listProducts();
  }

  addToCart(theProduct: Product): void {
    console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

    const theCartItem = new CartItem(theProduct);
    this.cartService.addToCart(theCartItem);
    
  }

}
