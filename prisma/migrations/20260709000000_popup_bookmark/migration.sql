-- AlterTable: add popup fields to Post
ALTER TABLE `Post` ADD COLUMN `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
ALTER TABLE `Post` ADD COLUMN `endDate` DATETIME(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP(3) + INTERVAL 30 DAY);
ALTER TABLE `Post` ADD COLUMN `location` VARCHAR(191) NOT NULL DEFAULT '미정';
ALTER TABLE `Post` ADD COLUMN `category` ENUM('FASHION', 'FOOD', 'ART', 'LIFESTYLE', 'ETC') NOT NULL DEFAULT 'ETC';
ALTER TABLE `Post` ADD COLUMN `imageUrl` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `Post_category_idx` ON `Post`(`category`);
CREATE INDEX `Post_location_idx` ON `Post`(`location`);
CREATE INDEX `Post_startDate_endDate_idx` ON `Post`(`startDate`, `endDate`);

-- CreateTable
CREATE TABLE `Bookmark` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Bookmark_userId_idx`(`userId`),
    INDEX `Bookmark_postId_idx`(`postId`),
    UNIQUE INDEX `Bookmark_userId_postId_key`(`userId`, `postId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Bookmark` ADD CONSTRAINT `Bookmark_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `Post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
