# CHI TIẾT CÁC CHỨC NĂNG SẢN PHẨM - ECOMMERCE STORE

## 📋 MỤC LỤC

1. [Hiển thị danh sách sản phẩm](#1-hiển-thị-danh-sách-sản-phẩm)
2. [Phân loại theo Category](#2-phân-loại-theo-category)
3. [Quản lý Wishlist](#3-quản-lý-wishlist)
4. [Quản lý Cart (Giỏ hàng)](#4-quản-lý-cart-giỏ-hàng)
5. [Luồng hoạt động tổng hợp](#5-luồng-hoạt-động-tổng-hợp)

---

## 1. HIỂN THỊ DANH SÁCH SẢN PHẨM

### 1.1 Cấu trúc dữ liệu sản phẩm

#### **Model: Product** (`models/products.ts`)

```typescript
export type Product = {
  id: string; // Unique identifier (vd: 'p1', 'p2')
  name: string; // Tên sản phẩm
  description: string; // Mô tả chi tiết
  price: number; // Giá (USD)
  imageUrl: string; // URL hình ảnh
  inStock: boolean; // Còn hàng hay không
  category: string; // Danh mục (electronics, fashion, etc.)
  reviews: UserReview[]; // Danh sách đánh giá
};
```

#### **Dữ liệu mẫu trong Store**

```typescript
// ecommerce.ts - withState
products: [
  {
    id: 'p1',
    name: 'Wireless Noise-Canceling Headphones',
    description: 'Trải nghiệm âm thanh đỉnh cao với công nghệ chống ồn...',
    price: 299.99,
    imageUrl: 'https://images.unsplash.com/photo-...',
    inStock: true,
    category: 'electronics',
    reviews: [...]
  },
  // ... 19 sản phẩm khác
]
```

**📊 Tổng số sản phẩm:** 20 sản phẩm

**📂 Categories có sẵn:**

- `all` - Tất cả
- `electronics` - Điện tử
- `photography` - Nhiếp ảnh
- `furniture` - Nội thất
- `fashion` - Thời trang
- `kitchen` - Nhà bếp
- `home` - Gia dụng
- `accessories` - Phụ kiện
- `footwear` - Giày dép
- `fitness` - Thể thao

---

### 1.2 Component hiển thị sản phẩm

#### **ProductCartComponent** (`components/product-cart/product-cart.component.ts`)

**Chức năng:** Hiển thị thông tin sản phẩm dưới dạng card

**Template Structure:**

```
┌─────────────────────────────────┐
│         [Wishlist ❤️]          │  ← ng-content slot
│  ┌─────────────────────────┐   │
│  │                         │   │
│  │      Product Image      │   │  ← Clickable → navigate to detail
│  │       (300px height)    │   │
│  │                         │   │
│  └─────────────────────────┘   │
│                                 │
│  Product Name (h3)              │  ← Clickable → navigate to detail
│  Description (truncated)        │
│  ⭐⭐⭐⭐⭐ (5.0) - 6 reviews     │  ← Star rating component
│  In Stock / Out of stock        │
│                                 │
│  $299.99    [🛒 Add to cart]   │  ← Price & Action button
└─────────────────────────────────┘
```

**Code chi tiết:**

```typescript
@Component({
  selector: 'app-product-cart',
  template: `
    <div class="relative bg-white cursor-pointer rounded-xl shadow-lg
                overflow-hidden flex flex-col h-full
                transition-all duration-200 ease-out
                hover:-translate-y-1 hover:shadow-xl">

      <!-- Product Image -->
      <img
        [src]="product().imageUrl"
        class="w-full h-[300px] object-cover rounded-t-xl"
        [routerLink]="['/product', product().id]"
        [style.view-transition-name]="'product-image-' + product().id"
      />

      <!-- Slot for wishlist button (ng-content) -->
      <ng-content></ng-content>

      <!-- Product Info -->
      <div class="p-5 flex flex-col flex-1"
           [routerLink]="['/product', product().id]">

        <!-- Product Name -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2 leading-tight">
          {{ product().name }}
        </h3>

        <!-- Description -->
        <p class="text-sm text-gray-600 mb-4 flex-1 leading-relaxed">
          {{ product().description }}
        </p>

        <!-- Star Rating -->
        <app-star-rating [rating]="averageRating()" class="mb-3">
          {{ totalReviews() }}
        </app-star-rating>

        <!-- Stock Status -->
        <div class="text-sm font-medium mb-4">
          {{ product().inStock ? 'In Stock' : 'Out of stock' }}
        </div>

        <!-- Price & Add to Cart -->
        <div class="flex items-center justify-between mt-auto">
          <span class="text-2xl font-bold text-gray-900">
            ${{ product().price }}
          </span>

          <button
            matButton="filled"
            class="flex items-center gap-2"
            (click)="$event.stopPropagation(); store.addToCart(product(), 1)"
          >
            <mat-icon>shopping_cart</mat-icon>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  `
})
export class ProductCartComponent {
  product = input.required<Product>();
  store = inject(EcommerceStore);

  // Computed: Tổng số reviews
  totalReviews = computed(() => this.product().reviews.length);

  // Computed: Tính rating trung bình
  averageRating = computed(() => {
    const reviews = this.product().reviews;
    if (reviews.length === 0) return 0;

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  });
}
```

**🔑 Điểm quan trọng:**

1. **`<ng-content>`**: Cho phép parent component inject nội dung (wishlist button)
2. **`$event.stopPropagation()`**: Ngăn event bubble lên parent khi click "Add to cart"
3. **`view-transition-name`**: Tạo smooth animation khi navigate
4. **Computed signals**: Tự động tính toán rating và số reviews
5. **Responsive hover**: Card nâng lên khi hover

---

### 1.3 Page hiển thị danh sách

#### **ProductsGridComponent** (`pages/products-grid/products-grid.ts`)

**Route:** `/products/:category`

**Layout:**

```
┌──────────────┬────────────────────────────────────────────┐
│ SIDEBAR      │  MAIN CONTENT                              │
│              │                                            │
│ Categories   │  Electronics (12 products found)          │
│ ┌──────────┐ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ All      │ │  │  P1  │ │  P2  │ │  P3  │ │  P4  │    │
│ │Electronics│ │  │ [❤️] │ │ [❤️] │ │ [❤️] │ │ [❤️] │    │
│ │Photography│ │  └──────┘ └──────┘ └──────┘ └──────┘    │
│ │ Furniture│ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│ │ Fashion  │ │  │  P5  │ │  P6  │ │  P7  │ │  P8  │    │
│ │ Kitchen  │ │  │ [❤️] │ │ [❤️] │ │ [❤️] │ │ [❤️] │    │
│ │ Home     │ │  └──────┘ └──────┘ └──────┘ └──────┘    │
│ │Accessories│ │                                          │
│ │ Footwear │ │                                          │
│ │ Fitness  │ │                                          │
│ └──────────┘ │                                          │
└──────────────┴────────────────────────────────────────────┘
```

**Code:**

```typescript
@Component({
  selector: 'app-products-grid',
  template: `
    <mat-sidenav-container class="h-full">
      <!-- SIDEBAR: Categories -->
      <mat-sidenav mode="side" [opened]="store.isSidebarOpen()">
        <div class="p-6">
          <h2 class="text-lg text-gray-900">Categories</h2>
          <mat-nav-list>
            @for(cat of categories(); track cat){
            <mat-list-item
              [activated]="cat === category()"
              class="my-2"
              [routerLink]="['/products', cat]"
            >
              <span
                matListItemTitle
                class="font-medium"
                [class]="cat === category() ? '!text-white' : null"
              >
                {{ cat | titlecase }}
              </span>
            </mat-list-item>
            }
          </mat-nav-list>
        </div>
      </mat-sidenav>

      <!-- MAIN CONTENT: Product Grid -->
      <mat-sidenav-content class="bg-gray-100 p-6 h-full">
        <h1 class="text-2xl font-bold text-gray-900 mb-1">
          {{ category() | titlecase }}
        </h1>
        <p class="text-base text-gray-600 mb-6">
          {{ store.filteredProducts().length }}
          {{ store.filteredProducts().length <= 1 ? 'product' : 'products' }} found
        </p>

        <!-- Responsive Grid -->
        <div class="responsive-grid">
          @for (product of store.filteredProducts(); track product.id ) {
          <div [style.view-transition-name]="'product-item-' + product.id">
            <app-product-cart [product]="product">
              <!-- Wishlist button injected via ng-content -->
              <app-toggle-wishlist-button
                [style.view-transition-name]="'wishlist-button-' + product.id"
                class="!absolute z-10 top-3 right-3 
                         !bg-white shadow-md rounded-full 
                         transition-all duration-300 
                         hover:scale-110 hover:shadow-lg"
                [product]="product"
              />
            </app-product-cart>
          </div>
          }
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
})
export default class ProductsGrid {
  category = input<string>('all'); // Route param
  store = inject(EcommerceStore);

  categories = signal<string[]>([
    'all',
    'electronics',
    'photography',
    'furniture',
    'fashion',
    'kitchen',
    'home',
    'accessories',
    'lifestyle',
  ]);

  constructor() {
    // Set category khi component khởi tạo
    this.store.setCategory(this.category);
  }
}
```

**🎨 CSS: Responsive Grid**

```css
.responsive-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}
```

---

## 2. PHÂN LOẠI THEO CATEGORY

### 2.1 Luồng hoạt động Category Filter

```
User click category "Electronics"
    ↓
Router navigate to /products/electronics
    ↓
ProductsGrid component khởi tạo
    ↓
constructor() → store.setCategory('electronics')
    ↓
State: category = 'electronics'
    ↓
Computed signal: filteredProducts() được trigger
    ↓
Filter logic thực thi
    ↓
UI tự động re-render với sản phẩm đã filter
```

### 2.2 Filter Logic trong Store

#### **Method: setCategory** (`ecommerce.ts`)

```typescript
withMethods((store) => ({
  setCategory: signalMethod<string>((category: string) => {
    patchState(store, { category });
  }),
}));
```

**Giải thích:**

- `signalMethod`: Tạo method có thể nhận signal làm input
- `patchState`: Update state immutably
- Khi `category` thay đổi → `filteredProducts` tự động tính lại

---

#### **Computed: filteredProducts** (`ecommerce.ts`)

```typescript
withComputed(({ category, products, searchQuery }) => ({
  filteredProducts: computed(() => {
    let filtered = products(); // Lấy toàn bộ sản phẩm

    // ===== FILTER BY CATEGORY =====
    if (category() !== 'all') {
      filtered = filtered.filter((p) => p.category === category().toLowerCase());
    }

    // ===== FILTER BY SEARCH QUERY =====
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
}));
```

**🔍 Filter Flow:**

```
products (20 items)
    ↓
Filter by category (nếu !== 'all')
    ↓
Filter by searchQuery (nếu có)
    ↓
filteredProducts (kết quả cuối cùng)
```

**Ví dụ:**

```typescript
// Case 1: Category = 'electronics', searchQuery = ''
// → Trả về tất cả sản phẩm có category = 'electronics'

// Case 2: Category = 'all', searchQuery = 'headphone'
// → Trả về tất cả sản phẩm có 'headphone' trong name/description/category

// Case 3: Category = 'electronics', searchQuery = 'wireless'
// → Trả về sản phẩm electronics VÀ có 'wireless' trong name/description
```

---

### 2.3 Sidebar Categories Navigation

**Template:**

```html
<mat-nav-list>
  @for(cat of categories(); track cat){
  <mat-list-item [activated]="cat === category()" [routerLink]="['/products', cat]">
    <span [class]="cat === category() ? '!text-white' : null"> {{ cat | titlecase }} </span>
  </mat-list-item>
  }
</mat-nav-list>
```

**Behavior:**

- `[activated]`: Highlight category hiện tại (background màu primary)
- `[routerLink]`: Navigate to `/products/{category}`
- `titlecase` pipe: Chuyển 'electronics' → 'Electronics'

---

### 2.4 Toggle Sidebar

**Button trong Header:**

```typescript
<button matIconButton (click)="store.toggleSidebar()">
  <mat-icon>menu</mat-icon>
</button>
```

**Method trong Store:**

```typescript
toggleSidebar: () => {
  patchState(store, { isSidebarOpen: !store.isSidebarOpen() });
};
```

**Sidebar state:**

```typescript
<mat-sidenav mode="side" [opened]="store.isSidebarOpen()">
```

---

## 3. QUẢN LÝ WISHLIST

### 3.1 Toggle Wishlist Button Component

#### **ToggleWishlistButtonComponent** (`components/toggle-wishlist-button/toggle-wishlist-button.component.ts`)

**Chức năng:** Thêm/xóa sản phẩm khỏi wishlist

**Template:**

```html
<button
  [class]="isInWishlist() ? '!text-red-500' : '!text-gray-400'"
  matIconButton
  (click)="toggleWishlist(product())"
>
  <mat-icon> {{ isInWishlist() ? 'favorite' : 'favorite_border' }} </mat-icon>
</button>
```

**Logic:**

```typescript
export class ToggleWishlistButtonComponent {
  product = input.required<Product>();
  store = inject(EcommerceStore);

  // Computed: Check nếu sản phẩm đã có trong wishlist
  isInWishlist = computed(() => this.store.wishlistItems().find((p) => p.id === this.product().id));

  toggleWishlist(product: Product) {
    if (this.isInWishlist()) {
      this.store.removeFromWishlist(product);
    } else {
      this.store.addToWishlish(product);
    }
  }
}
```

**🎨 Visual States:**

```
Not in wishlist:  ♡ (favorite_border, gray)
In wishlist:      ♥ (favorite, red)
```

---

### 3.2 Thêm vào Wishlist

#### **Method: addToWishlish** (`ecommerce.ts`)

```typescript
addToWishlish(product: Product) {
  // Sử dụng Immer để immutable update
  const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
    // Kiểm tra sản phẩm đã tồn tại chưa
    if (!draft.find((p) => p.id === product.id)) {
      draft.push(product);  // Thêm vào cuối mảng
    }
  });

  // Update state
  patchState(store, { wishlistItems: updatedWishlistItems });

  // Hiển thị toast notification
  toaster.success('Product added to wishlist');
}
```

**Flow:**

```
User click ♡ button
    ↓
toggleWishlist(product)
    ↓
isInWishlist() = false
    ↓
store.addToWishlish(product)
    ↓
produce() tạo bản copy mới của wishlistItems
    ↓
Thêm product vào draft (nếu chưa có)
    ↓
patchState() update store
    ↓
wishlistItems signal emit giá trị mới
    ↓
UI tự động re-render:
  - Button đổi thành ♥ (red)
  - Badge ở header tăng lên
  - Toast notification hiển thị
```

---

### 3.3 Xóa khỏi Wishlist

#### **Method: removeFromWishlist** (`ecommerce.ts`)

```typescript
removeFromWishlist: (product: Product) => {
  patchState(store, {
    wishlistItems: store.wishlistItems().filter((p) => p.id !== product.id),
  });
  toaster.success('Product removed from wishlist');
};
```

**Flow:**

```
User click ♥ button (hoặc delete button trong wishlist page)
    ↓
toggleWishlist(product) / removeFromWishlist(product)
    ↓
Filter ra sản phẩm có id khác với product.id
    ↓
patchState() update store
    ↓
UI tự động re-render:
  - Button đổi thành ♡ (gray)
  - Badge ở header giảm xuống
  - Sản phẩm biến mất khỏi wishlist page
```

---

### 3.4 Wishlist Page

#### **MyWishlistComponent** (`pages/my-wishlist/my-wishlist.ts`)

**Route:** `/wishlist`

**Layout:**

```
┌─ Continue Shopping ────────────────────────────┐
│  My wishlist                    12 items        │
│                                                 │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │  P1  │ │  P2  │ │  P3  │ │  P4  │          │
│  │ [🗑️] │ │ [🗑️] │ │ [🗑️] │ │ [🗑️] │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│  │  P5  │ │  P6  │ │  P7  │ │  P8  │          │
│  │ [🗑️] │ │ [🗑️] │ │ [🗑️] │ │ [🗑️] │          │
│  └──────┘ └──────┘ └──────┘ └──────┘          │
└─────────────────────────────────────────────────┘
```

**Template:**

```html
<div class="mx-auto max-w-[1200px] py-6 px-4">
  <app-back-button class="mb-6" navigateTo="/products/all"> Continue Shopping </app-back-button>

  @if(store.wishlistCount() > 0) {
  <!-- Header -->
  <div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-bold">My wishlist</h1>
    <span class="text-gray-500 text-xl"> {{ store.wishlistCount() }} items </span>
  </div>

  <!-- Product Grid -->
  <div class="responsive-grid">
    @for(product of store.wishlistItems(); track product.id) {
    <app-product-cart [product]="product">
      <!-- Delete button (injected via ng-content) -->
      <button
        class="!absolute z-10 top-3 right-3 w-10 h-10 
                   rounded-full !bg-white border-0 shadow-md 
                   flex items-center justify-center cursor-pointer 
                   transition-all duration-200 
                   hover:scale-110 hover:shadow-lg"
        matIconButton
        (click)="store.removeFromWishlist(product)"
      >
        <mat-icon>delete</mat-icon>
      </button>
    </app-product-cart>
    }
  </div>
  } @else {
  <app-empty-wishlist />
  }
</div>
```

**Computed: wishlistCount**

```typescript
wishlistCount: computed(() => wishlistItems().length);
```

---

### 3.5 Badge hiển thị số lượng Wishlist

**Header Actions:**

```html
<button
  matIconButton
  routerLink="/wishlist"
  [matBadge]="store.wishlistCount()"
  [matBadgeHidden]="store.wishlistCount() === 0"
>
  <mat-icon>favorite</mat-icon>
</button>
```

**Behavior:**

- Badge tự động hiển thị số lượng items
- Ẩn badge khi count = 0
- Click → navigate to `/wishlist`

---

## 4. QUẢN LÝ CART (GIỎ HÀNG)

### 4.1 Data Model

#### **CartItem** (`models/cart.ts`)

```typescript
export type CartItem = {
  product: Product; // Thông tin sản phẩm
  quantity: number; // Số lượng
};
```

**Ví dụ:**

```typescript
{
  product: {
    id: 'p1',
    name: 'Wireless Headphones',
    price: 299.99,
    // ...
  },
  quantity: 2
}
```

---

### 4.2 Thêm vào Cart

#### **Method: addToCart** (`ecommerce.ts`)

```typescript
addToCart: (product: Product, quantity = 1) => {
  // Tìm index của sản phẩm trong cart (nếu đã có)
  const existingItemIndex = store.cartItems().findIndex((i) => i.product.id === product.id);

  // Update cart items với Immer
  const updatedCartItems = produce(store.cartItems(), (draft) => {
    if (existingItemIndex !== -1) {
      // Sản phẩm đã có → Tăng số lượng
      draft[existingItemIndex].quantity += quantity;
      return;
    }
    // Sản phẩm chưa có → Thêm mới
    draft.push({
      product,
      quantity,
    });
  });

  // Xóa sản phẩm khỏi wishlist (nếu có)
  const updatedWishlistItems = store.wishlistItems().filter((p) => p.id !== product.id);

  // Update state
  patchState(store, {
    cartItems: updatedCartItems,
    wishlistItems: updatedWishlistItems,
  });

  // Toast notification
  toaster.success(
    existingItemIndex !== -1 ? 'Product quantity increased' : 'Product moved to cart'
  );
};
```

**🔑 Logic quan trọng:**

1. **Check existing item**: Tìm sản phẩm trong cart
2. **Increase quantity**: Nếu đã có → tăng số lượng
3. **Add new item**: Nếu chưa có → thêm mới với quantity
4. **Remove from wishlist**: Tự động xóa khỏi wishlist khi add to cart
5. **Immutable update**: Dùng Immer để đảm bảo immutability

---

#### **Flow: Add to Cart từ Product Card**

```
User click "Add to cart" button
    ↓
$event.stopPropagation() → Ngăn navigate to detail
    ↓
store.addToCart(product, 1)
    ↓
Check product đã có trong cart?
    ├─ Yes → Tăng quantity lên 1
    └─ No → Thêm mới với quantity = 1
    ↓
Xóa product khỏi wishlist (nếu có)
    ↓
patchState() update store
    ↓
UI tự động re-render:
  - Cart badge tăng lên
  - Wishlist badge giảm (nếu có)
  - Toast notification hiển thị
```

---

### 4.3 Hiển thị Cart Items

#### **ShowCartItemsComponent** (`pages/show-cart-items/show-cart-items.component.ts`)

**Layout:**

```
┌────────────────────────────────────────────────────────┐
│ [Image] Product Name          [- 2 +]      $599.98    │
│         $299.99                             [♡] [🗑️]  │
└────────────────────────────────────────────────────────┘
```

**Template:**

```html
<div class="grid grid-cols-[3fr_1fr_1fr]">
  <!-- Column 1: Product Info -->
  <div class="flex items-center gap-4">
    <img
      [src]="item().product.imageUrl"
      class="w-24 h-24 rounded-lg object-cover"
      [style.view-transition-name]="'product-image-' + item().product.id"
    />
    <div>
      <div class="text-gray-900 text-lg font-semibold">{{ item().product.name }}</div>
      <div class="text-gray-600 text-sm">${{ item().product.price }}</div>
    </div>
  </div>

  <!-- Column 2: Quantity Selector -->
  <app-qty-selector
    [quantity]="item().quantity"
    (qtyUpdate)="store.setItemQuantity({
      productId: item().product.id,
      quantity: $event
    })"
  />

  <!-- Column 3: Total & Actions -->
  <div class="flex flex-col items-end">
    <div class="text-right text-lg font-semibold">${{ total() }}</div>

    <div class="flex -me-3">
      <!-- Move to wishlist -->
      <button matIconButton (click)="store.moveToWishlist(item().product)">
        <mat-icon>favorite_border</mat-icon>
      </button>

      <!-- Remove from cart -->
      <button matIconButton class="danger" (click)="store.removeFromCart(item().product)">
        <mat-icon>delete</mat-icon>
      </button>
    </div>
  </div>
