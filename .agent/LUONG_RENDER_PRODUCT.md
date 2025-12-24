# LUỒNG HOẠT ĐỘNG CHI TIẾT: TỪ http://localhost:4200/ ĐẾN KHI RENDER DANH SÁCH PRODUCT

## 📋 TỔNG QUAN

Tài liệu này mô tả chi tiết luồng hoạt động của ứng dụng Angular E-commerce từ khi người dùng truy cập `http://localhost:4200/` cho đến khi danh sách sản phẩm được hiển thị trên màn hình.

---

## 🔄 LUỒNG HOẠT ĐỘNG CHI TIẾT

### **BƯỚC 1: KHỞI ĐỘNG ỨNG DỤNG ANGULAR**

#### 1.1. Trình duyệt tải `index.html`

**File:** `src/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>NgEcommerce</title>
    <base href="/" />
    <!-- Fonts & Icons -->
  </head>
  <body>
    <app-root></app-root>
    <!-- ⭐ Angular sẽ mount ứng dụng vào đây -->
  </body>
</html>
```

**Điều gì xảy ra:**

- Trình duyệt tải file HTML tĩnh
- Thẻ `<app-root>` là placeholder rỗng, chờ Angular mount vào
- Angular CLI tự động inject các file JavaScript đã được build

---

#### 1.2. Angular Bootstrap Application

**File:** `src/main.ts`

```typescript
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
```

**Điều gì xảy ra:**

- `bootstrapApplication()` khởi động ứng dụng Angular
- Sử dụng component `App` làm root component
- Apply cấu hình từ `appConfig`

---

#### 1.3. Cấu hình ứng dụng

**File:** `src/app/app.config.ts`

```typescript
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),  // ⚡ Sử dụng Zoneless (Angular Signals)
    provideRouter(routes,
      withComponentInputBinding(),     // ✅ Cho phép route params binding vào component input
      withViewTransitions()            // ✨ Bật View Transitions API
    ),
    provideHotToastConfig({...}),      // 🍞 Cấu hình toast notifications
    // Material Form Field config
  ]
};
```

**Điều gì xảy ra:**

- **Zoneless Change Detection**: Sử dụng Angular Signals thay vì Zone.js (hiệu năng cao hơn)
- **Router với Component Input Binding**: Route params tự động bind vào component inputs
- **View Transitions**: Hiệu ứng chuyển trang mượt mà
- **Toast Service**: Thông báo cho người dùng

---

### **BƯỚC 2: KHỞI TẠO ROOT COMPONENT**

#### 2.1. App Component được render

**File:** `src/app/app.ts`

```typescript
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  template: `
    <app-header />
    <!-- Header cố định -->
    <div class="h-[calc(100%-64px)] overflow-auto">
      <router-outlet />
      <!-- Nơi render các route -->
    </div>
  `,
})
export class App {}
```

**Điều gì xảy ra:**

- Angular render component `App` vào `<app-root>` trong HTML
- Component này có 2 phần:
  1. **Header**: Luôn hiển thị (search bar, cart, wishlist, user actions)
  2. **Router Outlet**: Vùng động, hiển thị component tương ứng với route

---

#### 2.2. Header Component được khởi tạo

**File:** `src/app/layout/header/header.ts`

```typescript
export class Header {
  store = inject(EcommerceStore); // ⭐ Inject Global Store
}
```

**Template:**

```html
<mat-toolbar>
  <div>
    <!-- Menu button để toggle sidebar -->
    <button (click)="store.toggleSidebar()">
      <mat-icon>menu</mat-icon>
    </button>
    <span>Modern Store</span>
  </div>

  <!-- Search Bar -->
  <app-search-bar />

  <!-- Header Actions (Cart, Wishlist, User) -->
  <app-header-actions />
</mat-toolbar>
```

**Điều gì xảy ra:**

- Header inject `EcommerceStore` (Global State Management)
- Hiển thị menu, search bar, và các action buttons
- Store đã được khởi tạo và sẵn sàng sử dụng

---

### **BƯỚC 3: ROUTING & NAVIGATION**

#### 3.1. Router xử lý URL

**File:** `src/app/app.routes.ts`

Khi người dùng truy cập `http://localhost:4200/`:

```typescript
export const routes: Routes = [
  {
    path: '', // ⭐ URL: http://localhost:4200/
    pathMatch: 'full',
    redirectTo: 'products/all', // 🔀 Redirect đến /products/all
  },
  {
    path: 'products/:category', // ⭐ Match với /products/all
    loadComponent: () => import('./pages/products-grid/products-grid'),
  },
  // ... other routes
];
```

