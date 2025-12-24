import { computed, inject } from '@angular/core';
import { Product } from './models/products';
import {
  patchState,
  signalMethod,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { produce } from 'immer';
import { ToasterService } from './servives/toaster.service';
import { CartItem } from './models/cart';
import { MatDialog } from '@angular/material/dialog';
import { SignInDialogComponent } from './components/sign-in-dialog/sign-in-dialog.component';
import { SignInParams, SignUpParams, User } from './models/user';
import { Router, RouterLink } from '@angular/router';
import { Order } from './models/order';
import { withStorageSync } from '@angular-architects/ngrx-toolkit';

export type EcommerceState = {
  products: Product[];
  category: string;
  searchQuery: string;
  wishlistItems: Product[];
  cartItems: CartItem[];
  user: User | undefined;
  loading: boolean;

  selectedProductId: string | undefined;
  isSidebarOpen: boolean;
};

export const EcommerceStore = signalStore(
  {
    providedIn: 'root',
  },
  withState({
    products: [
      {
        id: 'p1',
        name: 'Wireless Noise-Canceling Headphones',
        description:
          'Trải nghiệm âm thanh đỉnh cao với công nghệ chống ồn chủ động và thời lượng pin 30 giờ.',
        price: 299.99,
        imageUrl:
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'electronics',
        reviews: [
          {
            id: 'r1',
            productId: 'p1',
            userName: 'John Doe',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
            rating: 5,
            title: 'Great product!',
            comment: 'I love these headphones. The noise canceling is amazing.',
            reviewDate: new Date('2023-10-15'),
          },
          {
            id: 'r2',
            productId: 'p1',
            userName: 'Jane Smith',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
            rating: 4,
            title: 'Good value',
            comment: 'Good sound quality for the price, but the ear cups are a bit small.',
            reviewDate: new Date('2023-11-20'),
          },
        ],
      },
      {
        id: 'p2',
        name: 'Smart Watch Series 7',
        description: 'Theo dõi sức khỏe toàn diện, đo nhịp tim, màn hình Retina luôn bật.',
        price: 399.0,
        imageUrl:
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'electronics',
        reviews: [
          {
            id: 'r3',
            productId: 'p2',
            userName: 'Alice Cooper',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704e',
            rating: 5,
            title: 'Amazing Watch',
            comment: 'Best smart watch I have ever used. Battery life is great.',
            reviewDate: new Date('2023-12-01'),
          },
          {
            id: 'r4',
            productId: 'p2',
            userName: 'Bob Marley',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704f',
            rating: 4,
            title: 'Very good',
            comment: 'Nice features, but a bit pricey.',
            reviewDate: new Date('2023-12-05'),
          },
          {
            id: 'r5',
            productId: 'p2',
            userName: 'Charlie Sheen',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704g',
            rating: 3,
            title: 'Average',
            comment: 'It is okay, nothing special.',
            reviewDate: new Date('2023-12-10'),
          },
          {
            id: 'r6',
            productId: 'p2',
            userName: 'Dave Grohl',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704h',
            rating: 4,
            title: 'Solid performance',
            comment: 'Works as expected. Good tracking.',
            reviewDate: new Date('2023-12-15'),
          },
          {
            id: 'r7',
            productId: 'p2',
            userName: 'Eve Online',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704i',
            rating: 2,
            title: 'Disappointed',
            comment: 'Stopped working after a week.',
            reviewDate: new Date('2023-12-20'),
          },
          {
            id: 'r8',
            productId: 'p2',
            userName: 'Frank Sinatra',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704j',
            rating: 4,
            title: 'Classy',
            comment: 'Looks good on my wrist.',
            reviewDate: new Date('2023-12-25'),
          },
        ],
      },
      {
        id: 'p3',
        name: 'Ergonomic Office Chair',
        description: 'Ghế văn phòng thiết kế công thái học giúp bảo vệ cột sống khi làm việc lâu.',
        price: 159.5,
        imageUrl:
          'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'furniture',
        reviews: [
          {
            id: 'r9',
            productId: 'p3',
            userName: 'Gary Oldman',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704k',
            rating: 5,
            title: 'So comfortable',
            comment: 'My back pain is gone since I started using this chair.',
            reviewDate: new Date('2023-11-12'),
          },
          {
            id: 'r10',
            productId: 'p3',
            userName: 'Helen Mirren',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704l',
            rating: 4,
            title: 'Great chair',
            comment: 'Very adjustable and comfortable.',
            reviewDate: new Date('2023-11-18'),
          },
        ],
      },
      {
        id: 'p5',
        name: 'Classic Leather Watch',
        description: 'Đồng hồ dây da cổ điển, mặt kính sapphire chống xước, thiết kế thanh lịch.',
        price: 120.0,
        imageUrl:
          'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80',
        inStock: false,
        category: 'fashion',
        reviews: [
          {
            id: 'r11',
            productId: 'p5',
            userName: 'Ian McKellen',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704m',
            rating: 5,
            title: 'Timeless',
            comment: 'Simple, elegant, and perfect for any occasion.',
            reviewDate: new Date('2023-10-05'),
          },
          {
            id: 'r12',
            productId: 'p5',
            userName: 'Jack Nicholson',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704n',
            rating: 5,
            title: 'Love it',
            comment: 'Can not stop looking at it.',
            reviewDate: new Date('2023-10-12'),
          },
        ],
      },
      {
        id: 'p6',
        name: 'Running Sneakers',
        description: 'Giày chạy bộ siêu nhẹ, đế đệm khí êm ái, thoáng khí tối đa.',
        price: 75.0,
        imageUrl:
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'footwear',
        reviews: [
          {
            id: 'r13',
            productId: 'p6',
            userName: 'Kevin Spacey',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704o',
            rating: 4,
            title: 'Lightweight',
            comment: 'Feels like running on clouds.',
            reviewDate: new Date('2023-09-22'),
          },
          {
            id: 'r14',
            productId: 'p6',
            userName: 'Leonardo DiCaprio',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704p',
            rating: 5,
            title: 'Best runners',
            comment: 'Ran a marathon in these, no issues.',
            reviewDate: new Date('2023-09-30'),
          },
        ],
      },
      {
        id: 'p7',
        name: 'Instant Film Camera',
        description: 'Máy ảnh chụp lấy ngay phong cách retro, lưu giữ khoảnh khắc tức thì.',
        price: 65.0,
        imageUrl:
          'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'photography',
        reviews: [
          {
            id: 'r15',
            productId: 'p7',
            userName: 'Meryl Streep',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704q',
            rating: 4,
            title: 'Fun camera',
            comment: 'Great for parties and events.',
            reviewDate: new Date('2023-08-15'),
          },
          {
            id: 'r16',
            productId: 'p7',
            userName: 'Natalie Portman',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704r',
            rating: 5,
            title: 'Vintage vibes',
            comment: 'Love the aesthetic of the photos.',
            reviewDate: new Date('2023-08-20'),
          },
        ],
      },
      {
        id: 'p8',
        name: 'Designer Sunglasses',
        description: 'Kính râm thời trang chống tia UV400, gọng kim loại mạ vàng sang trọng.',
        price: 150.0,
        imageUrl:
          'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'accessories',
        reviews: [
          {
            id: 'r17',
            productId: 'p8',
            userName: 'Oprah Winfrey',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704s',
            rating: 4,
            title: 'Stylish',
            comment: 'Look expensive but affordable.',
            reviewDate: new Date('2023-07-10'),
          },
          {
            id: 'r18',
            productId: 'p8',
            userName: 'Paul McCartney',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704t',
            rating: 5,
            title: 'Cool shades',
            comment: 'Fit perfectly and block the sun well.',
            reviewDate: new Date('2023-07-18'),
          },
        ],
      },
      {
        id: 'p9',
        name: 'Vintage Leather Backpack',
        description: 'Balo da thật phong cách vintage, đựng vừa laptop 15 inch.',
        price: 110.0,
        imageUrl:
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'accessories',
        reviews: [
          {
            id: 'r19',
            productId: 'p9',
            userName: 'Quentin Tarantino',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704u',
            rating: 5,
            title: 'High quality leather',
            comment: 'Smells great and looks even better.',
            reviewDate: new Date('2023-06-05'),
          },
          {
            id: 'r20',
            productId: 'p9',
            userName: 'Robert De Niro',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704v',
            rating: 4,
            title: 'Spacious',
            comment: 'Fits everything I need for work.',
            reviewDate: new Date('2023-06-12'),
          },
        ],
      },
      {
        id: 'p12',
        name: 'Cotton Crew Neck T-Shirt',
        description: 'Áo thun 100% cotton cao cấp, thấm hút mồ hôi, co giãn 4 chiều.',
        price: 19.99,
        imageUrl:
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'fashion',
        reviews: [
          {
            id: 'r21',
            productId: 'p12',
            userName: 'Samuel L. Jackson',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704w',
            rating: 5,
            title: 'Perfect fit',
            comment: 'Softest t-shirt I own.',
            reviewDate: new Date('2023-05-20'),
          },
          {
            id: 'r22',
            productId: 'p12',
            userName: 'Tom Hanks',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704x',
            rating: 4,
            title: 'Good basic',
            comment: 'Shrunk a little in the wash, but still good.',
            reviewDate: new Date('2023-05-25'),
          },
        ],
      },
      {
        id: 'p13',
        name: 'Professional DSLR Camera',
        description: 'Máy ảnh kỹ thuật số chuyên nghiệp, cảm biến full-frame, quay video 4K.',
        price: 1200.0,
        imageUrl:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
        inStock: false,
        category: 'photography',
        reviews: [
          {
            id: 'r23',
            productId: 'p13',
            userName: 'Uma Thurman',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704y',
            rating: 5,
            title: 'Professional quality',
            comment: 'Worth every penny for the image quality.',
            reviewDate: new Date('2023-04-10'),
          },
        ],
      },
      {
        id: 'p14',
        name: 'Succulent Plant Pot',
        description: 'Chậu cây sen đá mini trang trí bàn làm việc, dễ chăm sóc.',
        price: 15.0,
        imageUrl:
          'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'home',
        reviews: [
          {
            id: 'r24',
            productId: 'p14',
            userName: 'Viola Davis',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704z',
            rating: 5,
            title: 'So cute',
            comment: 'Adds a nice touch to my desk.',
            reviewDate: new Date('2023-03-15'),
          },
          {
            id: 'r25',
            productId: 'p14',
            userName: 'Will Smith',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705a',
            rating: 4,
            title: 'Nice pot',
            comment: 'Smaller than I expected but nice.',
            reviewDate: new Date('2023-03-20'),
          },
        ],
      },
      {
        id: 'p15',
        name: 'Denim Jacket',
        description: 'Áo khoác Jean phong cách bụi bặm, bền bỉ, dễ phối đồ.',
        price: 60.0,
        imageUrl:
          'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'fashion',
        reviews: [
          {
            id: 'r26',
            productId: 'p15',
            userName: 'Xena Warrior',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705b',
            rating: 4,
            title: 'Classic denim',
            comment: 'Goes with everything.',
            reviewDate: new Date('2023-02-28'),
          },
          {
            id: 'r27',
            productId: 'p15',
            userName: 'Yoda Master',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705c',
            rating: 5,
            title: 'Good quality',
            comment: 'Thick denim, well made.',
            reviewDate: new Date('2023-02-25'),
          },
        ],
      },
      {
        id: 'p16',
        name: 'Bluetooth Portable Speaker',
        description: 'Loa bluetooth chống nước IPX7, âm bass mạnh mẽ, pin 12h.',
        price: 55.0,
        imageUrl:
          'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'electronics',
        reviews: [
          {
            id: 'r28',
            productId: 'p16',
            userName: 'Zendaya Coleman',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705d',
            rating: 5,
            title: 'Booming bass',
            comment: 'Surprisingly loud for its size.',
            reviewDate: new Date('2023-01-15'),
          },
          {
            id: 'r29',
            productId: 'p16',
            userName: 'Adam Sandler',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705e',
            rating: 4,
            title: 'Good battery',
            comment: 'Lasts all day at the beach.',
            reviewDate: new Date('2023-01-20'),
          },
        ],
      },
      {
        id: 'p17',
        name: 'High-Performance Laptop',
        description: 'Laptop mỏng nhẹ hiệu năng cao, chip M2, RAM 16GB, SSD 512GB.',
        price: 1499.0,
        imageUrl:
          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'electronics',
        reviews: [
          {
            id: 'r30',
            productId: 'p17',
            userName: 'Brad Pitt',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705f',
            rating: 5,
            title: 'Beast machine',
            comment: 'Handles 4K video editing like a breeze.',
            reviewDate: new Date('2023-01-05'),
          },
          {
            id: 'r31',
            productId: 'p17',
            userName: 'Cate Blanchett',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705g',
            rating: 5,
            title: 'Beautiful display',
            comment: 'The colors are incredible.',
            reviewDate: new Date('2023-01-10'),
          },
        ],
      },
      {
        id: 'p18',
        name: 'Yoga Mat',
        description: 'Thảm tập Yoga chống trượt, chất liệu TPE thân thiện môi trường.',
        price: 30.0,
        imageUrl:
          'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'fitness',
        reviews: [
          {
            id: 'r32',
            productId: 'p18',
            userName: 'Denzel Washington',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705h',
            rating: 5,
            title: 'Non-slip',
            comment: 'Really good grip even when sweaty.',
            reviewDate: new Date('2022-12-15'),
          },
          {
            id: 'r33',
            productId: 'p18',
            userName: 'Emma Stone',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705i',
            rating: 4,
            title: 'Nice color',
            comment: 'Love the purple color.',
            reviewDate: new Date('2022-12-20'),
          },
        ],
      },
      {
        id: 'p19',
        name: 'Ceramic Coffee Mug',
        description: 'Cốc sứ làm thủ công, tráng men cao cấp, an toàn cho lò vi sóng.',
        price: 12.0,
        imageUrl:
          'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'kitchen',
        reviews: [
          {
            id: 'r34',
            productId: 'p19',
            userName: 'George Clooney',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705j',
            rating: 5,
            title: 'Beautiful mug',
            comment: 'Makes my morning coffee taste better.',
            reviewDate: new Date('2022-11-25'),
          },
          {
            id: 'r35',
            productId: 'p19',
            userName: 'Halle Berry',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705k',
            rating: 4,
            title: 'Sturdy',
            comment: 'Feels heavy and durable.',
            reviewDate: new Date('2022-11-30'),
          },
        ],
      },
      {
        id: 'p20',
        name: 'Drone with Camera',
        description: 'Flycam quay phim 4K, định vị GPS, tự động quay về khi mất sóng.',
        price: 450.0,
        imageUrl:
          'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=500&q=80',
        inStock: true,
        category: 'electronics',
        reviews: [
          {
            id: 'r36',
            productId: 'p20',
            userName: 'Idris Elba',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705l',
            rating: 5,
            title: 'Best drone',
            comment: 'Very stable footage and easy to fly.',
            reviewDate: new Date('2022-10-10'),
          },
          {
            id: 'r37',
            productId: 'p20',
            userName: 'Jennifer Lawrence',
            userImageUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026705m',
            rating: 5,
            title: 'Amazing range',
            comment: 'Flew it 5km away with no signal loss.',
            reviewDate: new Date('2022-10-15'),
          },
        ],
      },
    ],
    category: 'all',
    searchQuery: '',
    wishlistItems: [],
    cartItems: [],
    user: undefined,
    loading: false,
    selectedProductId: undefined,
    isSidebarOpen: true,
  } as EcommerceState),
  withStorageSync({
    key: 'modern-store',
    select: ({ wishlistItems, cartItems, user }) => ({ wishlistItems, cartItems, user }),
  }),

  withComputed(
    ({ category, products, searchQuery, wishlistItems, cartItems, selectedProductId }) => ({
      filteredProducts: computed(() => {
        let filtered = products();

        // Filter by category
        if (category() !== 'all') {
          filtered = filtered.filter((p) => p.category === category().toLowerCase());
        }

        // Filter by search query
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
      selectedProduct: computed(() => products().find((p) => p.id === selectedProductId())),
    })
  ),

  withMethods(
    (
      store,
      toaster = inject(ToasterService),
      matDialog = inject(MatDialog),
      router = inject(Router)
    ) => ({
      setCategory: signalMethod<string>((category: string) => {
        patchState(store, { category });
      }),

      setSearchQuery: signalMethod<string>((searchQuery: string) => {
        patchState(store, { searchQuery });
      }),

      setProductId: signalMethod<string>((productId: string) => {
        patchState(store, { selectedProductId: productId });
      }),

      toggleSidebar: () => {
        patchState(store, { isSidebarOpen: !store.isSidebarOpen() });
      },

      addToWishlish(product: Product) {
        const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
          if (!draft.find((p) => p.id === product.id)) {
            draft.push(product);
          }
        });

        patchState(store, { wishlistItems: updatedWishlistItems });
        toaster.success('Product added to wishlish');
      },

      removeFromWishlist: (product: Product) => {
        patchState(store, {
          wishlistItems: store.wishlistItems().filter((p) => p.id !== product.id),
        });
        toaster.success('Product removed from wishlist');
      },

      addToCart: (product: Product, quantity = 1) => {
        const existingItemIndex = store.cartItems().findIndex((i) => i.product.id === product.id);

        const updatedCartItems = produce(store.cartItems(), (draft) => {
          if (existingItemIndex !== -1) {
            draft[existingItemIndex].quantity += quantity;
            return;
          }
          draft.push({
            product,
            quantity,
          });
        });
        const updatedWishlistItems = store.wishlistItems().filter((p) => p.id !== product.id);

        patchState(store, {
          cartItems: updatedCartItems,
          wishlistItems: updatedWishlistItems, // Clear from wishlist
        });

        toaster.success(
          existingItemIndex !== -1 ? 'Product quantity increased' : 'Product moved to cart'
        );
      },

      setItemQuantity(params: { productId: string; quantity: number }) {
        const cartItems = store.cartItems();
        const index = cartItems.findIndex((i) => i.product.id === params.productId);
        if (index === -1 || params.quantity < 0) return; // Guard clause

        const updated = produce(cartItems, (draft) => {
          draft[index].quantity = params.quantity;
        });
        patchState(store, { cartItems: updated });
      },

      addAllWishlistToCart: () => {
        const updatedCartItems = produce(store.cartItems(), (draft) => {
          store.wishlistItems().forEach((p) => {
            if (!draft.find((i) => i.product.id === p.id)) {
              draft.push({ product: p, quantity: 1 } as CartItem);
            }
          });
        });
        patchState(store, { cartItems: updatedCartItems, wishlistItems: [] });
      },

      moveToWishlist: (product: Product) => {
        const updatedCartItems = store.cartItems().filter((p) => p.product.id !== product.id);
        const updatedWishlistItems = produce(store.wishlistItems(), (draft) => {
          if (!draft.find((i) => i.id === product.id)) {
            draft.push(product);
          }
        });
        patchState(store, { cartItems: updatedCartItems, wishlistItems: updatedWishlistItems });
      },
      removeFromCart: (product: Product) => {
        patchState(store, {
          cartItems: store.cartItems().filter((p) => p.product.id !== product.id),
        });
      },

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

      signUp({ email, password, name, dialogId }: SignUpParams) {
        const usersStr = localStorage.getItem('app_users');
        const users: User[] = usersStr ? JSON.parse(usersStr) : [];

        if (users.find((u) => u.email === email)) {
          toaster.error('User already exists');
          return false;
        }

        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          name,
          imageUrl: 'https://i.pravatar.cc/150?u=' + email, // Dynamic avatar
        };

        // In a real app, we would hash the password. storing plain text for demo.
        const usersWithPassword = [
          ...(usersStr ? JSON.parse(usersStr) : []),
          { ...newUser, password },
        ];
        localStorage.setItem('app_users', JSON.stringify(usersWithPassword));

        // ❌ KHÔNG tự động đăng nhập
        // patchState(store, { user: newUser });

        matDialog.getDialogById(dialogId)?.close();
        toaster.success('Account created successfully! Please sign in.');

        return true; // Return success flag
      },

      signIn({ email, password, checkout, dialogId }: SignInParams) {
        const usersStr = localStorage.getItem('app_users');
        const users: any[] = usersStr ? JSON.parse(usersStr) : [];

        const foundUser = users.find((u) => u.email === email && u.password === password);

        if (foundUser) {
          const { password, ...userWithoutPassword } = foundUser;
          patchState(store, {
            user: userWithoutPassword,
          });

          matDialog.getDialogById(dialogId)?.close();

          if (checkout) {
            router.navigate(['/checkout']);
          }
          toaster.success('Signed in successfully');
        } else {
          toaster.error('Invalid email or password');
        }
      },

      // ❌ DISABLED: Place order functionality
      // placeOrder: async () => {
      //   patchState(store, { loading: true });

      //   const user = store.user();
      //   if (!user) {
      //     toaster.error('Please login before placing order');
      //     patchState(store, { loading: false });
      //     return;
      //   }

      //   const order: Order = {
      //     id: crypto.randomUUID(),
      //     userId: user.id,
      //     total: Math.round(
      //       store.cartItems().reduce((acc, item) => acc + item.quantity * item.product.price, 0)
      //     ),
      //     items: store.cartItems(),
      //     paymentStatus: 'success',
      //   };

      //   await new Promise((resolve) => setTimeout(resolve, 1000));

      //   patchState(store, { loading: false, cartItems: [] });
      //   router.navigate(['order-success']);
      // },

      signOut: () => {
        patchState(store, { user: undefined });
      },

      // ❌ DISABLED: Submit review functionality
      // submitReview: signalMethod<{
      //   productId: string;
      //   title: string;
      //   rating: number;
      //   comment: string;
      // }>((params) => {
      //   const user = store.user();
      //   if (!user) {
      //     toaster.error('Please sign in to submit a review');
      //     return;
      //   }

      //   const products = store.products();
      //   const productIndex = products.findIndex((p) => p.id === params.productId);
      //   if (productIndex === -1) {
      //     toaster.error('Product not found');
      //     return;
      //   }

      //   const updatedProducts = produce(products, (draft) => {
      //     const newReview = {
      //       id: crypto.randomUUID(),
      //       productId: params.productId,
      //       userName: user.name,
      //       userImageUrl: user.imageUrl,
      //       rating: params.rating,
      //       title: params.title,
      //       comment: params.comment,
      //       reviewDate: new Date(),
      //     };

      //     draft[productIndex].reviews.push(newReview);

      //     // Update product rating and review count
      //     const reviews = draft[productIndex].reviews;
      //     const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      //     draft[productIndex].rating = Number((sum / reviews.length).toFixed(1));
      //     draft[productIndex].reviewCount = reviews.length;
      //   });

      //   patchState(store, { products: updatedProducts });
      // }),
    })
  )
);