</div>
```

**Component Logic:**

```typescript
export class ShowCartItemsComponent {
  item = input.required<CartItem>();
  store = inject(EcommerceStore);

  // Computed: Tính tổng tiền cho item này
  total = computed(() => (this.item().product.price * this.item().quantity).toFixed(2));
}
```

---

### 4.4 Quantity Selector Component

#### **QtySelector** (`components/qty-selector/qty-selector.ts`)

**Template:**

```html
<div class="flex items-center gap-3">
  <div class="inline-flex items-center">
    <!-- Decrease button -->
    <button matIconButton [disabled]="quantity() === 1" (click)="qtyUpdate.emit(quantity() - 1)">
      <mat-icon>remove</mat-icon>
    </button>

    <!-- Current quantity -->
    <div class="px-3">{{ quantity() }}</div>

    <!-- Increase button -->
    <button matIconButton (click)="qtyUpdate.emit(quantity() + 1)">
      <mat-icon>add</mat-icon>
    </button>
  </div>
</div>
```

**Component:**

```typescript
export class QtySelector {
  quantity = input(0); // Input: Số lượng hiện tại
  qtyUpdate = output<number>(); // Output: Emit số lượng mới
}
```

**Usage:**

```html
<app-qty-selector
  [quantity]="item().quantity"
  (qtyUpdate)="store.setItemQuantity({productId: item().product.id, quantity: $event})"
