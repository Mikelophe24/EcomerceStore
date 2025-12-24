# GIẢI THÍCH CHI TIẾT LUỒNG HOẠT ĐỘNG DỰ ÁN E-COMMERCE STORE

## 📋 MỤC LỤC

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [State Management - EcommerceStore](#2-state-management---ecommercestore)
3. [Routing và Navgation](#3-routing-và-navigation)
4. [Các chức năng chính](#4-các-chức-năng-chính)
5. [Sơ đồ luồng dữ liệu](#5-sơ-đồ-luồng-dữ-liệu)

---

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1 Cấu trúc dự án

```
app/
├── app.ts                          # Root component
├── app.routes.ts                   # Cấu hình routing
├── ecommerce.ts                    # Signal Store (State Management)
├── components/                     # Shared components
│   ├── product-cart/              # Card hiển thị sản phẩm
│   ├── toggle-wishlist-button/    # Nút thêm/xóa wishlist
│   ├── search-bar/                # Thanh tìm kiếm
│   ├── sign-in-dialog/            # Dialog đăng nhập
│   ├── sign-up-dialog/            # Dialog đăng ký
│   ├── star-rating/               # Hiển thị rating sao
│   ├── qty-selector/              # Chọn số lượng
│   └── summarize-order/           # Tóm tắt đơn hàng
├── layout/
│   ├── header/                    # Header chính
│   └── header-actions/            # Actions trên header
└── pages/
    ├── products-grid/             # Trang danh sách sản phẩm
    ├── view-product-detail/       # Trang chi tiết sản phẩm
    ├── view-cart/                 # Trang giỏ hàng
    ├── checkout/                  # Trang thanh toán
    ├── my-wishlist/               # Trang wishlist

```

### 1.2 Công nghệ sử dụng

- **Angular 18+**: Framework chính
- **@ngrx/signals**: State management với Signal Store
- **Angular Material**: UI components
- **Immer**: Immutable state updates
- **@angular-architects/ngrx-toolkit**: withStorageSync để persist state
- **Tailwind CSS**: Styling

---

## 2. STATE MANAGEMENT - ECOMMERCESTORE

### 2.1 Cấu trúc State

```typescript
export type EcommerceState = {
  products: Product[]; // Danh sách tất cả sản phẩm
  category: string; // Category đang được chọn
  searchQuery: string; // Từ khóa tìm kiếm
  wishlistItems: Product[]; // Danh sách sản phẩm yêu thích
  cartItems: CartItem[]; // Giỏ hàng
  user: User | undefined; // Thông tin user đăng nhập
  loading: boolean; // Trạng thái loading
  selectedProductId: string | undefined; // ID sản phẩm đang xem
  isSidebarOpen: boolean; // Trạng thái sidebar
};
```

### 2.2 Computed Signals

Store tự động tính toán các giá trị dẫn xuất:

```typescript
withComputed(
  ({ category, products, searchQuery, wishlistItems, cartItems, selectedProductId }) => ({
    // Lọc sản phẩm theo category và search query
    filteredProducts: computed(() => {
      let filtered = products();

      // Lọc theo category
      if (category() !== 'all') {
        filtered = filtered.filter((p) => p.category === category().toLowerCase());
      }

      // Lọc theo search query
      const query = searchQuery().toLowerCase().trim();
      if (query) {
        filtered = filtered.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.category.toLowerCase().includes(query)
        );
      }

      return filtered;
    }),

    // Đếm số lượng wishlist
    wishlistCount: computed(() => wishlistItems().length),

    // Đếm tổng số sản phẩm trong cart
    cartCount: computed(() => cartItems().reduce((acc, item) => acc + item.quantity, 0)),

    // Lấy sản phẩm đang được chọn
    selectedProduct: computed(() => products().find((p) => p.id === selectedProductId())),
  })
);
```

### 2.3 Persistence với withStorageSync

```typescript
withStorageSync({
  key: 'modern-store',
  select: ({ wishlistItems, cartItems, user }) => ({ wishlistItems, cartItems, user }),
});
```

**Chức năng**: Tự động lưu `wishlistItems`, `cartItems`, và `user` vào localStorage. Khi reload trang, dữ liệu sẽ được khôi phục.

---

## 3. ROUTING VÀ NAVIGATION

### 3.1 Cấu hình Routes

```typescript
export const routes: Routes = [
  { path: '', redirectTo: 'products/all', pathMatch: 'full' },
  {
    path: 'products/:category',
    loadComponent: () => import('./pages/products-grid/products-grid'),
  },
  {
    path: 'product/:productId',
    loadComponent: () => import('./pages/view-product-detail/view-product-detail.component'),
  },
  { path: 'wishlist', loadComponent: () => import('./pages/my-wishlist/my-wishlist') },
  { path: 'checkout', loadComponent: () => import('./pages/checkout/checkout.component') },
  {
    path: 'order-success',
    loadComponent: () => import('./pages/order-success/order-success.component'),
  },
  { path: 'cart', loadComponent: () => import('./pages/view-cart/view-cart.component') },
];
```

### 3.2 Root Component (App)

```typescript
@Component({
  selector: 'app-root',
  template: `
    <app-header />
    <div class="h-[calc(100%-64px)] overflow-auto">
      <router-outlet />
    </div>
  `,
})
export class App {}
```

**Cấu trúc**:

- `<app-header/>`: Header cố định ở trên cùng
- `<router-outlet/>`: Nơi render các page components

---

## 4. CÁC CHỨC NĂNG CHÍNH

### 4.1 CHỨC NĂNG TÌM KIẾM SẢN PHẨM

#### Components tham gia:

1. **SearchBarComponent** (`search-bar.component.ts`)
2. **EcommerceStore** (state management)
3. **ProductsGrid** (hiển thị kết quả)

#### Luồng hoạt động:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER nhập từ khóa vào SearchBarComponent                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. onInput() được trigger                                       │
│    - Cập nhật searchQuery signal                                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Effect trong constructor chạy với debounce 300ms             │
│    - Chờ user ngừng gõ                                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Gọi store.setSearchQuery(trimmedQuery)                       │
│    - Update state trong EcommerceStore                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Computed signal 'filteredProducts' tự động tính lại          │
│    - Lọc products theo searchQuery                              │
│    - Lọc theo category hiện tại                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. ProductsGrid tự động re-render                               │
│    - Hiển thị danh sách sản phẩm đã lọc                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Chi tiết code:

**SearchBarComponent**:

```typescript
export class SearchBarComponent {
  store = inject(EcommerceStore);
  router = inject(Router);
  searchQuery = signal('');

  constructor() {
    effect(() => {
      const query = this.searchQuery();

      // Debounce 300ms
      this.debounceTimer = setTimeout(() => {
        const trimmedQuery = query.trim();
        this.store.setSearchQuery(trimmedQuery); // ← Cập nhật store

        // Navigate đến products page nếu đang ở trang khác
        if (trimmedQuery && !this.router.url.includes('/products')) {
          this.router.navigate(['/products/all']);
        }
      }, 300);
    });
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value); // ← Trigger effect
  }
}
```

**EcommerceStore - setSearchQuery**:

```typescript
setSearchQuery: signalMethod<string>((searchQuery: string) => {
  patchState(store, { searchQuery });  // ← Update state
}),
```

**Computed filteredProducts**:

```typescript
filteredProducts: computed(() => {
  let filtered = products();

  // Filter by category
  if (category() !== 'all') {
    filtered = filtered.filter(p => p.category === category().toLowerCase());
  }

  // Filter by search query
  const query = searchQuery().toLowerCase().trim();
  if (query) {
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query)
    );
  }

  return filtered;
}),
```

---

### 4.2 CHỨC NĂNG THÊM VÀO WISHLIST

#### Components tham gia:

1. **ToggleWishlistButtonComponent**
2. **EcommerceStore**
3. **ToasterService**

#### Luồng hoạt động:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER click vào nút wishlist (icon trái tim)                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. toggleWishlist(product) được gọi                             │
│    - Kiểm tra isInWishlist()                                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ Đã có trong      │                  │ Chưa có trong    │
│ wishlist         │                  │ wishlist         │
└──────────────────┘                  └──────────────────┘
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ Gọi              │                  │ Gọi              │
│ removeFromWishlist│                 │ addToWishlish    │
└──────────────────┘                  └──────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. EcommerceStore cập nhật wishlistItems                        │
│    - Sử dụng Immer để immutable update                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. withStorageSync tự động lưu vào localStorage                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. ToasterService hiển thị thông báo                            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. UI tự động update                                            │
│    - Icon đổi màu (đỏ/xám)                                      │
│    - Badge count trên header cập nhật                           │
└─────────────────────────────────────────────────────────────────┘
```

#### Chi tiết code:

**ToggleWishlistButtonComponent**:

```typescript
export class ToggleWishlistButtonComponent {
  product = input.required<Product>();
  store = inject(EcommerceStore);

  // Computed signal kiểm tra sản phẩm có trong wishlist không
  isInWishlist = computed(() => this.store.wishlistItems().find((p) => p.id === this.product().id));

  toggleWishlist(product: Product) {
    if (this.isInWishlist()) {
      this.store.removeFromWishlist(product); // ← Xóa khỏi wishlist
    } else {
      this.store.addToWishlish(product); // ← Thêm vào wishlist
    }
  }
}
```

**Template**:

```html
<button
  [class]="isInWishlist() ? '!text-red-500': '!text-gray-400'"
  matIconButton
  (click)="toggleWishlist(product())"
>
  <mat-icon> {{isInWishlist() ? 'favorite' : 'favorite_borde'}} <r/mat-icon>
</button>
```

**EcommerceStore - addToWishlish**:

```typescript
addToWishlish(product: Product) {
  const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
    // Chỉ thêm nếu chưa có trong wishlist
    if (!draft.find(p => p.id === product.id)) {
      draft.push(product);
    }
  });

  patchState(store, { wishlistItems: updatedWishlistItems });
  toaster.success('Product added to wishlish');
},
```

**EcommerceStore - removeFromWishlist**:

```typescript
removeFromWishlist: (product: Product) => {
  patchState(store, {
    wishlistItems: store.wishlistItems().filter(p => p.id !== product.id),
  });
  toaster.success('Product removed from wishlist');
},


```

---

### 4.3 CHỨC NĂNG THÊM VÀO GIỎ HÀNG

#### Components tham gia:

1. **ProductCartComponent** (từ grid)
2. **ProductInfoComponent** (từ detail page)
3. **EcommerceStore**
4. **ToasterService**

#### Luồng hoạt động:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER click "Add to Cart" button                             │
│    - Từ ProductCartComponent (grid): quantity = 1              │
│    - Từ ProductInfoComponent (detail): quantity do user chọn   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Gọi store.addToCart(product, quantity)                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. Kiểm tra sản phẩm đã có trong cart chưa                      │
│    const existingItemIndex = cartItems().findIndex(...)         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ Đã có trong cart │                  │ Chưa có trong    │
│                  │                  │ cart             │
└──────────────────┘                  └──────────────────┘
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ Tăng quantity    │                  │ Thêm item mới    │
│ của item hiện có │                  │ vào cart         │
└──────────────────┘                  └──────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Xóa sản phẩm khỏi wishlist (nếu có)                          │
│    updatedWishlistItems = wishlistItems().filter(...)           │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Update state với cartItems và wishlistItems mới              │
│    patchState(store, { cartItems, wishlistItems })              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. withStorageSync tự động lưu vào localStorage                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. ToasterService hiển thị thông báo                            │
│    - "Product quantity increased" (nếu đã có)                   │
│    - "Product moved to cart" (nếu mới thêm)                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. UI tự động update                                            │
│    - Badge count trên cart icon tăng                            │
│    - Wishlist count giảm (nếu có)                               │
└─────────────────────────────────────────────────────────────────┘
```

#### Chi tiết code:

**ProductCartComponent** (từ grid):

```typescript
<button
  matButton="filled"
  class="flex items-center gap-2"
  (click)="$event.stopPropagation(); store.addToCart(product(), 1)"
>
  <mat-icon>shopping_cart</mat-icon>
  Add to cart
</button>
```

**ProductInfoComponent** (từ detail page):

```typescript
export class ProductInfoComponent {
  product = input.required<Product>();
  quantity = signal(1);  // User có thể chọn quantity
  store = inject(EcommerceStore);
}

// Template:
<button
  matButton="filled"
  (click)="store.addToCart(product(), quantity())"
  [disabled]="!product().inStock"
>
  <mat-icon>shopping_cart</mat-icon>
  {{ product().inStock ? 'Add to Cart' : 'Out of Stock' }}
</button>
```

**EcommerceStore - addToCart**:

```typescript
addToCart: (product: Product, quantity = 1) => {
  const existingItemIndex = store.cartItems().findIndex(i => i.product.id === product.id);

  // Sử dụng Immer để update immutably
  const updatedCartItems = produce(store.cartItems(), (draft) => {
    if (existingItemIndex !== -1) {
      // Tăng quantity nếu đã có
      draft[existingItemIndex].quantity += quantity;
      return;
    }
    // Thêm item mới
    draft.push({
      product,
      quantity,
    });
  });

  // Xóa khỏi wishlist
  const updatedWishlistItems = store.wishlistItems().filter(p => p.id !== product.id);

  patchState(store, {
    cartItems: updatedCartItems,
    wishlistItems: updatedWishlistItems,
  });

  toaster.success(
    existingItemIndex !== -1 ? 'Product quantity increased' : 'Product moved to cart'
  );
},
```

---

### 4.4 CHỨC NĂNG XEM CHI TIẾT SẢN PHẨM

#### Components tham gia:

1. **ProductCartComponent** (trigger navigation)
2. **ViewProductDetailComponent** (page)
3. **ProductInfoComponent** (thông tin sản phẩm)
4. **ViewReviewsComponent** (reviews)
5. **EcommerceStore**

#### Luồng hoạt động:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER click vào ProductCartComponent                         │
│    - Click vào image hoặc product info area                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. Router navigate đến /product/:productId                      │
│    [routerLink]="['/product', product().id]"                    │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ViewProductDetailComponent được load                         │
│    - Nhận productId từ route params                             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. Constructor gọi store.setProductId(productId)                │
│    - Update selectedProductId trong state                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Computed signal 'selectedProduct' tự động tính toán          │
│    selectedProduct = products().find(p => p.id === selectedProductId())│
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. Template render với @if(store.selectedProduct(); as product) │
└─────────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ ProductInfo      │                  │ ViewReviews      │
│ Component        │                  │ Component        │
└──────────────────┘                  └──────────────────┘
        │                                       │
        ▼                                       ▼
┌──────────────────┐                  ┌──────────────────┐
│ - Hiển thị       │                  │ - Hiển thị       │
│   thông tin SP   │                  │   rating summary │
│ - Stock status   │                  │ - List reviews   │
│ - Add to cart    │                  │ - Write review   │
│ - Add to wishlist│                  │   form           │
└──────────────────┘                  └──────────────────┘
```

#### Chi tiết code:

**ViewProductDetailComponent**:

```typescript
export default class ViewProductDetailComponent {
  productId = input.required<string>();  // ← Nhận từ route params
  store = inject(EcommerceStore);

  constructor() {
    this.store.setProductId(this.productId);  // ← Update state
  }

  backRoute = computed(() => `/products/${this.store.category()}`);
}

// Template:
@if(store.selectedProduct(); as product) {
  <div class="flex gap-8 mb-8">
    <img [src]="product.imageUrl" class="w-[500px] h-[550px]" />
    <div class="flex-1">
      <app-product-info [product]="product"></app-product-info>
    </div>
  </div>
  <app-view-reviews [product]="product"></app-view-reviews>
}
```

**EcommerceStore - setProductId**:

```typescript
setProductId: signalMethod<string>((productId: string) => {
  patchState(store, { selectedProductId: productId });
}),
```

**Computed selectedProduct**:

```typescript
selectedProduct: computed(() =>
  products().find(p => p.id === selectedProductId())
),
```

---

### 4.7 CHỨC NĂNG QUẢN LÝ GIỎ HÀNG

#### Components tham gia:

1. **ViewCartComponent**
2. **ListCartItemsComponent**
3. **TeaseWishlist**
4. **SummarizeOrder**
5. **QtySelector**
6. **EcommerceStore**

#### Các thao tác trong giỏ hàng:

##### 4.7.1 Thay đổi số lượng sản phẩm

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER click + hoặc - trong QtySelector                       │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. QtySelector emit qtyUpdate event với quantity mới            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. ListCartItemsComponent nhận event                            │
│    (qtyUpdate)="store.setItemQuantity({productId, quantity})"   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EcommerceStore.setItemQuantity() xử lý                       │
│    - Tìm item trong cartItems                                   │
│    - Update quantity với Immer                                  │
│    - patchState với cartItems mới                               │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. UI tự động update                                            │
│    - Số lượng hiển thị thay đổi                                 │
│    - Tổng tiền tự động tính lại (computed)                      │
│    - Cart count badge cập nhật                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Code**:

```typescript
setItemQuantity(params: { productId: string; quantity: number }) {
  const cartItems = store.cartItems();
  const index = cartItems.findIndex(i => i.product.id === params.productId);

  if (index === -1 || params.quantity < 0) return;

  const updated = produce(cartItems, (draft) => {
    draft[index].quantity = params.quantity;
  });

  patchState(store, { cartItems: updated });
},
```

##### 4.7.2 Xóa sản phẩm khỏi giỏ hàng

```typescript
removeFromCart: (product: Product) => {
  patchState(store, {
    cartItems: store.cartItems().filter(p => p.product.id !== product.id),
  });
},
```

##### 4.7.3 Chuyển sản phẩm sang wishlist

```typescript
moveToWishlist: (product: Product) => {
  const updatedCartItems = store.cartItems().filter(p => p.product.id !== product.id);

  const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
    if (!draft.find(i => i.id === product.id)) {
      draft.push(product);
    }
  });

  patchState(store, {
    cartItems: updatedCartItems,
    wishlistItems: updatedWishlistItems
  });
},
```

---

## 5. SƠ ĐỒ LUỒNG DỮ LIỆU

### 5.1 Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Header   │  │ Products │  │ Product  │  │ Cart     │       │
│  │          │  │ Grid     │  │ Detail   │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                    ECOMMERCE SIGNAL STORE                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ State:                                                    │  │
│  │  - products, category, searchQuery                       │  │
│  │  - wishlistItems, cartItems                              │  │
│  │  - user, selectedProductId                               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Computed Signals:                                        │  │
│  │  - filteredProducts, wishlistCount                       │  │
│  │  - cartCount, selectedProduct                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Methods:                                                 │  │
│  │  - addToCart, addToWishlish                              │  │
│  │  - submitReview, placeOrder                              │  │
│  │  - signIn, signUp, signOut                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────────┐
│                      LOCAL STORAGE                              │
│  (withStorageSync - auto persist)                               │
│  - wishlistItems                                                │
│  - cartItems                                                    │
│  - user                                                         │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Component Communication Pattern

Dự án sử dụng **Centralized State Management** với Signal Store:

```
Component A ──────┐
                  │