**Điều gì xảy ra:**

1. Router nhận URL `/`
2. Match với route đầu tiên: `path: ''`
3. **Redirect** đến `/products/all`
4. Router match lại với route thứ 2: `products/:category`
5. **Lazy load** component `ProductsGrid`
6. Route param `category = 'all'` được bind vào component

---

### **BƯỚC 4: KHỞI TẠO ECOMMERCE STORE (GLOBAL STATE)**

#### 4.1. EcommerceStore được tạo

**File:** `src/app/ecommerce.ts`

```typescript
export const EcommerceStore = signalStore(
  { providedIn: 'root' }, // ⭐ Singleton, được tạo 1 lần duy nhất

  // 1️⃣ STATE: Dữ liệu ban đầu
  withState({
    products: [
      /* 20 sản phẩm hardcoded */
    ],
    category: 'all',
    searchQuery: '',
    wishlistItems: [],
    cartItems: [],
    user: undefined,
    isSidebarOpen: true,
    // ...
  } as EcommerceState),

  // 2️⃣ STORAGE SYNC: Lưu vào localStorage
  withStorageSync({
    key: 'modern-store',
    select: ({ wishlistItems, cartItems, user }) => ({ wishlistItems, cartItems, user }),
  }),

  // 3️⃣ COMPUTED: Tính toán dữ liệu phái sinh
  withComputed(({ category, products, searchQuery }) => ({
    filteredProducts: computed(() => {
      let filtered = products();

      // Filter theo category
      if (category() !== 'all') {
        filtered = filtered.filter((p) => p.category === category().toLowerCase());
      }

      // Filter theo search query
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
    wishlistCount: computed(() => wishlistItems().length),
    cartCount: computed(() => cartItems().reduce((acc, item) => acc + item.quantity, 0)),
  })),

  // 4️⃣ METHODS: Các hàm để thay đổi state
  withMethods((store) => ({
    setCategory: signalMethod<string>((category: string) => {
      patchState(store, { category });
    }),
    setSearchQuery: signalMethod<string>((searchQuery: string) => {
      patchState(store, { searchQuery });
    }),
    addToCart: (product, quantity) => {
      /* ... */
    },
    addToWishlist: (product) => {
      /* ... */
    },
    // ... các methods khác
  }))
);
```

**Điều gì xảy ra:**

- Store được tạo **1 lần duy nhất** khi ứng dụng khởi động (providedIn: 'root')
- **State ban đầu**:
  - `products`: 20 sản phẩm hardcoded
  - `category`: 'all'
  - `searchQuery`: ''
  - `isSidebarOpen`: true
- **Storage Sync**: Tự động restore `wishlistItems`, `cartItems`, `user` từ localStorage (nếu có)
- **Computed Signals**:
  - `filteredProducts`: Tự động tính toán lại khi `category`, `products`, hoặc `searchQuery` thay đổi
  - `wishlistCount`, `cartCount`: Tự động cập nhật
- **Methods**: Các hàm để thay đổi state (setCategory, addToCart, etc.)

---

### **BƯỚC 5: PRODUCTS GRID COMPONENT ĐƯỢC LOAD**

#### 5.1. Component được lazy load

**File:** `src/app/pages/products-grid/products-grid.ts`

```typescript
export default class ProductsGrid {
  // ⭐ Route param 'category' tự động bind vào input này
  category = input<string>('all'); // Giá trị: 'all'

  // ⭐ Inject global store
  store = inject(EcommerceStore);

  // Danh sách categories cho sidebar
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
    // ⭐ Set category vào store ngay khi component được tạo
    this.store.setCategory(this.category);
  }
}
```

**Điều gì xảy ra:**

1. Angular lazy load component `ProductsGrid`
2. Router bind param `category = 'all'` vào `input()` của component
3. Component inject `EcommerceStore`
4. Trong constructor:
   - Gọi `store.setCategory(this.category)`
   - Store update state: `category = 'all'`
   - **Computed signal `filteredProducts` tự động chạy lại**

---

#### 5.2. Template được render

**Template:**