/>
```

---

### 4.5 Cập nhật số lượng

#### **Method: setItemQuantity** (`ecommerce.ts`)

```typescript
setItemQuantity(params: { productId: string; quantity: number }) {
  const cartItems = store.cartItems();
  const index = cartItems.findIndex(i => i.product.id === params.productId);

  // Guard clause: Không tìm thấy hoặc quantity không hợp lệ
  if (index === -1 || params.quantity < 0) return;

  // Update với Immer
  const updated = produce(cartItems, (draft) => {
    draft[index].quantity = params.quantity;
  });

  patchState(store, { cartItems: updated });
}
```

**Flow:**

```
User click [+] button
    ↓
qtyUpdate.emit(quantity + 1)
    ↓
store.setItemQuantity({ productId, quantity: newQty })
    ↓
Tìm item trong cart
    ↓
Update quantity
    ↓
patchState() update store
    ↓
UI tự động re-render:
  - Quantity hiển thị số mới
  - Total price cập nhật
  - Cart badge cập nhật
```

---

### 4.6 Xóa khỏi Cart

#### **Method: removeFromCart** (`ecommerce.ts`)

```typescript
removeFromCart: (product: Product) => {
  patchState(store, {
    cartItems: store.cartItems().filter((p) => p.product.id !== product.id),
  });
};
```

---

### 4.7 Chuyển từ Cart sang Wishlist

#### **Method: moveToWishlist** (`ecommerce.ts`)

```typescript
moveToWishlist: (product: Product) => {
  // Xóa khỏi cart
  const updatedCartItems = store.cartItems().filter((p) => p.product.id !== product.id);

  // Thêm vào wishlist (nếu chưa có)
  const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
    if (!draft.find((i) => i.id === product.id)) {
      draft.push(product);
    }
  });

  patchState(store, {
    cartItems: updatedCartItems,
    wishlistItems: updatedWishlistItems,
  });
};
```

**Flow:**

```
User click ♡ button trong cart item
    ↓
