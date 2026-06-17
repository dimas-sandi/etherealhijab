-- ==========================================
-- ETHEREALHIJAB DATABASE SETUP SCRIPT (MYSQL)
-- Compatible with Laragon, phpMyAdmin, and Staging Hosting
-- ==========================================

CREATE DATABASE IF NOT EXISTS `ethereal_hijab` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ethereal_hijab`;

-- ------------------------------------------
-- 1. Table User (Admin Credentials)
-- ------------------------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'ADMIN',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert default admin account (admin / admin123)
INSERT INTO `User` (`id`, `username`, `passwordHash`, `role`, `createdAt`, `updatedAt`) VALUES
(1, 'admin', '$2a$10$Xb/TY9yWbntVmlGu05REEOMzWWFz4QUcblMzQplwLkQ8MP1.iomH2', 'ADMIN', NOW(), NOW());


-- ------------------------------------------
-- 2. Table Product (Default Product List)
-- ------------------------------------------
DROP TABLE IF EXISTS `Product`;
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `description` TEXT NOT NULL,
    `material` VARCHAR(191) NOT NULL,
    `stock` INTEGER NOT NULL,
    `colors` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insert initial product entries mapping to the new categories list
INSERT INTO `Product` (`id`, `name`, `price`, `description`, `material`, `stock`, `colors`, `imageUrl`, `category`, `createdAt`, `updatedAt`) VALUES
(1, 'Ethereal Voal Square Premium', 85000, 'Hijab segi empat voal ultrafine premium yang tegak di dahi, tidak mudah lecek, halus, dan nyaman untuk penggunaan sehari-hari.', 'Voal Ultrafine', 50, 'Beige, Dusty Pink, Cream, Sage Green', 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&q=80&w=600', 'Hijab Segi Empat (Square)', NOW(), NOW()),
(2, 'Silk Pashmina Shimmer', 110000, 'Pashmina dengan kilau elegan yang memberikan kesan mewah. Tekstur jatuh, lembut, dan sangat anggun untuk acara formal.', 'Silk Shimmer', 30, 'Rose Gold, Mocca, Pearl White, Soft Lilac', 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=600', 'Pashmina', NOW(), NOW()),
(3, 'Bergo Maryam Instant Daily', 45000, 'Hijab instan daily bertali belakang dari bahan jersey premium yang dingin di kulit, menyerap keringat, dan menutup dada sempurna.', 'Jersey Premium', 80, 'Black, Navy, Dark Grey, Mocca', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&q=80&w=600', 'Hijab Instan', NOW(), NOW()),
(4, 'Pashmina Inner 2-in-1 Ethereal', 75000, 'Inovasi pashmina instan yang sudah menyatu dengan ciput/inner ninja premium di dalamnya. Praktis, rapi, dan anti geser.', 'Ceruty Babydoll & Jersey Knit', 40, 'Khaki, Caramel, Black, Soft Pink', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=600', 'Pashmina Instan (Pashmina Inner)', NOW(), NOW()),
(5, 'Turban Instant Pleated', 55000, 'Turban instan dengan detail lipatan pleated mewah yang rapi. Bahan elastis, sejuk, dan nyaman digunakan seharian tanpa pusing.', 'Cotton Ribbed Premium', 35, 'Maroon, Mocca, Black, Grey', 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=600', 'Turban', NOW(), NOW()),
(6, 'Sport Hijab Active Air', 60000, 'Hijab olahraga instan dengan sirkulasi udara maksimal. Bahan berpori halus yang sejuk, menyerap keringat, dan antilepek saat aktif bergerak.', 'DryFit Polyester Spandex', 60, 'Dark Grey, Black, Navy, Neon Pink', 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=600', 'Hijab Olahraga (Sport Hijab)', NOW(), NOW()),
(7, 'Ciput Rajut Anti Bingung', 20000, 'Ciput inner rajut premium yang elastis dan nyaman sepanjang hari tanpa menekan telinga. Mencegah hijab utama bergeser.', 'Soft Knit Yarn', 120, 'Black, Cream, Grey, Brown', 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=600', 'Ciput', NOW(), NOW());


-- ------------------------------------------
-- 3. Table Customer (Mock Shopper Accounts - Optional)
-- ------------------------------------------
DROP TABLE IF EXISTS `Customer`;
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'CREDENTIALS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Customer_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ------------------------------------------
-- 4. Table Order (Order Metadata)
-- ------------------------------------------
DROP TABLE IF EXISTS `Order`;
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` INTEGER NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `whatsapp` VARCHAR(191) NOT NULL,
    `address` TEXT NOT NULL,
    `city` VARCHAR(191) NULL,
    `totalAmount` DOUBLE NOT NULL,
    `discountAmount` DOUBLE NOT NULL DEFAULT 0,
    `notes` TEXT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `trackingNumber` VARCHAR(191) NULL,
    `promoCode` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ------------------------------------------