Component B ──────┼────► EcommerceStore ◄──── Component C
                  │           │
Component D ──────┘           │
                              ↓
                        Local Storage
```

**Đặc điểm**:

- Tất cả components đều inject `EcommerceStore`
- Không có direct communication giữa các components
- State changes tự động trigger UI updates qua signals
- Persistence tự động với `withStorageSync`

---

## 6. TỔNG KẾT CÁC PATTERN VÀ BEST PRACTICES

### 6.1 Signal Store Pattern

- **Single source of truth**: Tất cả state tập trung tại `EcommerceStore`
- **Computed signals**: Tự động tính toán derived state
- **Immutable updates**: Sử dụng Immer để update state
- **Persistence**: Auto-sync với localStorage

### 6.2 Component Pattern

- **Standalone components**: Tất cả components đều standalone
- **Input/Output signals**: Sử dụng `input()` và `output()` signals
- **Smart/Dumb components**:
  - Smart: Pages (inject store, có logic)
  - Dumb: Shared components (nhận props, emit events)

### 6.3 Routing Pattern

- **Lazy loading**: Tất cả routes đều lazy load
- **Route params**: Sử dụng `input()` để nhận route params
- **Navigation guards**: Kiểm tra authentication trước khi navigate

### 6.4 User Experience

- **Optimistic updates**: UI update ngay lập tức
- **Loading states**: Hiển thị loading khi xử lý async
- **Toast notifications**: Feedback cho mọi action
- **View transitions**: Smooth animations giữa các pages

---

## 7. FLOW CHARTS CHI TIẾT

### 7.1 Authentication Flow

```
START
  │
  ▼
