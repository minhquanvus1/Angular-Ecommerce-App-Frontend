import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  getProduct(theProductId: number): Observable<Product> {
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
  }
  searchProducts(theKeyWord: string): Observable<Product[]> {
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyWord}`;
    return this.getProducts(searchUrl);
  }
  searchProductsPaginate(thePage: number, thePageSize: number, theKeyWord: string): Observable<GetResponseProducts> {
    // build URL based on category id, page, and size
    const searchUrl: string = `${this.baseUrl}/search/findByNameContaining?name=${theKeyWord}&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }

  private categoryUrl = environment.luv2shopApiUrl + '/product-category';
  
  private baseUrl = environment.luv2shopApiUrl + "/products";

  constructor(private httpClient: HttpClient) { }

  private getProducts(searchUrl: string): Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map(response => response._embedded.products)
    );
  }

  // return an observable of a list of Product objects (map the JSON data from Spring Data REST to Product array)
  getProductList(theCategoryId: number): Observable<Product[]> {
    // @TODO: need to build URL based on category id
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchUrl);
  }

  getProductCategories(): Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseCategory>(this.categoryUrl)
     .pipe(map(response =>response._embedded.productCategory))
  };

  getProductListPaginate(thePage: number, thePageSize: number, theCategoryId: number): Observable<GetResponseProducts> {
    // build URL based on category id, page, and size
    const searchUrl: string = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}&page=${thePage}&size=${thePageSize}`;
    console.log(`get product list from ${searchUrl}`);
    
    return this.httpClient.get<GetResponseProducts>(searchUrl);
  }
}
// unwrap the JSON from Spring Data REST _embedded entry
// interface: is used to map the JSON from REST API to Product array
export interface GetResponseProducts {
  _embedded: {
    products: Product[];
  },
  page: {
    size: number,
    totalElements: number,
    totalPages: number,
    number: number
    }
}

interface GetResponseCategory {
  _embedded: {
    productCategory: ProductCategory[];
  }
}