-- 5. Table OrderItem (Items purchased inside orders)
-- ------------------------------------------
DROP TABLE IF EXISTS `OrderItem`;
CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    `color` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;


-- ------------------------------------------
-- 6. Table CustomerData (Customer Surveys)
-- ------------------------------------------
DROP TABLE IF EXISTS `CustomerData`;
CREATE TABLE `CustomerData` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `age` INTEGER NOT NULL,
    `gender` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `preference` VARCHAR(191) NOT NULL,
    `budget` VARCHAR(191) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default survey analytics data
INSERT INTO `CustomerData` (`id`, `name`, `age`, `gender`, `city`, `preference`, `budget`, `frequency`, `createdAt`) VALUES
(1, 'Aminah', 22, 'Wanita', 'Jakarta', 'Hijab Segi Empat (Square)', 'IDR 100k - 200k', '2-3 kali', NOW()),
(2, 'Rania', 19, 'Wanita', 'Bandung', 'Pashmina', 'IDR 50k - 100k', '1 kali', NOW()),
(3, 'Khadijah', 28, 'Wanita', 'Surabaya', 'Hijab Instan', 'IDR 100k - 200k', '4-5 kali', NOW()),
(4, 'Fatimah', 31, 'Wanita', 'Medan', 'Pashmina Instan (Pashmina Inner)', 'Di atas IDR 200k', '2-3 kali', NOW()),
(5, 'Aisyah', 24, 'Wanita', 'Yogyakarta', 'Pashmina', 'IDR 50k - 100k', '2-3 kali', NOW()),
(6, 'Zulfa', 26, 'Wanita', 'Semarang', 'Ciput', 'Di bawah IDR 50k', '1 kali', NOW()),
(7, 'Hani', 33, 'Wanita', 'Jakarta', 'Hijab Instan', 'IDR 100k - 200k', '2-3 kali', NOW()),
(8, 'Laila', 21, 'Wanita', 'Makassar', 'Hijab Segi Empat (Square)', 'IDR 50k - 100k', '1 kali', NOW()),
(9, 'Salma', 23, 'Wanita', 'Bandung', 'Turban', 'IDR 100k - 200k', '4-5 kali', NOW()),
(10, 'Wardah', 29, 'Wanita', 'Surabaya', 'Hijab Olahraga (Sport Hijab)', 'Di atas IDR 200k', '4-5 kali', NOW());


-- ------------------------------------------
-- 7. Table Testimonial (Website Reviews)
-- ------------------------------------------
DROP TABLE IF EXISTS `Testimonial`;
CREATE TABLE `Testimonial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `review` TEXT NOT NULL,
    `rating` INTEGER NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed default reviews
INSERT INTO `Testimonial` (`id`, `name`, `review`, `rating`, `imageUrl`, `role`, `createdAt`) VALUES
(1, 'Sarah Amelia', 'Bahan voal square-nya bener-bener tegak di dahi dan lembut banget! Warnanya juga soft, sesuai ekspektasi.', 5, 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', 'Pelanggan Setia', NOW()),
(2, 'Nabila Putri', 'Pashmina inner 2-in-1 bener-bener ngebantu buat yang pengen sat-set! Ciputnya pas di kepala dan tidak menekan telinga.', 5, 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150', 'Customer', NOW()),
(3, 'Dian Lestari', 'Sport hijabnya adem dipakai pas lari pagi. Bahannya menyerap keringat dengan baik dan tetap rapi.', 5, 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150', 'Customer', NOW());


-- ------------------------------------------
-- Foreign Key Constraints & Relations
-- ------------------------------------------
ALTER TABLE `Order` ADD CONSTRAINT `Order_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
