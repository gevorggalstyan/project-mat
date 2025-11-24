CREATE TABLE `users` (
	`email` text PRIMARY KEY NOT NULL,
	`name` text,
	`source` text DEFAULT 'cloudflare' NOT NULL,
	`last_seen_at` integer,
	`created_at` integer
);
--> statement-breakpoint
CREATE INDEX `users_last_seen_idx` ON `users` (`last_seen_at`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_product_input_ports` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`version` text,
	`contract_id` text,
	`description` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_product_input_ports`("id", "product_id", "name", "version", "contract_id", "description", "order_index") SELECT "id", "product_id", "name", "version", "contract_id", "description", "order_index" FROM `product_input_ports`;--> statement-breakpoint
DROP TABLE `product_input_ports`;--> statement-breakpoint
ALTER TABLE `__new_product_input_ports` RENAME TO `product_input_ports`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `pip_product_idx` ON `product_input_ports` (`product_id`);--> statement-breakpoint
CREATE TABLE `__new_product_output_ports` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`version` text,
	`contract_id` text,
	`type` text,
	`description` text,
	`sbom` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_product_output_ports`("id", "product_id", "name", "version", "contract_id", "type", "description", "sbom", "order_index") SELECT "id", "product_id", "name", "version", "contract_id", "type", "description", "sbom", "order_index" FROM `product_output_ports`;--> statement-breakpoint
DROP TABLE `product_output_ports`;--> statement-breakpoint
ALTER TABLE `__new_product_output_ports` RENAME TO `product_output_ports`;--> statement-breakpoint
CREATE INDEX `pop_product_idx` ON `product_output_ports` (`product_id`);