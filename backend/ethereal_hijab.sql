-- EtherealHijab Database Schema & Seed Data
-- Compatible with MySQL (Laragon, phpMyAdmin, HeidiSQL, anymhost)

CREATE DATABASE IF NOT EXISTS `ethereal_hijab` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ethereal_hijab`;

-- --------------------------------------------------------
-- Table Structure: User (Admin accounts)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(191) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Product
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Product`;
CREATE TABLE `Product` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `price` DOUBLE NOT NULL,
  `description` TEXT NOT NULL,
  `material` VARCHAR(191) NOT NULL,
  `stock` INT NOT NULL,
  `colors` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Customer (Shoppers - Retired but kept for compatibility)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Customer`;
CREATE TABLE `Customer` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `passwordHash` VARCHAR(191) DEFAULT NULL,
  `name` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL DEFAULT 'CREDENTIALS',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Order
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `customerId` INT DEFAULT NULL,
  `customerName` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `whatsapp` VARCHAR(191) NOT NULL,
  `address` TEXT NOT NULL,
  `totalAmount` DOUBLE NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `paymentMethod` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
  `trackingNumber` VARCHAR(191) DEFAULT NULL,
  `promoCode` VARCHAR(191) DEFAULT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  CONSTRAINT `fk_order_customer` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: OrderItem
-- --------------------------------------------------------
DROP TABLE IF EXISTS `OrderItem`;
CREATE TABLE `OrderItem` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `orderId` INT NOT NULL,
  `productId` INT NOT NULL,
  `quantity` INT NOT NULL,
  `price` DOUBLE NOT NULL,
  CONSTRAINT `fk_item_order` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_item_product` FOREIGN KEY (`productId`) REFERENCES `Product` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: CustomerData (Surveys)
-- --------------------------------------------------------
DROP TABLE IF EXISTS `CustomerData`;
CREATE TABLE `CustomerData` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `age` INT NOT NULL,
  `gender` VARCHAR(191) NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `preference` VARCHAR(191) NOT NULL,
  `budget` VARCHAR(191) NOT NULL,
  `frequency` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Table Structure: Testimonial
-- --------------------------------------------------------
DROP TABLE IF EXISTS `Testimonial`;
CREATE TABLE `Testimonial` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `review` TEXT NOT NULL,
  `rating` INT NOT NULL,
  `imageUrl` VARCHAR(191) NOT NULL,
  `role` VARCHAR(191) DEFAULT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- Seeding: User (Admin login: admin / admin123)