store.moveToWishlist(product)
    ↓
Filter product ra khỏi cartItems
    ↓
Thêm product vào wishlistItems (nếu chưa có)
    ↓
patchState() update store
    ↓
UI tự động re-render:
  - Item biến mất khỏi cart
  - Cart badge giảm
  - Wishlist badge tăng
```

---

### 4.8 Cart Page

#### **ViewCartComponent** (`pages/view-cart/view-cart.component.ts`)

**Route:** `/cart`

**Layout:**

```
┌─ Continue Shopping ────────────────────────────────┐
│  Shopping Cart                                      │
│                                                     │
│  [Wishlist items preview - Tease]                  │
│                                                     │
│  ┌──────────────────────┬──────────────────────┐   │
│  │ Cart Items (3)       │  Order Summary       │   │
│  │ ┌──────────────────┐ │  Subtotal: $599.98   │   │
│  │ │ Product 1        │ │  Tax (10%): $60.00   │   │
│  │ │ [- 2 +] $599.98  │ │  ──────────────────  │   │
│  │ │ [♡] [🗑️]        │ │  Total: $659.98      │   │
│  │ └──────────────────┘ │                      │   │
│  │ ┌──────────────────┐ │  [Proceed to        │   │
│  │ │ Product 2        │ │   Checkout]          │   │
│  │ └──────────────────┘ │                      │   │
│  └──────────────────────┴──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Template:**