User clicks "Sign In/Sign Up"
  │
  ▼
Open Dialog
  │
  ├─────────────┬─────────────┐
  │             │             │
  ▼             ▼             ▼
Sign In     Sign Up      Cancel
  │             │             │
  ▼             ▼             │
Validate    Create User       │
  │             │             │
  ├─Success─────┤             │
  │             │             │
  ▼             ▼             ▼
Update store.user()        Close Dialog
  │
  ▼
Save to localStorage
  │
  ▼
Close Dialog
  │
  ▼
Navigate to checkout? (if from checkout flow)
  │
  ▼
END
```

### 7.2 Add to Cart Flow

```
START
  │
  ▼
User clicks "Add to Cart"
  │
  ▼
Check if product exists in cart
  │
  ├─────────────┬─────────────┐
  │             │             │
  ▼             ▼             ▼
Exists      Not Exists    Out of Stock
  │             │             │
  ▼             ▼             │
Increase    Add new item      │
quantity                      │
  │             │             │
  └─────────────┴─────────────┘
                │
                ▼
Remove from wishlist (if exists)
                │
                ▼
Update cartItems state
                │
                ▼
Save to localStorage (auto)
                │
                ▼
Show toast notification
                │
                ▼
Update UI (badge counts)
                │
                ▼
