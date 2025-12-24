# HỆ THỐNG AUTHENTICATION - ECOMMERCE STORE

## 📋 MỤC LỤC

1. [Tổng quan Authentication](#1-tổng-quan-authentication)
2. [Data Models](#2-data-models)
3. [Sign Up (Đăng ký)](#3-sign-up-đăng-ký)
4. [Sign In (Đăng nhập)](#4-sign-in-đăng-nhập)
5. [Sign Out (Đăng xuất)](#5-sign-out-đăng-xuất)
6. [User State Management](#6-user-state-management)
7. [LocalStorage Persistence](#7-localstorage-persistence)
8. [Protected Routes & Checkout Flow](#8-protected-routes--checkout-flow)
9. [User Menu & Profile](#9-user-menu--profile)
10. [Security Considerations](#10-security-considerations)

---

## 1. TỔNG QUAN AUTHENTICATION

### 1.1 Kiến trúc Authentication

```
┌─────────────────────────────────────────────────────────┐
│                  AUTHENTICATION SYSTEM                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │  Sign Up     │    │   Sign In    │                 │
│  │   Dialog     │◄──►│    Dialog    │                 │
│  └──────┬───────┘    └──────┬───────┘                 │
│         │                    │                          │
│         └────────┬───────────┘                          │
│                  ↓                                      │
│         ┌────────────────┐                             │
│         │ EcommerceStore │                             │
│         │  - signUp()    │                             │
│         │  - signIn()    │                             │
│         │  - signOut()   │                             │
│         │  - user state  │                             │
│         └────────┬───────┘                             │
│                  ↓                                      │
│         ┌────────────────┐                             │
│         │  localStorage  │                             │
│         │  'app_users'   │ ← User database             │
│         │  'modern-store'│ ← Current user state        │
│         └────────────────┘                             │
└─────────────────────────────────────────────────────────┘
```

### 1.2 Đặc điểm chính

✅ **Dialog-based Authentication** - Modal dialogs cho Sign In/Sign Up
✅ **LocalStorage Database** - Lưu users trong `localStorage['app_users']`
✅ **State Persistence** - Auto restore user state khi reload
✅ **Protected Checkout** - Yêu cầu đăng nhập trước khi checkout
✅ **User Menu** - Hiển thị profile và sign out option
✅ **Form Validation** - Reactive forms với validators
✅ **Password Visibility Toggle** - Show/hide password
✅ **Dialog Switching** - Chuyển đổi giữa Sign In ↔ Sign Up

⚠️ **LƯU Ý:** Đây là authentication **DEMO** - không phù hợp cho production vì:

- Password lưu plain text (không hash)
- Không có token-based auth
- Không có session management
- Không có backend API

---

## 2. DATA MODELS

### 2.1 User Model

**File:** `models/user.ts`

```typescript
export type User = {
  id: string; // UUID generated bởi crypto.randomUUID()
  email: string; // Email address (unique)
  name: string; // Full name
  imageUrl: string; // Avatar URL (auto-generated)
};
```

**Ví dụ:**

```typescript
{
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  email: "john@example.com",
  name: "John Doe",
  imageUrl: "https://i.pravatar.cc/150?u=john@example.com"
}
```

**🔑 Lưu ý:**

- `id`: Tạo tự động bằng `crypto.randomUUID()`
- `imageUrl`: Tạo từ email với pravatar.cc service
- `password`: **KHÔNG** lưu trong User object (chỉ trong localStorage database)

---

### 2.2 SignUpParams

```typescript
export type SignUpParams = {
  name: string; // Tên người dùng
  email: string; // Email
  password: string; // Password (plain text)
  checkout?: boolean; // Flag: Có đang trong checkout flow không?
  dialogId: string; // Dialog ID để close sau khi thành công
};
```

**Usage:**

```typescript
store.signUp({
  name: 'John Doe',
  email: 'john@example.com',
  password: '123456',
  checkout: false,
  dialogId: 'mat-dialog-0',
});
```

---

### 2.3 SignInParams

```typescript
export type SignInParams = Omit<SignUpParams, 'name'>;
// = {
//   email: string;
//   password: string;
//   checkout?: boolean;
//   dialogId: string;
// }
```

**Usage:**

```typescript
store.signIn({
  email: 'john@example.com',
  password: '123456',
  checkout: true, // Navigate to checkout sau khi login
  dialogId: 'mat-dialog-1',
});
```

---

## 3. SIGN UP (ĐĂNG KÝ)

### 3.1 SignUpDialogComponent

**File:** `components/sign-up-dialog/sign-up-dialog.component.ts`

#### **Layout:**

```
┌──────────────────────────────────────┐
│  Sign Up                        [X]  │
│  Join us and start shopping today    │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ 👤 Enter your name             │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ ✉️  Enter your email           │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🔒 Enter your password         │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🔒 Confirm your password       │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │     Create Account             │ │
│  └────────────────────────────────┘ │
│                                      │
│  Already have an account? Sign In   │
└──────────────────────────────────────┘
```

#### **Template:**

```html
<div class="p-8 max-w-[400px] flex flex-col">
  <!-- Header -->
  <div class="flex justify-between">
    <div>
      <h2 class="text-xl font-medium mb-1">Sign Up</h2>
      <p class="text-sm text-gray-500">Join us and start shopping today</p>
    </div>
    <button tabindex="-1" matIconButton class="-mt-2 -mr-2" mat-dialog-close>
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <!-- Form -->
  <form [formGroup]="signupForm" class="mt-6 flex flex-col" (ngSubmit)="signUp()">
    <!-- Name Field -->
    <mat-form-field class="mb-4">
      <input formControlName="name" type="text" matInput placeholder="Enter your name" />
      <mat-icon matPrefix>person</mat-icon>
    </mat-form-field>

    <!-- Email Field -->
    <mat-form-field class="mb-4">
      <input formControlName="email" type="email" matInput placeholder="Enter your email" />
      <mat-icon matPrefix>email</mat-icon>
    </mat-form-field>

    <!-- Password Field -->
    <mat-form-field class="mb-4">
      <input
        formControlName="password"
        type="password"
        matInput
        placeholder="Enter your password"
      />
      <mat-icon matPrefix>lock</mat-icon>
    </mat-form-field>

    <!-- Confirm Password Field -->
    <mat-form-field class="mb-4">
      <input
        formControlName="confirmPassword"
        type="password"
        matInput
        placeholder="Confirm your password"
      />
      <mat-icon matPrefix>lock</mat-icon>
    </mat-form-field>

    <!-- Submit Button -->
    <button type="submit" matButton="filled" class="w-full">Create Account</button>
  </form>

  <!-- Switch to Sign In -->
  <p class="text-sm text-gray-500 mt-2 text-center">
    Already have an account?
    <a class="text-blue-500 cursor-pointer" (click)="openSignInDialog()">Sign In</a>
  </p>
</div>
```

---

#### **Component Logic:**

```typescript
export class SignUpDialogComponent {
  fb = inject(NonNullableFormBuilder);
  store = inject(EcommerceStore);
  dialogRef = inject(MatDialogRef);
  matDialog = inject(MatDialog);
  data = inject<{ checkout: boolean }>(MAT_DIALOG_DATA);

  // Reactive Form với validators
  signupForm = this.fb.group({
    name: ['John Doe', Validators.required],
    email: ['john@gmail.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['123456', Validators.required],
  });

  signUp() {
    // Validate form
    if (!this.signupForm.valid) {
      this.signupForm.markAllAsTouched(); // Hiển thị errors
      return;
    }

    // Extract values
    const { name, email, password } = this.signupForm.value;

    // Call store method
    this.store.signUp({
      name,
      email,
      password,
      dialogId: this.dialogRef.id,
      checkout: this.data?.checkout,
    } as SignUpParams);
  }

  // Switch to Sign In dialog
  openSignInDialog() {
    this.dialogRef.close(); // Close current dialog
    this.matDialog.open(SignInDialogComponent, {
      disableClose: true,
      data: {
        checkout: this.data?.checkout, // Preserve checkout flag
      },
    });
  }
}
```

---

### 3.2 Store Method: signUp()

**File:** `ecommerce.ts`

```typescript
signUp({ email, password, name, dialogId }: SignUpParams) {
  // 1. Lấy danh sách users từ localStorage
  const usersStr = localStorage.getItem('app_users');
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  // 2. Kiểm tra email đã tồn tại chưa
  if (users.find((u) => u.email === email)) {
    toaster.error('User already exists');
    return;
  }

  // 3. Tạo user mới
  const newUser: User = {
    id: crypto.randomUUID(),  // Generate unique ID
    email,
    name,
    imageUrl: 'https://i.pravatar.cc/150?u=' + email,  // Dynamic avatar
  };

  // 4. Lưu vào localStorage (bao gồm password)
  // ⚠️ DEMO ONLY: Password lưu plain text
  const usersWithPassword = [
    ...(usersStr ? JSON.parse(usersStr) : []),
    { ...newUser, password },  // Thêm password vào object
  ];
  localStorage.setItem('app_users', JSON.stringify(usersWithPassword));

  // 5. Update store state (không bao gồm password)
  patchState(store, { user: newUser });

  // 6. Close dialog
  matDialog.getDialogById(dialogId)?.close();

  // 7. Show success message
  toaster.success('Account created successfully');
}
```

---

### 3.3 Sign Up Flow

```
User click "Sign Up" button ở header
    ↓
matDialog.open(SignUpDialogComponent, { disableClose: true })
    ↓
Dialog hiển thị với form
    ↓
User nhập:
  - Name: "John Doe"
  - Email: "john@example.com"
  - Password: "123456"
  - Confirm Password: "123456"
    ↓
User click "Create Account"
    ↓
signUp() method được gọi
    ↓
Validate form
  ├─ Invalid → markAllAsTouched() → Hiển thị errors
  └─ Valid → Continue
    ↓
store.signUp({ name, email, password, dialogId })
    ↓
┌─────────────────────────────────────────────┐
│ TRONG STORE:                                │
│ 1. Lấy users từ localStorage['app_users']  │
│ 2. Check email đã tồn tại?                  │
│    ├─ Yes → toaster.error() → STOP         │
│    └─ No → Continue                         │
│ 3. Tạo newUser với crypto.randomUUID()     │
│ 4. Lưu vào localStorage (with password)    │
│ 5. patchState(store, { user: newUser })    │
│ 6. Close dialog                             │
│ 7. toaster.success()                        │
└─────────────────────────────────────────────┘
    ↓
UI tự động update:
  - Dialog đóng
  - Header hiển thị user avatar và menu
  - Sign In/Sign Up buttons biến mất
  - Toast notification hiển thị
    ↓
User đã đăng nhập thành công! ✅
```

---

### 3.4 Form Validation

**Validators:**

```typescript
{
  name: ['', Validators.required],
  email: ['', [Validators.required, Validators.email]],
  password: ['', [Validators.required, Validators.minLength(6)]],
  confirmPassword: ['', Validators.required]
}
```

**Error Messages:**

- `name`: "Name is required"
- `email`: "Valid email is required"
- `password`: "Password must be at least 6 characters"
- `confirmPassword`: "Please confirm your password"

**⚠️ Lưu ý:** Hiện tại chưa có validator kiểm tra `password === confirmPassword`

---

## 4. SIGN IN (ĐĂNG NHẬP)

### 4.1 SignInDialogComponent

**File:** `components/sign-in-dialog/sign-in-dialog.component.ts`

#### **Layout:**

```
┌──────────────────────────────────────┐
│  Sign In                        [X]  │
│  Sign in to your account to          │
│  continue shopping                   │
│                                      │
│  ┌────────────────────────────────┐ │
│  │ ✉️  Enter your email           │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │ 🔒 Enter your password    [👁️] │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │        Sign in                 │ │
│  └────────────────────────────────┘ │
│                                      │
│  Don't have an account? Sign up     │
└──────────────────────────────────────┘
```

#### **Template:**

```html
<div class="p-8 max-w-[400px] flex flex-col">
  <!-- Header -->
  <div class="flex justify-between">
    <div>
      <h2 class="text-xl font-medium mb-1">Sign In</h2>
      <p class="text-sm text-gray-500">Sign in to your account to continue shopping</p>
    </div>
    <button tabindex="-1" matIconButton class="-mt-2 -mr-2" mat-dialog-close>
      <mat-icon>close</mat-icon>
    </button>
  </div>

  <!-- Form -->
  <form class="mt-6" [formGroup]="signinForm" (ngSubmit)="signIn()">
    <!-- Email Field -->
    <mat-form-field class="w-full mb-4">
      <input type="email" matInput formControlName="email" placeholder="Enter your email" />
      <mat-icon matPrefix>email</mat-icon>
    </mat-form-field>

    <!-- Password Field with Visibility Toggle -->
    <mat-form-field class="w-full mb-6">
      <input
        matInput
        formControlName="password"
        [type]="passwordVisible() ? 'text' : 'password'"
        placeholder="Enter your password"
      />
      <mat-icon matPrefix>lock</mat-icon>

      <!-- Toggle Password Visibility -->
      <button
        matSuffix
        matIconButton
        type="button"
        class="mr-2"
        (click)="passwordVisible.set(!passwordVisible())"
      >
        <mat-icon [fontIcon]="passwordVisible() ? 'visibility_off' : 'visibility'"> </mat-icon>
      </button>
    </mat-form-field>

    <!-- Submit Button -->
    <button type="submit" matButton="filled" class="w-full">Sign in</button>
  </form>

  <!-- Switch to Sign Up -->
  <p class="text-sm text-gray-500 mt-2 text-center">
    Don't have an account?
    <a class="text-blue-500 cursor-pointer" (click)="openSignUpDialog()">Sign up</a>
  </p>
</div>
```

---

#### **Component Logic:**

```typescript
export class SignInDialogComponent {
  store = inject(EcommerceStore);
  fb = inject(NonNullableFormBuilder);
  data = inject<{ checkout: boolean }>(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef);
  matDialog = inject(MatDialog);

  // Signal for password visibility toggle
  passwordVisible = signal(false);

  // Reactive Form (pre-filled for demo)
  signinForm = this.fb.group({
    email: ['minhvutri12@gmail.com', Validators.required],
    password: ['123456', Validators.required],
  });

  signIn() {
    // Validate form
    if (!this.signinForm.valid) {
      this.signinForm.markAllAsTouched();
      return;
    }

    // Extract values
    const { email, password } = this.signinForm.value;

    // Call store method
    this.store.signIn({
      email,
      password,
      checkout: this.data?.checkout,
      dialogId: this.dialogRef.id,
    } as SignInParams);
  }

  // Switch to Sign Up dialog
  openSignUpDialog() {
    this.dialogRef.close();
    this.matDialog.open(SignUpDialogComponent, {
      disableClose: true,
      data: {
        checkout: this.data?.checkout,
      },
    });
  }
}
```

---

### 4.2 Password Visibility Toggle

**Feature:** Show/Hide password

**Implementation:**

```typescript
// Signal state
passwordVisible = signal(false);

// Template
<input
  [type]="passwordVisible() ? 'text' : 'password'"
  formControlName="password"
/>

<button
  type="button"
  (click)="passwordVisible.set(!passwordVisible())"
>
  <mat-icon>
    {{ passwordVisible() ? 'visibility_off' : 'visibility' }}
  </mat-icon>
</button>
```

**Behavior:**

- Default: `passwordVisible = false` → type="password" → ••••••
- Click button: `passwordVisible = true` → type="text" → 123456
- Icon changes: 👁️ (visibility) ↔ 🚫👁️ (visibility_off)

---

### 4.3 Store Method: signIn()

**File:** `ecommerce.ts`

```typescript
signIn({ email, password, checkout, dialogId }: SignInParams) {
  // 1. Lấy danh sách users từ localStorage
  const usersStr = localStorage.getItem('app_users');
  const users: any[] = usersStr ? JSON.parse(usersStr) : [];

  // 2. Tìm user với email và password khớp
  const foundUser = users.find(
    (u) => u.email === email && u.password === password
  );

  if (foundUser) {
    // ✅ LOGIN THÀNH CÔNG

    // 3. Remove password khỏi user object
    const { password, ...userWithoutPassword } = foundUser;

    // 4. Update store state
    patchState(store, {
      user: userWithoutPassword,
    });

    // 5. Close dialog
    matDialog.getDialogById(dialogId)?.close();

    // 6. Navigate to checkout (nếu có flag)
    if (checkout) {
      router.navigate(['/checkout']);
    }

    // 7. Show success message
    toaster.success('Signed in successfully');
  } else {
    // ❌ LOGIN THẤT BẠI
    toaster.error('Invalid email or password');
  }
}
```

---

### 4.4 Sign In Flow

```
User click "Sign In" button ở header
    ↓
matDialog.open(SignInDialogComponent, { disableClose: true })
    ↓
Dialog hiển thị với form
    ↓
User nhập:
  - Email: "john@example.com"
  - Password: "123456"
    ↓
User click "Sign in"
    ↓
signIn() method được gọi
    ↓
Validate form
  ├─ Invalid → markAllAsTouched() → Hiển thị errors
  └─ Valid → Continue
    ↓
store.signIn({ email, password, checkout, dialogId })
    ↓
┌─────────────────────────────────────────────┐
│ TRONG STORE:                                │
│ 1. Lấy users từ localStorage['app_users']  │
│ 2. Tìm user với email + password khớp      │
│    ├─ Not found → toaster.error() → STOP  │
│    └─ Found → Continue                      │
│ 3. Remove password khỏi user object        │
│ 4. patchState(store, { user })             │
│ 5. Close dialog                             │
│ 6. if (checkout) → navigate('/checkout')   │
│ 7. toaster.success()                        │
└─────────────────────────────────────────────┘
    ↓
UI tự động update:
  - Dialog đóng
  - Header hiển thị user avatar và menu
  - Sign In/Sign Up buttons biến mất
  - Toast notification hiển thị
  - (Optional) Navigate to /checkout
    ↓
User đã đăng nhập thành công! ✅
```

---

### 4.5 Demo Credentials

**Pre-filled trong form:**

```typescript
signinForm = this.fb.group({
  email: ['minhvutri12@gmail.com', Validators.required],
  password: ['123456', Validators.required],
});
```

**⚠️ Lưu ý:** Đây là credentials demo, user phải tự tạo account trước

---

## 5. SIGN OUT (ĐĂNG XUẤT)

### 5.1 Store Method: signOut()

**File:** `ecommerce.ts`

```typescript
signOut: () => {
  patchState(store, { user: undefined });
};
```

**Đơn giản nhưng hiệu quả:**

- Set `user` state về `undefined`
- Signal emit → UI tự động re-render
- User menu biến mất
- Sign In/Sign Up buttons xuất hiện lại

---

### 5.2 Sign Out Button

**Location:** Header Actions - User Menu

**Template:**

```html
<mat-menu #userMenu="matMenu" xPosition="before">
  <!-- User Info -->
  <div class="flex flex-col px-3 min-w-[200px] py-2">
    <span class="text-sm font-medium">{{ user.name }}</span>
    <span class="text-xs text-gray-500">{{ user.email }}</span>
  </div>

  <mat-divider class="mx-3"></mat-divider>

  <!-- Sign Out Button -->
  <button
    mat-menu-item
    (click)="store.signOut()"
    class="h-8 min-h-0 flex items-center gap-3 px-4 py-1 !m-0"
  >
    <mat-icon class="w-5 h-5 text-base shrink-0">logout</mat-icon>
    <span class="text-sm">Sign out</span>
  </button>
</mat-menu>
```

---

### 5.3 Sign Out Flow

```
User click avatar button ở header
    ↓
User menu dropdown hiển thị
    ↓
User click "Sign out"
    ↓
store.signOut()
    ↓
patchState(store, { user: undefined })
    ↓
user signal emit giá trị mới (undefined)
    ↓
UI tự động re-render:
  - User menu đóng
  - Avatar button biến mất
  - Sign In/Sign Up buttons xuất hiện
  - Protected routes không accessible
    ↓
User đã đăng xuất! ✅
```

---

## 6. USER STATE MANAGEMENT

### 6.1 User State trong Store

**File:** `ecommerce.ts`

```typescript
export type EcommerceState = {
  // ... other states
  user: User | undefined; // undefined = not logged in
};

export const EcommerceStore = signalStore(
  { providedIn: 'root' },
  withState({
    // ... other states
    user: undefined, // Initial state
  }),

  // Auto persist to localStorage
  withStorageSync({
    key: 'modern-store',
    select: ({ wishlistItems, cartItems, user }) => ({
      wishlistItems,
      cartItems,
      user, // ← User state được persist
    }),
  })

  // ... withComputed, withMethods
);
```

---

### 6.2 Checking Authentication Status

**Trong component:**

```typescript
@if(store.user(); as user) {
  <!-- User đã đăng nhập -->
  <div>Welcome, {{ user.name }}!</div>
} @else {
  <!-- User chưa đăng nhập -->
  <button (click)="openSignInDialog()">Sign In</button>
}
```

**Trong TypeScript:**

```typescript
const user = this.store.user();
if (user) {
  console.log('Logged in as:', user.name);
} else {
  console.log('Not logged in');
}
```

---

### 6.3 User Avatar

**Dynamic Avatar Generation:**

```typescript
const newUser: User = {
  id: crypto.randomUUID(),
  email: 'john@example.com',
  name: 'John Doe',
  imageUrl: 'https://i.pravatar.cc/150?u=' + email,
  //         ↑ Pravatar service tạo avatar từ email
};
```

**Result:**

- `john@example.com` → `https://i.pravatar.cc/150?u=john@example.com`
- Mỗi email sẽ có avatar riêng biệt
- Avatar consistent (cùng email = cùng avatar)

**Display trong UI:**

```html
<img [src]="user.imageUrl" [alt]="user.name" class="w-8 h-8 rounded-full" />
```

---

## 7. LOCALSTORAGE PERSISTENCE

### 7.1 Storage Structure

**LocalStorage Keys:**

1. **`app_users`** - User database

```json
[
  {
    "id": "uuid-1",
    "email": "john@example.com",
    "name": "John Doe",
    "imageUrl": "https://i.pravatar.cc/150?u=john@example.com",
    "password": "123456" // ⚠️ Plain text (demo only)
  },
  {
    "id": "uuid-2",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "imageUrl": "https://i.pravatar.cc/150?u=jane@example.com",
    "password": "password123"
  }
]
```

2. **`modern-store`** - Current app state

```json
{
  "wishlistItems": [...],
  "cartItems": [...],
  "user": {
    "id": "uuid-1",
    "email": "john@example.com",
    "name": "John Doe",
    "imageUrl": "https://i.pravatar.cc/150?u=john@example.com"
    // ⚠️ Không có password
  }
}
```

---

### 7.2 Storage Sync Flow

**Khi user sign up/sign in:**

```
store.signUp() / store.signIn()
    ↓
patchState(store, { user: newUser })
    ↓
withStorageSync() detect change
    ↓
localStorage.setItem('modern-store', JSON.stringify({
  wishlistItems: [...],
  cartItems: [...],
  user: { id, email, name, imageUrl }  // No password
}))
```

**Khi reload page:**

```
App khởi động
    ↓
EcommerceStore được khởi tạo
    ↓
withStorageSync() restore state
    ↓
const stored = localStorage.getItem('modern-store')
    ↓
if (stored) {
  const { wishlistItems, cartItems, user } = JSON.parse(stored)
  patchState(store, { wishlistItems, cartItems, user })
}
    ↓
User state được restore
    ↓
UI hiển thị user đã đăng nhập ✅
```

---

### 7.3 Storage Operations

**Read users:**

```typescript
const usersStr = localStorage.getItem('app_users');
const users: User[] = usersStr ? JSON.parse(usersStr) : [];
```

**Write users:**

```typescript
const users = [
  { id: '1', email: 'john@example.com', name: 'John', password: '123' },
  // ...
];
localStorage.setItem('app_users', JSON.stringify(users));
```

**Clear storage (logout all):**

```typescript
localStorage.removeItem('modern-store');
localStorage.removeItem('app_users');
```

---

## 8. PROTECTED ROUTES & CHECKOUT FLOW

### 8.1 Checkout Protection

**Scenario:** User muốn checkout nhưng chưa đăng nhập

**Flow:**

```
User ở trang /cart
    ↓
Click "Proceed to Checkout"
    ↓
Check store.user()
    ├─ undefined (not logged in)
    │   ↓
    │   matDialog.open(SignInDialogComponent, {
    │     data: { checkout: true }  // ← Flag quan trọng
    │   })
    │   ↓
    │   User sign in/sign up
    │   ↓
    │   store.signIn({ ..., checkout: true })
    │   ↓
    │   if (checkout) {
    │     router.navigate(['/checkout'])  // ← Auto navigate
    │   }
    │
    └─ User object (logged in)
        ↓
        router.navigate(['/checkout'])  // ← Direct navigate
```

---

### 8.2 Checkout Flag

**Purpose:** Preserve user intent khi chuyển giữa dialogs

**Example:**

```typescript
// User click "Proceed to Checkout" → Open Sign In
matDialog.open(SignInDialogComponent, {
  data: { checkout: true }
});

// User click "Sign up" trong Sign In dialog
openSignUpDialog() {
  this.dialogRef.close();
  this.matDialog.open(SignUpDialogComponent, {
    data: {
      checkout: this.data?.checkout  // ← Preserve flag
    }
  });
}

// Sau khi sign up thành công
store.signUp({
  // ...
  checkout: this.data?.checkout  // ← Pass to store
});

// Store sẽ navigate nếu checkout = true
if (checkout) {
  router.navigate(['/checkout']);
}
```

---

### 8.3 Implementation trong Store

**⚠️ Lưu ý:** Chức năng `proceedToCheckout()` hiện đang **DISABLED**

**Code (commented out):**

```typescript
// ❌ DISABLED: Checkout functionality
// proceedToCheckout: () => {
//   if (!store.user()) {
//     matDialog.open(SignInDialogComponent, {
//       disableClose: true,
//       data: {
//         checkout: true,
//       },
//     });
//     return;
//   }
//   router.navigate(['/checkout']);
// },
```

**Hiện tại:** User phải tự navigate to `/checkout` sau khi login

---

## 9. USER MENU & PROFILE

### 9.1 Header Actions Component

**File:** `layout/header-actions/header-actions.ts`

**Template:**

```html
<div class="flex items-center gap-2">
  <!-- Wishlist Button -->
  <button matIconButton routerLink="/wishlist" [matBadge]="store.wishlistCount()">
    <mat-icon>favorite</mat-icon>
  </button>

  <!-- Cart Button -->
  <button matIconButton routerLink="cart" [matBadge]="store.cartCount()">
    <mat-icon>shopping_cart</mat-icon>
  </button>

  <!-- User Menu (if logged in) -->
  @if(store.user(); as user) {
  <button matIconButton [matMenuTriggerFor]="userMenu">
    <img [src]="user.imageUrl" [alt]="user.name" class="w-8 h-8 rounded-full" />
  </button>

  <mat-menu #userMenu="matMenu" xPosition="before">
    <!-- User Info -->
    <div class="flex flex-col px-3 min-w-[200px] py-2">
      <span class="text-sm font-medium">{{ user.name }}</span>
      <span class="text-xs text-gray-500">{{ user.email }}</span>
    </div>

    <mat-divider class="mx-3"></mat-divider>

    <!-- Sign Out -->
    <button mat-menu-item (click)="store.signOut()">
      <mat-icon>logout</mat-icon>
      <span>Sign out</span>
    </button>
  </mat-menu>
  }

  <!-- Sign In/Sign Up Buttons (if not logged in) -->
  @else {
  <button matButton (click)="openSignInDialog()">Sign In</button>
  <button matButton="filled" (click)="openSignUpDialog()">Sign Up</button>
  }
</div>
```

---

### 9.2 User Menu Layout

```
┌─────────────────────────┐
│  [Avatar Image]         │ ← Trigger button
└────────┬────────────────┘
         ↓
    ┌────────────────────┐
    │ John Doe           │ ← User name
    │ john@example.com   │ ← Email
    ├────────────────────┤
    │ 🚪 Sign out        │ ← Action
    └────────────────────┘
```

---

### 9.3 Opening Auth Dialogs

**Component:**

```typescript
export class HeaderActions {
  store = inject(EcommerceStore);
  matDialog = inject(MatDialog);

  openSignInDialog() {
    this.matDialog.open(SignInDialogComponent, {
      disableClose: true, // User phải sign in hoặc close
    });
  }

  openSignUpDialog() {
    this.matDialog.open(SignUpDialogComponent, {
      disableClose: true,
    });
  }
}
```

**Usage:**

```html
<button matButton (click)="openSignInDialog()">Sign In</button>
<button matButton="filled" (click)="openSignUpDialog()">Sign Up</button>
```

---

## 10. SECURITY CONSIDERATIONS

### 10.1 ⚠️ Security Issues (DEMO ONLY)

**❌ Không nên làm trong Production:**

1. **Plain Text Passwords**

   ```typescript
   // ❌ BAD: Password không được hash
   localStorage.setItem(
     'app_users',
     JSON.stringify([{ email: 'john@example.com', password: '123456' }])
   );
   ```

   **✅ SHOULD:** Hash password với bcrypt/argon2

   ```typescript
   const hashedPassword = await bcrypt.hash(password, 10);
   ```

2. **Client-Side Storage**

   ```typescript
   // ❌ BAD: Sensitive data trong localStorage
   localStorage.setItem('app_users', ...);
   ```

   **✅ SHOULD:** Store users trong database (backend)

3. **No Token-Based Auth**

   ```typescript
   // ❌ BAD: Chỉ dựa vào user object trong state
   if (store.user()) {
     /* authenticated */
   }
   ```

   **✅ SHOULD:** JWT tokens, refresh tokens, session management

4. **No API Calls**

   ```typescript
   // ❌ BAD: Tất cả logic ở client
   const users = JSON.parse(localStorage.getItem('app_users'));
   ```

   **✅ SHOULD:** API calls to backend

   ```typescript
   const response = await fetch('/api/auth/login', {
     method: 'POST',
     body: JSON.stringify({ email, password }),
   });
   ```

5. **No CSRF Protection**
   - Không có CSRF tokens
   - Không có rate limiting
   - Không có brute force protection

---

### 10.2 Production Recommendations

**Backend Requirements:**

```
┌─────────────────────────────────────────────┐
│              BACKEND API                    │
├─────────────────────────────────────────────┤
│ POST /api/auth/register                     │
│   - Validate email uniqueness               │
│   - Hash password (bcrypt)                  │
│   - Store in database                       │
│   - Return JWT token                        │
│                                             │
│ POST /api/auth/login                        │
│   - Validate credentials                    │
│   - Compare hashed passwords                │
│   - Generate JWT token                      │
│   - Return token + user data                │
│                                             │
│ POST /api/auth/logout                       │
│   - Invalidate token                        │
│   - Clear session                           │
│                                             │
│ GET /api/auth/me                            │
│   - Verify JWT token                        │
│   - Return current user                     │
└─────────────────────────────────────────────┘
```

**Frontend Changes:**

```typescript
// ✅ GOOD: API-based authentication
async signIn(email: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const { token, user } = await response.json();

  // Store token in httpOnly cookie (backend sets this)
  // Or store in memory (not localStorage)
  patchState(store, { user, token });
}
```

**Security Headers:**

```typescript
// Set by backend
{
  'Content-Security-Policy': "default-src 'self'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Strict-Transport-Security': 'max-age=31536000'
}
```

---

### 10.3 Current Implementation Summary

**✅ Good for DEMO:**

- Quick setup, no backend needed
- Easy to understand flow
- Demonstrates UI/UX patterns
- Shows state management

**❌ NOT for Production:**

- No password hashing
- No secure storage
- No API integration
- No session management
- No CSRF protection
- No rate limiting

---

## 📊 TỔNG KẾT

### Authentication Features Implemented:

✅ **Sign Up Dialog**

- Reactive form với validation
- Email uniqueness check
- Auto-generated avatar
- Password confirmation field

✅ **Sign In Dialog**

- Email/password authentication
- Password visibility toggle
- Pre-filled demo credentials
- Form validation

✅ **User State Management**

- NgRx Signal Store
- Auto persist to localStorage
- Restore on page reload
- Reactive UI updates

✅ **User Menu**

- Avatar display
- User info (name, email)
- Sign out functionality

✅ **Protected Checkout**

- Checkout flag preservation
- Auto-navigate after login
- Dialog switching (Sign In ↔ Sign Up)

✅ **LocalStorage Persistence**

- User database (`app_users`)
- Current user state (`modern-store`)
- Auto sync on changes

### Technology Stack:

- **Angular Material Dialogs** - Modal authentication
- **Reactive Forms** - Form validation
- **NgRx Signals** - State management
- **LocalStorage** - Data persistence
- **Crypto API** - UUID generation
- **Pravatar** - Avatar generation

### Security Status:

⚠️ **DEMO ONLY** - Not production-ready

- Plain text passwords
- Client-side storage
- No token-based auth
- No backend API

---

**Tài liệu này mô tả chi tiết hệ thống Authentication từ UI components đến state management và data persistence.**