```html
<div class="mx-auto max-w-[1200px] py-6">
  <app-back-button class="mb-6" navigateTo="/products/all"> Continue Shopping </app-back-button>

  <h1 class="text-3xl font-extrabold mb-4">Shopping Cart</h1>

  <!-- Tease Wishlist -->
  <app-tease-wishlist class="mb-6 block" />

  <!-- Main Grid -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <!-- Cart Items (2/3 width) -->
    <div class="lg:col-span-2">
      <app-list-cart-items />
    </div>

    <!-- Order Summary (1/3 width) -->
    <div>
      <app-summarize-order></app-summarize-order>
    </div>
  </div>
</div>
```

---

### 4.9 Cart Badge

**Header Actions:**

```html
<button
  matIconButton
  [matBadge]="store.cartCount()"
  [matBadgeHidden]="store.cartCount() === 0"
  routerLink="cart"
>
  <mat-icon>shopping_cart</mat-icon>
</button>
```

**Computed: cartCount**

```typescript
cartCount: computed(() => cartItems().reduce((acc, item) => acc + item.quantity, 0));
```

**Ví dụ:**

```typescript
cartItems = [
  { product: {...}, quantity: 2 },  // +2
  { product: {...}, quantity: 1 },  // +1
  { product: {...}, quantity: 3 },  // +3
]
// → cartCount = 6
```