-- --------------------------------------------------------
INSERT INTO `User` (`id`, `username`, `passwordHash`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2a$10$o3DozC9Xp3zG5Yn9oR/e3ujgA81J09pPjGf/mS808YV2bXUf5fWwG', 'ADMIN', NOW(3), NOW(3));

-- --------------------------------------------------------
-- Seeding: Products
-- --------------------------------------------------------
INSERT INTO `Product` (`id`, `name`, `price`, `description`, `material`, `stock`, `colors`, `imageUrl`, `category`, `createdAt`, `updatedAt`) VALUES
(1, 'Ethereal Voal Square Premium', 85000, 'Hijab segi empat voal ultrafine premium yang tegak di dahi, tidak mudah lecek, halus, dan nyaman untuk penggunaan sehari-hari.', 'Voal Ultrafine', 50, 'Beige, Dusty Pink, Cream, Sage Green', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600', 'Hijab Segi Empat (Square)', NOW(3), NOW(3)),
(2, 'Silk Pashmina Shimmer', 110000, 'Pashmina dengan kilau elegan yang memberikan kesan mewah. Tekstur jatuh, lembut, dan sangat anggun untuk acara formal.', 'Silk Shimmer', 30, 'Rose Gold, Mocca, Pearl White, Soft Lilac', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600', 'Pashmina', NOW(3), NOW(3)),
(3, 'Bergo Maryam Instant Daily', 45000, 'Hijab instan daily bertali belakang dari bahan jersey premium yang dingin di kulit, menyerap keringat, dan menutup dada sempurna.', 'Jersey Premium', 80, 'Black, Navy, Dark Grey, Mocca', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600', 'Hijab Instan', NOW(3), NOW(3)),
(4, 'Pashmina Inner 2-in-1 Ethereal', 75000, 'Inovasi pashmina instan yang sudah menyatu dengan ciput/inner ninja premium di dalamnya. Praktis, rapi, dan anti geser.', 'Ceruty Babydoll & Jersey Knit', 40, 'Khaki, Caramel, Black, Soft Pink', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600', 'Pashmina Instan (Pashmina Inner)', NOW(3), NOW(3)),
(5, 'Turban Instant Pleated', 55000, 'Turban instan dengan detail lipatan pleated mewah yang rapi. Bahan elastis, sejuk, dan nyaman digunakan seharian tanpa pusing.', 'Cotton Ribbed Premium', 35, 'Maroon, Mocca, Black, Grey', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', 'Turban', NOW(3), NOW(3)),
(6, 'Sport Hijab Active Air', 60000, 'Hijab olahraga instan dengan sirkulasi udara maksimal. Bahan berpori halus yang sejuk, menyerap keringat, dan antilepek saat aktif bergerak.', 'DryFit Polyester Spandex', 60, 'Dark Grey, Black, Navy, Neon Pink', 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600', 'Hijab Olahraga (Sport Hijab)', NOW(3), NOW(3)),
(7, 'Ciput Rajut Anti Bingung', 20000, 'Ciput inner rajut premium yang elastis dan nyaman sepanjang hari tanpa menekan telinga. Mencegah hijab utama bergeser.', 'Soft Knit Yarn', 120, 'Black, Cream, Grey, Brown', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600', 'Ciput', NOW(3), NOW(3));

-- --------------------------------------------------------
-- Seeding: Testimonials
-- --------------------------------------------------------
INSERT INTO `Testimonial` (`id`, `name`, `review`, `rating`, `imageUrl`, `role`, `createdAt`) VALUES
(1, 'Sarah Amelia', 'Bahan voal square-nya bener-bener tegak di dahi dan lembut banget! Warnanya juga soft, sesuai ekspektasi.', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 'Pelanggan Setia', NOW(3)),
(2, 'Nabila Putri', 'Pashmina inner 2-in-1 bener-bener ngebantu buat yang pengen sat-set! Ciputnya pas di kepala dan tidak menekan telinga.', 5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', 'Customer', NOW(3)),
(3, 'Dian Lestari', 'Sport hijabnya adem dipakai pas lari pagi. Bahannya menyerap keringat dengan baik dan tetap rapi.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', 'Customer', NOW(3));

-- --------------------------------------------------------
-- Seeding: CustomerData (Surveys)
-- --------------------------------------------------------
INSERT INTO `CustomerData` (`id`, `name`, `age`, `gender`, `city`, `preference`, `budget`, `frequency`, `createdAt`) VALUES
(1, 'Aminah', 22, 'Wanita', 'Jakarta', 'Hijab Segi Empat (Square)', 'IDR 100k - 200k', '2-3 kali', NOW(3)),
(2, 'Rania', 19, 'Wanita', 'Bandung', 'Pashmina', 'IDR 50k - 100k', '1 kali', NOW(3)),
(3, 'Khadijah', 28, 'Wanita', 'Surabaya', 'Hijab Instan', 'IDR 100k - 200k', '4-5 kali', NOW(3)),
(4, 'Fatimah', 31, 'Wanita', 'Medan', 'Pashmina Instan (Pashmina Inner)', 'Di atas IDR 200k', '2-3 kali', NOW(3)),
(5, 'Aisyah', 24, 'Wanita', 'Yogyakarta', 'Pashmina', 'IDR 50k - 100k', '2-3 kali', NOW(3)),
(6, 'Zulfa', 26, 'Wanita', 'Semarang', 'Ciput', 'Di bawah IDR 50k', '1 kali', NOW(3)),
(7, 'Hani', 33, 'Wanita', 'Jakarta', 'Hijab Instan', 'IDR 100k - 200k', '2-3 kali', NOW(3)),
(8, 'Laila', 21, 'Wanita', 'Makassar', 'Hijab Segi Empat (Square)', 'IDR 50k - 100k', '1 kali', NOW(3)),
(9, 'Salma', 23, 'Wanita', 'Bandung', 'Turban', 'IDR 100k - 200k', '4-5 kali', NOW(3)),
(10, 'Wardah', 29, 'Wanita', 'Surabaya', 'Hijab Olahraga (Sport Hijab)', 'Di atas IDR 200k', '4-5 kali', NOW(3));
