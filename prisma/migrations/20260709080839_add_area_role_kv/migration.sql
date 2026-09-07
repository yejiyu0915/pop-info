-- AlterTable
ALTER TABLE `post` ADD COLUMN `area` ENUM('SEONGSU', 'HONGDAE', 'YONGSAN', 'SEOUL', 'GYEONGGI', 'INCHEON', 'ETC') NOT NULL DEFAULT 'ETC',
    ADD COLUMN `isKv` BOOLEAN NOT NULL DEFAULT false,
    ALTER COLUMN `startDate` DROP DEFAULT,
    ALTER COLUMN `endDate` DROP DEFAULT,
    ALTER COLUMN `location` DROP DEFAULT,
    ALTER COLUMN `category` DROP DEFAULT;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('USER', 'CREATOR', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX `Post_area_idx` ON `Post`(`area`);

-- CreateIndex
CREATE INDEX `Post_isKv_idx` ON `Post`(`isKv`);

-- Bootstrap existing users: id=1 ADMIN, others CREATOR
UPDATE `User` SET `role` = 'CREATOR' WHERE `id` > 1;
UPDATE `User` SET `role` = 'ADMIN' WHERE `id` = 1;