---

## 5. LUỒNG HOẠT ĐỘNG TỔNG HỢP

### 5.1 User Journey: Từ Browse → Wishlist → Cart

```
┌─────────────────────────────────────────────────────────┐
│ BƯỚC 1: Duyệt sản phẩm                                  │
└─────────────────────────────────────────────────────────┘
User vào /products/all
    ↓
Xem danh sách 20 sản phẩm
    ↓
Click category "Electronics"
    ↓
Navigate to /products/electronics
    ↓
store.setCategory('electronics')
    ↓
filteredProducts() tính lại → Chỉ hiển thị electronics

┌─────────────────────────────────────────────────────────┐
│ BƯỚC 2: Thêm vào Wishlist                               │
└─────────────────────────────────────────────────────────┘
User click ♡ button trên Product Card
    ↓
toggleWishlist(product)
    ↓
isInWishlist() = false
    ↓
store.addToWishlish(product)
    ↓
wishlistItems = [..., product]
    ↓
UI update:
  - Button → ♥ (red)
  - Badge: 0 → 1
  - Toast: "Product added to wishlist"

┌─────────────────────────────────────────────────────────┐
│ BƯỚC 3: Xem Wishlist                                    │
└─────────────────────────────────────────────────────────┘
User click wishlist badge ở header
    ↓
Navigate to /wishlist
    ↓
Hiển thị tất cả wishlistItems
    ↓
User thấy 1 sản phẩm

┌─────────────────────────────────────────────────────────┐
│ BƯỚC 4: Thêm từ Wishlist vào Cart                       │
└─────────────────────────────────────────────────────────┘
User click "Add to cart" trên wishlist item
    ↓
store.addToCart(product, 1)
    ↓
cartItems = [{ product, quantity: 1 }]
wishlistItems = [] (tự động xóa)
    ↓
UI update:
  - Cart badge: 0 → 1
  - Wishlist badge: 1 → 0
  - Sản phẩm biến mất khỏi wishlist page
  - Toast: "Product moved to cart"

┌─────────────────────────────────────────────────────────┐
│ BƯỚC 5: Quản lý Cart                                    │
└─────────────────────────────────────────────────────────┘
User click cart badge
    ↓
Navigate to /cart
    ↓
Hiển thị cart items với qty selector
    ↓
User click [+] button
    ↓
qtyUpdate.emit(2)
    ↓
store.setItemQuantity({ productId, quantity: 2 })
    ↓
cartItems[0].quantity = 2
    ↓
UI update:
  - Quantity: 1 → 2
  - Total: $299.99 → $599.98
  - Cart badge: 1 → 2

┌─────────────────────────────────────────────────────────┐
│ BƯỚC 6: Checkout                                        │
└─────────────────────────────────────────────────────────┘
User click "Proceed to Checkout"
    ↓
Check user đã đăng nhập?
    ├─ No → Open SignInDialog
    │   ↓
    │   User sign in
    │   ↓
    │   Navigate to /checkout
    │
    └─ Yes → Navigate to /checkout
    ↓
Hiển thị checkout page với order summary
```

