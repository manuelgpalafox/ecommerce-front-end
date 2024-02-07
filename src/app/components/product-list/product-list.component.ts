import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-list',
  templateUrl: 'product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit {

  products: Product[] = [];
  previousCategoryId: number = 1;
  currentCategoryId: number = 1;
  searchMode: boolean = false;
  previousKeyword: String = '';
  currentKeyword: String = '';

  pageNumber: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;

  constructor(private productServie: ProductService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(() => {
      this.listProducts();
    });

  }

  listProducts() {

    this.searchMode = this.route.snapshot.paramMap.has('keyword');

    if (this.searchMode) {
      this.handleSearchProducts();
    } else {
      this.handleListProducts();
    }

  }

  handleSearchProducts() {

    const keyword: string = this.route.snapshot.paramMap.get('keyword')!;

    //if we have a different keyword than previous, we have to reset the pageNumber back to 1

    if (this.previousKeyword != this.currentKeyword) {
      this.pageNumber = 1;
    }

    this.previousKeyword = this.currentKeyword;

    //search for products using the keyword
    this.productServie.getProductSearchPaginate(this.pageNumber-1,
      this.pageSize,
      keyword).subscribe(
        this.processResult()
      )

  }

  handleListProducts() {
    //check if "id" parameter is available
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');

    if (hasCategoryId) {
      //get the "id" param string, convert string to a number using the "+" symbol
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;

      //if we have a different category id than previous, we have to reset the pageNumber back to 1

      if (this.previousCategoryId != this.currentCategoryId) {
        this.pageNumber = 1;
      }

      this.previousCategoryId = this.currentCategoryId;

      this.productServie.getProductListByCategoryPaginate(this.pageNumber - 1,
        this.pageSize,
        this.currentCategoryId).subscribe(
          this.processResult()
        )
    } else {
      // not category id available... default to all the items
      this.productServie.getProductListPlainPaginate(this.pageNumber - 1, this.pageSize).subscribe(
        this.processResult()
      )
    }


  }

  updatePageSize(pageSize: string) {
    this.pageSize = +pageSize;
    this.pageNumber = 1;
    this.listProducts();
  }

  processResult() {
    return (data: any) => {
      this.products = data._embedded.products;
      this.pageNumber = data.page.number + 1;
      this.pageSize = data.page.size;
      this.totalElements = data.page.totalElements;
    }

  }

}