```html
<mat-sidenav-container class="h-full">
  <!-- SIDEBAR: Categories -->
  <mat-sidenav mode="side" [opened]="store.isSidebarOpen()">
    <div class="p-6">
      <h2>Categories</h2>
      <mat-nav-list>
        @for(cat of categories(); track cat) {
        <mat-list-item [activated]="cat === category()" [routerLink]="['/products', cat]">
          <span>{{ cat | titlecase }}</span>
        </mat-list-item>
        }
      </mat-nav-list>
    </div>
  </mat-sidenav>

  <!-- MAIN CONTENT: Products Grid -->
  <mat-sidenav-content class="bg-gray-100 p-6 h-full">
    <h1>{{ category() | titlecase }}</h1>
    <p>
      {{ store.filteredProducts().length }} {{ store.filteredProducts().length <= 1 ? 'product' :
      'products' }} found
    </p>

    <!-- ⭐ RENDER DANH SÁCH PRODUCTS -->
    <div class="responsive-grid">
      @for (product of store.filteredProducts(); track product.id) {
      <div [style.view-transition-name]="'product-item-' + product.id">
        <app-product-cart [product]="product">
          <app-toggle-wishlist-button [product]="product" />
        </app-product-cart>
      </div>
      }
    </div>
  </mat-sidenav-content>
</mat-sidenav-container>
```

**Điều gì xảy ra:**

1. **Sidebar**:

   - Hiển thị nếu `store.isSidebarOpen() === true`
   - Loop qua `categories()` và render danh sách
   - Highlight category hiện tại (`cat === category()`)

2. **Main Content**:

   - Hiển thị title: "All" (từ `category() | titlecase`)
   - Hiển thị số lượng: "20 products found" (từ `store.filteredProducts().length`)
   - **Loop qua `store.filteredProducts()`** và render từng product

3. **Reactive Updates**:
   - Khi `category` thay đổi → `filteredProducts` tự động update → UI tự động re-render
   - Khi `searchQuery` thay đổi → `filteredProducts` tự động update → UI tự động re-render

---

### **BƯỚC 6: RENDER PRODUCT CARDS**

#### 6.1. ProductCartComponent được render

**File:** `src/app/components/product-cart/product-cart.component.ts`

```typescript
export class ProductCartComponent {
  product = input.required<Product>(); // ⭐ Nhận product từ parent
  store = inject(EcommerceStore);

  // Computed: Tính số lượng reviews
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

**Template:**

```html
<div class="bg-white rounded-xl shadow-lg hover:-translate-y-1">
  <!-- Product Image -->
  <img
    [src]="product().imageUrl"
    [routerLink]="['/product', product().id]"
    class="w-full h-[300px] object-cover"
  />

  <!-- Wishlist Button (ng-content) -->
  <ng-content></ng-content>

  <div class="p-5" [routerLink]="['/product', product().id]">
    <!-- Product Name -->
    <h3>{{ product().name }}</h3>

    <!-- Description -->
    <p>{{ product().description }}</p>

    <!-- Star Rating -->
    <app-star-rating [rating]="averageRating()"> {{ totalReviews() }} </app-star-rating>

    <!-- Stock Status -->
    <div>{{ product().inStock ? 'In Stock' : 'Out of stock' }}</div>

    <!-- Price & Add to Cart -->
    <div class="flex items-center justify-between">
      <span class="text-2xl font-bold">${{ product().price }}</span>
      <button (click)="$event.stopPropagation(); store.addToCart(product(), 1)">
        <mat-icon>shopping_cart</mat-icon>
        Add to cart
      </button>
    </div>
  </div>