---

### 5.2 State Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  EcommerceStore                         │
│                                                         │
│  STATE                                                  │
│  ┌───────────────────────────────────────────────────┐ │
│  │ products: Product[]           (20 items)          │ │
│  │ category: string              ('all')             │ │
│  │ searchQuery: string           ('')                │ │
│  │ wishlistItems: Product[]      []  ←─────┐        │ │
│  │ cartItems: CartItem[]         []  ←─────┼───┐    │ │
│  │ user: User | undefined        undefined ←┼───┼─┐ │ │
│  └───────────────────────────────────────────────────┘ │
│                                              │   │ │   │
│  COMPUTED                                    │   │ │   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ filteredProducts ← (products, category, search) │ │ │
│  │ wishlistCount ← wishlistItems.length            │ │ │
│  │ cartCount ← sum(cartItems[].quantity)           │ │ │
│  └───────────────────────────────────────────────────┘ │
│                                              │   │ │   │
│  STORAGE SYNC (localStorage)                 │   │ │   │
│  ┌───────────────────────────────────────────────────┐ │
│  │ key: 'modern-store'                             │ │ │
│  │ select: { wishlistItems, cartItems, user } ─────┘ │ │
│  └───────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
   Components               Pages
   - ProductCart            - ProductsGrid
   - ToggleWishlist         - MyWishlist
   - QtySelector            - ViewCart
   - ShowCartItems          - Checkout