END
```

### 7.3 Search Flow

```
START
  │
  ▼
User types in search bar
  │
  ▼
Update local searchQuery signal
  │
  ▼
Effect triggers (debounce 300ms)
  │
  ▼
Update store.searchQuery
  │
  ▼
Computed 'filteredProducts' recalculates
  │
  ├─ Filter by category
  └─ Filter by search query
  │
  ▼
Navigate to /products/all (if not there)
  │
  ▼
ProductsGrid re-renders with filtered products
  │
  ▼
END
```

---

## 8. KẾT LUẬN

Dự án E-commerce Store này được xây dựng với kiến trúc hiện đại và best practices:

### Điểm mạnh:

✅ **State Management mạnh mẽ**: Signal Store cung cấp reactive state với performance tốt  
✅ **Type Safety**: TypeScript đảm bảo type safety toàn bộ dự án  
✅ **Immutable Updates**: Immer giúp code clean và tránh bugs  
✅ **Persistence**: Auto-sync với localStorage  
✅ **Component Reusability**: Shared components được tái sử dụng nhiều nơi  
✅ **User Experience**: Smooth transitions, loading states, toast notifications  
✅ **Lazy Loading**: Tối ưu performance với route-level code splitting

### Luồng dữ liệu:

```
User Action → Component → Store Method → State Update →
Computed Signals → UI Auto-Update → localStorage Sync
```

Mọi thay đổi đều được quản lý tập trung, dễ debug, dễ maintain, và dễ mở rộng.
