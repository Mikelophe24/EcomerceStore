import { Component, computed, input, signal } from '@angular/core';
import { Product } from '../../models/products';

@Component({
  selector: 'app-products-grid',
  imports: [],
  template: `
    <div class="bg-gray-100 p-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ category() }}</h1>
    </div>

    <div class="responsive-grid">
      @for (product of filterProducts(); track product.id) {
      <div
        class="bg-white cursor-pointer rounded-xl shadow-lg overflow-hidden flex flex-col h-full"
      >
        <img [src]="product.imageUrl" class="w-full h-[300px] object-cover rounded-t-xl" />
      </div>
      }
    </div>
  `,
  styles: ``,
})
export default class ProductsGrid {
  category = input<string>('all');

  products = signal<Product[]>([
    {
      id: 'p1',
      name: 'Wireless Noise-Canceling Headphones',
      description:
        'Trải nghiệm âm thanh đỉnh cao với công nghệ chống ồn chủ động và thời lượng pin 30 giờ.',
      price: 299.99,
      imageUrl:
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviewCount: 120,
      inStock: true,
      category: 'electronics',
    },
    {
      id: 'p2',
      name: 'Smart Watch Series 7',
      description: 'Theo dõi sức khỏe toàn diện, đo nhịp tim, màn hình Retina luôn bật.',
      price: 399.0,
      imageUrl:
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviewCount: 85,
      inStock: true,
      category: 'electronics',
    },
    {
      id: 'p3',
      name: 'Ergonomic Office Chair',
      description: 'Ghế văn phòng thiết kế công thái học giúp bảo vệ cột sống khi làm việc lâu.',
      price: 159.5,
      imageUrl:
        'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=500&q=80',
      rating: 4.5,
      reviewCount: 45,
      inStock: true,
      category: 'furniture',
    },
    {
      id: 'p4',
      name: 'Mechanical Gaming Keyboard',
      description: 'Bàn phím cơ switch xanh, đèn LED RGB tùy chỉnh, độ bền 50 triệu lần nhấn.',
      price: 89.99,
      imageUrl:
        'https://images.unsplash.com/photo-1587829741301-dc798b91a91e?auto=format&fit=crop&w=500&q=80',
      rating: 4.6,
      reviewCount: 200,
      inStock: true,
      category: 'electronics',
    },
    {
      id: 'p5',
      name: 'Classic Leather Watch',
      description: 'Đồng hồ dây da cổ điển, mặt kính sapphire chống xước, thiết kế thanh lịch.',
      price: 120.0,
      imageUrl:
        'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      reviewCount: 310,
      inStock: false,
      category: 'fashion',
    },
    {
      id: 'p6',
      name: 'Running Sneakers',
      description: 'Giày chạy bộ siêu nhẹ, đế đệm khí êm ái, thoáng khí tối đa.',
      price: 75.0,
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
      rating: 4.3,
      reviewCount: 50,
      inStock: true,
      category: 'footwear',
    },
    {
      id: 'p7',
      name: 'Instant Film Camera',
      description: 'Máy ảnh chụp lấy ngay phong cách retro, lưu giữ khoảnh khắc tức thì.',
      price: 65.0,
      imageUrl:
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=500&q=80',
      rating: 4.4,
      reviewCount: 150,
      inStock: true,
      category: 'photography',
    },
    {
      id: 'p8',
      name: 'Designer Sunglasses',
      description: 'Kính râm thời trang chống tia UV400, gọng kim loại mạ vàng sang trọng.',
      price: 150.0,
      imageUrl:
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80',
      rating: 4.2,
      reviewCount: 22,
      inStock: true,
      category: 'accessories',
    },
    {
      id: 'p9',
      name: 'Vintage Leather Backpack',
      description: 'Balo da thật phong cách vintage, đựng vừa laptop 15 inch.',
      price: 110.0,
      imageUrl:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviewCount: 67,
      inStock: true,
      category: 'accessories',
    },
    {
      id: 'p10',
      name: 'Stainless Steel Water Bottle',
      description: 'Bình giữ nhiệt inox 304, giữ nóng 12h và giữ lạnh 24h.',
      price: 25.0,
      imageUrl:
        'https://images.unsplash.com/photo-1602143407151-01114192004e?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviewCount: 500,
      inStock: true,
      category: 'lifestyle',
    },
    {
      id: 'p11',
      name: 'Minimalist Desk Lamp',
      description: 'Đèn bàn LED chống cận, thiết kế tối giản, điều chỉnh độ sáng cảm ứng.',
      price: 45.0,
      imageUrl:
        'https://images.unsplash.com/photo-1507473888900-52e1ad154373?auto=format&fit=crop&w=500&q=80',
      rating: 4.1,
      reviewCount: 30,
      inStock: true,
      category: 'furniture',
    },
    {
      id: 'p12',
      name: 'Cotton Crew Neck T-Shirt',
      description: 'Áo thun 100% cotton cao cấp, thấm hút mồ hôi, co giãn 4 chiều.',
      price: 19.99,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=500&q=80',
      rating: 4.5,
      reviewCount: 1000,
      inStock: true,
      category: 'fashion',
    },
    {
      id: 'p13',
      name: 'Professional DSLR Camera',
      description: 'Máy ảnh kỹ thuật số chuyên nghiệp, cảm biến full-frame, quay video 4K.',
      price: 1200.0,
      imageUrl:
        'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=500&q=80',
      rating: 5.0,
      reviewCount: 12,
      inStock: false,
      category: 'photography',
    },
    {
      id: 'p14',
      name: 'Succulent Plant Pot',
      description: 'Chậu cây sen đá mini trang trí bàn làm việc, dễ chăm sóc.',
      price: 15.0,
      imageUrl:
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=500&q=80',
      rating: 4.6,
      reviewCount: 90,
      inStock: true,
      category: 'home&garden',
    },
    {
      id: 'p15',
      name: 'Denim Jacket',
      description: 'Áo khoác Jean phong cách bụi bặm, bền bỉ, dễ phối đồ.',
      price: 60.0,
      imageUrl:
        'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=500&q=80',
      rating: 4.3,
      reviewCount: 40,
      inStock: true,
      category: 'fashion',
    },
    {
      id: 'p16',
      name: 'Bluetooth Portable Speaker',
      description: 'Loa bluetooth chống nước IPX7, âm bass mạnh mẽ, pin 12h.',
      price: 55.0,
      imageUrl:
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80',
      rating: 4.7,
      reviewCount: 180,
      inStock: true,
      category: 'electronics',
    },
    {
      id: 'p17',
      name: 'High-Performance Laptop',
      description: 'Laptop mỏng nhẹ hiệu năng cao, chip M2, RAM 16GB, SSD 512GB.',
      price: 1499.0,
      imageUrl:
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=500&q=80',
      rating: 4.9,
      reviewCount: 55,
      inStock: true,
      category: 'electronics',
    },
    {
      id: 'p18',
      name: 'Yoga Mat',
      description: 'Thảm tập Yoga chống trượt, chất liệu TPE thân thiện môi trường.',
      price: 30.0,
      imageUrl:
        'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=500&q=80',
      rating: 4.4,
      reviewCount: 75,
      inStock: true,
      category: 'fitness',
    },
    {
      id: 'p19',
      name: 'Ceramic Coffee Mug',
      description: 'Cốc sứ làm thủ công, tráng men cao cấp, an toàn cho lò vi sóng.',
      price: 12.0,
      imageUrl:
        'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=500&q=80',
      rating: 4.2,
      reviewCount: 200,
      inStock: true,
      category: 'kitchen',
    },
    {
      id: 'p20',
      name: 'Drone with Camera',
      description: 'Flycam quay phim 4K, định vị GPS, tự động quay về khi mất sóng.',
      price: 450.0,
      imageUrl:
        'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=500&q=80',
      rating: 4.8,
      reviewCount: 25,
      inStock: true,
      category: 'electronics',
    },
  ]);

  filterProducts = computed(() =>
    this.products().filter((p) => p.category === this.category().toLowerCase())
  );
}