</div>
```

**Điều gì xảy ra:**

- Component nhận `product` từ parent qua `input()`
- Tính toán `averageRating` và `totalReviews` từ product data
- Render thông tin sản phẩm: image, name, description, rating, price
- Button "Add to cart" gọi `store.addToCart()`
- Click vào card sẽ navigate đến `/product/:id`

---

## 📊 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. Browser loads http://localhost:4200/                        │
│    └─> Loads index.html with <app-root></app-root>            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. main.ts: bootstrapApplication(App, appConfig)               │
│    ├─> Khởi tạo Angular với Zoneless Change Detection         │
│    ├─> Cấu hình Router với Component Input Binding            │
│    └─> Khởi tạo các providers (Toast, Material, etc.)         │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. App Component renders                                       │
│    ├─> <app-header /> (Header + Search + Actions)             │
│    └─> <router-outlet /> (Dynamic route content)              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. EcommerceStore được khởi tạo (Singleton)                   │
│    ├─> withState: products[], category='all', etc.            │
│    ├─> withStorageSync: Restore từ localStorage               │
│    ├─> withComputed: filteredProducts, cartCount, etc.        │
│    └─> withMethods: setCategory, addToCart, etc.              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. Router processes URL: /                                     │
│    ├─> Match route: path='' → redirectTo='products/all'       │
│    ├─> Navigate to: /products/all                             │
│    └─> Match route: path='products/:category'                 │
│        └─> Lazy load ProductsGrid component                   │
│        └─> Bind route param: category='all'                   │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. ProductsGrid Component                                      │
│    ├─> category = input<string>('all')  ← Route param         │
│    ├─> store = inject(EcommerceStore)                         │
│    ├─> constructor() {                                        │
│    │     store.setCategory(this.category)                     │
│    │   }                                                       │
│    └─> Triggers: filteredProducts computed signal             │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. filteredProducts Computed Signal                            │
│    ├─> Input: products(), category='all', searchQuery=''      │
│    ├─> Filter logic:                                          │
│    │   ├─ category !== 'all' ? filter by category : all      │
│    │   └─ searchQuery ? filter by name/desc : no filter      │
│    └─> Output: Array of 20 products (all products)            │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 8. Template renders                                            │
│    ├─> Sidebar: Categories list                               │
│    ├─> Header: "All" + "20 products found"                    │
│    └─> Grid: @for (product of store.filteredProducts())       │
│        └─> Render 20 ProductCartComponent                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 9. ProductCartComponent (x20)                                  │
│    ├─> product = input.required<Product>()                    │
│    ├─> averageRating = computed(() => ...)                    │
│    ├─> totalReviews = computed(() => ...)                     │
│    └─> Renders:                                               │
│        ├─ Image                                               │
│        ├─ Name, Description                                   │
│        ├─ Star Rating + Review count                          │
│        ├─ Stock status                                        │
│        └─ Price + "Add to cart" button                        │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 10. ✅ DANH SÁCH 20 PRODUCTS ĐƯỢC HIỂN THỊ                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 CÁC ĐIỂM QUAN TRỌNG

### 1. **Angular Signals & Zoneless Change Detection**

- Không sử dụng Zone.js
- Tất cả state management dùng **Signals**
- Change detection chỉ chạy khi signals thay đổi → **Hiệu năng cao**

### 2. **NgRx Signal Store**

- Global state management với `signalStore`
- **withState**: Định nghĩa state ban đầu
- **withStorageSync**: Tự động sync với localStorage
- **withComputed**: Tính toán dữ liệu phái sinh (reactive)
- **withMethods**: Các hàm để thay đổi state

### 3. **Component Input Binding**

- Route params tự động bind vào component inputs
- `category = input<string>('all')` ← Nhận từ route `/products/:category`

### 4. **Lazy Loading**

- Components được load on-demand
- `loadComponent: () => import('./pages/products-grid/products-grid')`

### 5. **Computed Signals**

- `filteredProducts` tự động tính toán lại khi:
  - `category` thay đổi
  - `searchQuery` thay đổi
  - `products` thay đổi
- Không cần manual subscription hay change detection

### 6. **View Transitions API**

- Smooth animations khi navigate giữa các trang
- `[style.view-transition-name]="'product-item-' + product.id"`

---

## 🎯 TÓM TẮT LUỒNG

1. **Browser** → Load `index.html`
2. **main.ts** → Bootstrap Angular app với `App` component
3. **app.config.ts** → Cấu hình router, zoneless, providers
4. **App Component** → Render Header + Router Outlet
5. **EcommerceStore** → Khởi tạo global state (products, category, etc.)
6. **Router** → `/` → Redirect → `/products/all`
7. **ProductsGrid** → Lazy load, bind `category='all'`, gọi `store.setCategory()`
8. **filteredProducts** → Computed signal tính toán danh sách products
9. **Template** → Loop `@for` render 20 `ProductCartComponent`
10. **ProductCartComponent** → Hiển thị từng sản phẩm với image, name, price, rating

---

## 📝 KẾT LUẬN

Ứng dụng sử dụng **Angular Signals** và **NgRx Signal Store** để quản lý state một cách reactive và hiệu quả. Toàn bộ luồng từ routing, state management, đến rendering đều được tối ưu hóa với:

- ✅ **Zoneless Change Detection** (hiệu năng cao)
- ✅ **Lazy Loading** (load nhanh)
- ✅ **Computed Signals** (reactive, tự động update)
- ✅ **Component Input Binding** (clean code)
- ✅ **View Transitions** (UX mượt mà)

Khi người dùng truy cập `http://localhost:4200/`, họ sẽ thấy danh sách 20 sản phẩm được render ngay lập tức với sidebar categories, search bar, và các tính năng ecommerce đầy đủ.