```

---

### 5.3 Component Communication

```
ProductsGrid
    ↓ [product] input
ProductCart
    ↓ ng-content slot
ToggleWishlistButton
    ↓ (click)
store.addToWishlish(product)
    ↓ patchState
wishlistItems updated
    ↓ signal emit
All components using wishlistItems re-render
    - Badge updates
    - Button icon changes
    - Wishlist page updates
```

---

### 5.4 Data Persistence Flow

```
User thêm product vào wishlist
    ↓
store.addToWishlish(product)
    ↓
patchState(store, { wishlistItems: [...] })
    ↓
withStorageSync() detect change
    ↓
localStorage.setItem('modern-store', JSON.stringify({
  wishlistItems: [...],
  cartItems: [...],
  user: {...}
}))
    ↓
User reload page
    ↓
EcommerceStore khởi tạo
    ↓
withStorageSync() restore state
    ↓
localStorage.getItem('modern-store')
    ↓
Parse JSON và set vào store
    ↓
wishlistItems, cartItems, user được restore
```

---

## 📊 TỔNG KẾT

### Các chức năng chính đã triển khai:

✅ **Hiển thị danh sách sản phẩm**

- Product Card component với đầy đủ thông tin
- Responsive grid layout
- Star rating và reviews
- View transition animations

✅ **Phân loại theo Category**

- Sidebar navigation với 10 categories
- Filter logic trong computed signal
- Highlight active category
- Toggle sidebar

✅ **Quản lý Wishlist**

- Toggle wishlist button
- Add/remove từ wishlist
- Wishlist page với grid layout
- Badge hiển thị số lượng
- Auto persist vào localStorage

✅ **Quản lý Cart**

- Add to cart từ product card
- Quantity selector với +/- buttons
- Update quantity realtime
- Move giữa cart và wishlist
- Cart badge hiển thị tổng số items
- Order summary với subtotal/tax/total
- Auto persist vào localStorage

### Công nghệ sử dụng:

- **NgRx Signal Store**: State management
- **Immer**: Immutable updates
- **Computed Signals**: Reactive calculations
- **Storage Sync**: Auto persist to localStorage
- **Angular Material**: UI components
- **TailwindCSS**: Styling
- **View Transitions**: Smooth animations

### Performance optimizations:

- Lazy loading pages
- Computed signals (chỉ tính khi dependencies thay đổi)
- Immutable updates (optimize change detection)
- Track by trong @for loops
- Debounced search

---

**Tài liệu này mô tả chi tiết các chức năng sản phẩm từ code implementation đến user flow.**
