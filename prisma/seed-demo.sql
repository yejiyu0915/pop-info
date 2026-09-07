-- Demo-only popup data for an empty development or showcase database.
-- It never contains a usable login password. Run with:
-- docker compose --env-file .env -f docker-compose.prod.yml exec -T db \
--   mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" < prisma/seed-demo.sql

INSERT INTO `User` (`email`, `password`, `name`, `role`, `updatedAt`)
VALUES (
  'demo-editor@pop-info.local',
  '$2b$12$0O8jInvyqzn4UrFniO.KoeQVeXlmgbAqFAjz8Cd.vKFEDc4MB6uwe',
  'POP IN 편집부',
  'CREATOR',
  NOW(3)
)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`), `role` = 'CREATOR', `updatedAt` = NOW(3);

SET @demo_author_id := (SELECT `id` FROM `User` WHERE `email` = 'demo-editor@pop-info.local');
SET @demo_image := 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=1200&q=85';

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'MORNING CLUB : 서울의 느린 아침', '커피, 음악, 작은 오브제로 채운 주말 팝업입니다. 현장 한정 굿즈와 포토존을 준비했어요.', '2026-09-05 11:00:00', '2026-09-20 20:00:00', '성수 연무장길 23', 'SEONGSU', 'LIFESTYLE', @demo_image, TRUE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'MORNING CLUB : 서울의 느린 아침');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'FRESH MARKET WEEKEND', '주말 동안 만나는 로컬 푸드 마켓. 베이커리와 음료를 편하게 즐겨보세요.', '2026-09-07 10:30:00', '2026-09-14 19:00:00', '성수이로 78', 'SEONGSU', 'FOOD', @demo_image, TRUE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'FRESH MARKET WEEKEND');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'COLOR ARCHIVE 전시 팝업', '색을 수집하는 브랜드의 아카이브 전시. 자유 관람으로 진행됩니다.', '2026-09-10 12:00:00', '2026-09-28 20:00:00', '연남로 42', 'HONGDAE', 'ART', @demo_image, TRUE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'COLOR ARCHIVE 전시 팝업');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'STUDIO NOTE : 가을의 질감', '이번 계절의 새로운 소재를 직접 보고 만질 수 있는 체험형 쇼룸입니다.', '2026-09-12 11:00:00', '2026-10-04 19:00:00', '한남대로 91', 'YONGSAN', 'FASHION', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'STUDIO NOTE : 가을의 질감');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'ONE DAY CERAMIC TABLE', '작은 식기와 오브제를 소개하는 하루짜리 테이블 마켓입니다.', '2026-09-13 12:00:00', '2026-09-13 18:00:00', '문래로 17', 'SEOUL', 'LIFESTYLE', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'ONE DAY CERAMIC TABLE');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'GREEN ROOM RECORDS', '독립 레이블의 리스닝 세션과 한정 음반을 함께 만나보세요.', '2026-09-15 13:00:00', '2026-09-26 21:00:00', '서교동 365-4', 'HONGDAE', 'ART', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'GREEN ROOM RECORDS');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'SLOW BAKERY POP-UP', '매일 다른 라인업으로 준비되는 구움과자와 커피를 소개합니다.', '2026-09-18 10:00:00', '2026-09-30 18:00:00', '망원로 6길 36', 'SEOUL', 'FOOD', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'SLOW BAKERY POP-UP');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'NICE WEATHER CLUB', '가벼운 산책과 휴식을 위한 라이프스타일 셀렉트 팝업입니다.', '2026-09-20 11:00:00', '2026-10-11 20:00:00', '잠실 롯데월드몰 1층', 'SEOUL', 'LIFESTYLE', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'NICE WEATHER CLUB');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'AFTER SCHOOL : 오브제 편집숍', '신진 작가의 포스터, 문구, 생활 소품을 한자리에서 보여드립니다.', '2026-09-22 12:00:00', '2026-10-05 19:00:00', '인천 중구 개항로 55', 'INCHEON', 'ETC', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'AFTER SCHOOL : 오브제 편집숍');

INSERT INTO `Post` (`title`, `content`, `startDate`, `endDate`, `location`, `area`, `category`, `imageUrl`, `isKv`, `authorId`, `updatedAt`)
SELECT 'WEEKEND PICTURE BOOKS', '좋아하는 그림책을 고르고, 조용히 읽을 수 있는 작은 공간입니다.', '2026-09-25 11:00:00', '2026-10-18 18:00:00', '수원 행궁로 47', 'GYEONGGI', 'ART', @demo_image, FALSE, @demo_author_id, NOW(3)
WHERE NOT EXISTS (SELECT 1 FROM `Post` WHERE `title` = 'WEEKEND PICTURE BOOKS');
