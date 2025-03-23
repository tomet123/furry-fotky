CREATE TABLE `account` (
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	PRIMARY KEY(`provider`, `providerAccountId`),
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`sessionToken` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text NOT NULL,
	`emailVerified` integer,
	`image` text,
	`username` text NOT NULL,
	`password_hash` text,
	`is_admin` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE TABLE `verificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`organizer_id` text NOT NULL,
	`description` text,
	`location` text NOT NULL,
	`date` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`organizer_id`) REFERENCES `organizers`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE TABLE `organizers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bio` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `organizers_user_id_unique` ON `organizers` (`user_id`);--> statement-breakpoint
CREATE TABLE `photo_likes` (
	`user_id` text NOT NULL,
	`photo_id` text NOT NULL,
	`created_at` integer,
	PRIMARY KEY(`user_id`, `photo_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `photo_tags` (
	`photo_id` text NOT NULL,
	`tag_id` text NOT NULL,
	`created_at` integer,
	PRIMARY KEY(`photo_id`, `tag_id`),
	FOREIGN KEY (`photo_id`) REFERENCES `photos`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `photographers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`bio` text,
	`description` text,
	`is_beginner` integer DEFAULT true NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `photographers_user_id_unique` ON `photographers` (`user_id`);--> statement-breakpoint
CREATE TABLE `photos` (
	`id` text PRIMARY KEY NOT NULL,
	`photographer_id` text NOT NULL,
	`event_id` text,
	`storage_id` text NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`date` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`photographer_id`) REFERENCES `photographers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`storage_id`) REFERENCES `storage_photos`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE TABLE `storage_photos` (
	`id` text PRIMARY KEY NOT NULL,
	`file_data` blob NOT NULL,
	`thumbnail_data` blob NOT NULL,
	`content_type` text NOT NULL,
	`original_name` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `storage_profile_pictures` (
	`id` text PRIMARY KEY NOT NULL,
	`file_data` blob NOT NULL,
	`thumbnail_data` blob NOT NULL,
	`content_type` text NOT NULL,
	`original_name` text NOT NULL,
	`user_id` text,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
