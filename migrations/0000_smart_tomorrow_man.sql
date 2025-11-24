CREATE TABLE `contract_quality_rules` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_object_id` text,
	`schema_property_id` text,
	`type` text DEFAULT 'library' NOT NULL,
	`name` text,
	`description` text,
	`rule` text,
	`operators` text,
	`query` text,
	`engine` text,
	`implementation` text,
	`dimension` text,
	`severity` text,
	`business_impact` text,
	`unit` text,
	`valid_values` text,
	`scheduler` text,
	`schedule` text,
	FOREIGN KEY (`schema_object_id`) REFERENCES `contract_schema_objects`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`schema_property_id`) REFERENCES `contract_schema_properties`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cqr_object_idx` ON `contract_quality_rules` (`schema_object_id`);--> statement-breakpoint
CREATE INDEX `cqr_property_idx` ON `contract_quality_rules` (`schema_property_id`);--> statement-breakpoint
CREATE TABLE `contract_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`role` text NOT NULL,
	`description` text,
	`access` text,
	`first_level_approvers` text,
	`second_level_approvers` text,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cr_contract_idx` ON `contract_roles` (`contract_id`);--> statement-breakpoint
CREATE TABLE `contract_schema_objects` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`name` text NOT NULL,
	`logical_type` text DEFAULT 'object' NOT NULL,
	`physical_type` text,
	`physical_name` text,
	`business_name` text,
	`description` text,
	`data_granularity_description` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cso_contract_idx` ON `contract_schema_objects` (`contract_id`);--> statement-breakpoint
CREATE TABLE `contract_schema_properties` (
	`id` text PRIMARY KEY NOT NULL,
	`schema_object_id` text NOT NULL,
	`parent_property_id` text,
	`name` text NOT NULL,
	`logical_type` text,
	`physical_type` text,
	`physical_name` text,
	`business_name` text,
	`description` text,
	`required` integer DEFAULT false,
	`unique` integer DEFAULT false,
	`primary_key` integer DEFAULT false,
	`primary_key_position` integer DEFAULT -1,
	`partitioned` integer DEFAULT false,
	`partition_key_position` integer DEFAULT -1,
	`classification` text,
	`encrypted_name` text,
	`critical_data_element` integer DEFAULT false,
	`transform_source_objects` text,
	`transform_logic` text,
	`transform_description` text,
	`examples` text,
	`logical_type_options` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`schema_object_id`) REFERENCES `contract_schema_objects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `csp_object_idx` ON `contract_schema_properties` (`schema_object_id`);--> statement-breakpoint
CREATE INDEX `csp_parent_idx` ON `contract_schema_properties` (`parent_property_id`);--> statement-breakpoint
CREATE TABLE `contract_servers` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`server` text NOT NULL,
	`type` text NOT NULL,
	`description` text,
	`environment` text,
	`server_config` text,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `cs_contract_idx` ON `contract_servers` (`contract_id`);--> statement-breakpoint
CREATE TABLE `contract_sla_properties` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`property` text NOT NULL,
	`value` text NOT NULL,
	`value_ext` text,
	`unit` text,
	`element` text,
	`driver` text,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `csla_contract_idx` ON `contract_sla_properties` (`contract_id`);--> statement-breakpoint
CREATE TABLE `contract_support_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`channel` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`tool` text,
	`scope` text,
	`invitation_url` text,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `csc_contract_idx` ON `contract_support_channels` (`contract_id`);--> statement-breakpoint
CREATE TABLE `contract_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ct_contract_idx` ON `contract_tags` (`contract_id`);--> statement-breakpoint
CREATE INDEX `ct_tag_idx` ON `contract_tags` (`tag`);--> statement-breakpoint
CREATE TABLE `contract_team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`contract_id` text NOT NULL,
	`username` text NOT NULL,
	`name` text,
	`role` text,
	`description` text,
	`date_in` integer,
	`date_out` integer,
	`replaced_by_username` text,
	FOREIGN KEY (`contract_id`) REFERENCES `data_contracts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ctm_contract_idx` ON `contract_team_members` (`contract_id`);--> statement-breakpoint
CREATE TABLE `data_contracts` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text DEFAULT 'DataContract' NOT NULL,
	`api_version` text DEFAULT 'v3.0.2' NOT NULL,
	`version` text NOT NULL,
	`status` text NOT NULL,
	`name` text,
	`domain` text,
	`data_product` text,
	`tenant` text,
	`description_purpose` text,
	`description_limitations` text,
	`description_usage` text,
	`price_amount` integer,
	`price_currency` text,
	`price_unit` text,
	`sla_default_element` text,
	`contract_created_ts` integer,
	`created_at` integer,
	`updated_at` integer,
	`created_by` text
);
--> statement-breakpoint
CREATE INDEX `dc_status_idx` ON `data_contracts` (`status`);--> statement-breakpoint
CREATE INDEX `dc_domain_idx` ON `data_contracts` (`domain`);--> statement-breakpoint
CREATE INDEX `dc_name_idx` ON `data_contracts` (`name`);--> statement-breakpoint
CREATE TABLE `data_products` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text DEFAULT 'DataProduct' NOT NULL,
	`api_version` text DEFAULT 'v1.0.0' NOT NULL,
	`status` text NOT NULL,
	`name` text,
	`version` text,
	`domain` text,
	`tenant` text,
	`description_purpose` text,
	`description_limitations` text,
	`description_usage` text,
	`product_created_ts` integer,
	`created_at` integer,
	`updated_at` integer,
	`created_by` text
);
--> statement-breakpoint
CREATE INDEX `dp_status_idx` ON `data_products` (`status`);--> statement-breakpoint
CREATE INDEX `dp_domain_idx` ON `data_products` (`domain`);--> statement-breakpoint
CREATE INDEX `dp_name_idx` ON `data_products` (`name`);--> statement-breakpoint
CREATE TABLE `product_input_ports` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`version` text,
	`contract_id` text,
	`description` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pip_product_idx` ON `product_input_ports` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_management_ports` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`content` text NOT NULL,
	`type` text DEFAULT 'rest',
	`url` text,
	`channel` text,
	`description` text,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pmp_product_idx` ON `product_management_ports` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_output_ports` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`name` text NOT NULL,
	`version` text,
	`contract_id` text,
	`type` text,
	`description` text,
	`sbom` text,
	`order_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pop_product_idx` ON `product_output_ports` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_support_channels` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`channel` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`tool` text,
	`scope` text,
	`invitation_url` text,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `psc_product_idx` ON `product_support_channels` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`tag` text NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `pt_product_idx` ON `product_tags` (`product_id`);--> statement-breakpoint
CREATE INDEX `pt_tag_idx` ON `product_tags` (`tag`);--> statement-breakpoint
CREATE TABLE `product_team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`username` text NOT NULL,
	`name` text,
	`role` text,
	`description` text,
	`date_in` integer,
	`date_out` integer,
	`replaced_by_username` text,
	FOREIGN KEY (`product_id`) REFERENCES `data_products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `ptm_product_idx` ON `product_team_members` (`product_id`);