CREATE TABLE `avitoBin` (
	`url` text NOT NULL,
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`text` text NOT NULL,
	`price` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `avitoBin_url_unique` ON `avitoBin` (`url`);