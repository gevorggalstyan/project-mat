import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
import { nanoid } from "nanoid";

// Helper to generate IDs
const generateId = () => nanoid();

// ============================================================================
// USERS & AUTH
// ============================================================================

export const users = sqliteTable(
  "users",
  {
    email: text("email").primaryKey(),
    name: text("name"),
    source: text("source").notNull().default("cloudflare"), // cloudflare, local
    lastSeenAt: integer("last_seen_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
  },
  (table) => ({
    lastSeenIdx: index("users_last_seen_idx").on(table.lastSeenAt),
  })
);

// ============================================================================
// DATA CONTRACTS (ODCS v3.0.2)
// ============================================================================

export const dataContracts = sqliteTable(
  "data_contracts",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    // ODCS required fields
    kind: text("kind").notNull().default("DataContract"),
    apiVersion: text("api_version").notNull().default("v3.0.2"),
    version: text("version").notNull(), // Data contract version
    status: text("status").notNull(), // proposed, draft, active, deprecated, retired

    // ODCS optional fields
    name: text("name"),
    domain: text("domain"),
    dataProduct: text("data_product"),
    tenant: text("tenant"),

    // Description fields (stored as JSON or separate fields)
    descriptionPurpose: text("description_purpose"),
    descriptionLimitations: text("description_limitations"),
    descriptionUsage: text("description_usage"),

    // Price fields
    priceAmount: integer("price_amount"), // stored as cents
    priceCurrency: text("price_currency"),
    priceUnit: text("price_unit"),

    // SLA
    slaDefaultElement: text("sla_default_element"),

    // Metadata
    contractCreatedTs: integer("contract_created_ts", {
      mode: "timestamp",
    }).$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    createdBy: text("created_by"),
  },
  (table) => ({
    statusIdx: index("dc_status_idx").on(table.status),
    domainIdx: index("dc_domain_idx").on(table.domain),
    nameIdx: index("dc_name_idx").on(table.name),
  })
);

export const contractTags = sqliteTable(
  "contract_tags",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => ({
    contractIdx: index("ct_contract_idx").on(table.contractId),
    tagIdx: index("ct_tag_idx").on(table.tag),
  })
);

export const contractSchemaObjects = sqliteTable(
  "contract_schema_objects",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    logicalType: text("logical_type").notNull().default("object"),
    physicalType: text("physical_type"), // table, view, topic, file
    physicalName: text("physical_name"),
    businessName: text("business_name"),
    description: text("description"),
    dataGranularityDescription: text("data_granularity_description"),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => ({
    contractIdx: index("cso_contract_idx").on(table.contractId),
  })
);

export const contractSchemaProperties = sqliteTable(
  "contract_schema_properties",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    schemaObjectId: text("schema_object_id")
      .notNull()
      .references(() => contractSchemaObjects.id, { onDelete: "cascade" }),
    parentPropertyId: text("parent_property_id"), // For nested objects/arrays

    name: text("name").notNull(),
    logicalType: text("logical_type"), // string, date, number, integer, object, array, boolean
    physicalType: text("physical_type"), // VARCHAR(2), DOUBLE, INT, etc.
    physicalName: text("physical_name"),
    businessName: text("business_name"),
    description: text("description"),

    // Constraints
    required: integer("required", { mode: "boolean" }).default(false),
    unique: integer("unique", { mode: "boolean" }).default(false),
    primaryKey: integer("primary_key", { mode: "boolean" }).default(false),
    primaryKeyPosition: integer("primary_key_position").default(-1),
    partitioned: integer("partitioned", { mode: "boolean" }).default(false),
    partitionKeyPosition: integer("partition_key_position").default(-1),

    // Classification & Security
    classification: text("classification"), // public, restricted, confidential
    encryptedName: text("encrypted_name"),
    criticalDataElement: integer("critical_data_element", {
      mode: "boolean",
    }).default(false),

    // Transformations
    transformSourceObjects: text("transform_source_objects"), // JSON array
    transformLogic: text("transform_logic"),
    transformDescription: text("transform_description"),

    // Examples & Options
    examples: text("examples"), // JSON array
    logicalTypeOptions: text("logical_type_options"), // JSON object

    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => ({
    objectIdx: index("csp_object_idx").on(table.schemaObjectId),
    parentIdx: index("csp_parent_idx").on(table.parentPropertyId),
  })
);

export const contractTeamMembers = sqliteTable(
  "contract_team_members",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    name: text("name"),
    role: text("role"),
    description: text("description"),
    dateIn: integer("date_in", { mode: "timestamp" }),
    dateOut: integer("date_out", { mode: "timestamp" }),
    replacedByUsername: text("replaced_by_username"),
  },
  (table) => ({
    contractIdx: index("ctm_contract_idx").on(table.contractId),
  })
);

export const contractRoles = sqliteTable(
  "contract_roles",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    description: text("description"),
    access: text("access"), // read, write, etc.
    firstLevelApprovers: text("first_level_approvers"),
    secondLevelApprovers: text("second_level_approvers"),
  },
  (table) => ({
    contractIdx: index("cr_contract_idx").on(table.contractId),
  })
);

export const contractServers = sqliteTable(
  "contract_servers",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    server: text("server").notNull(), // server identifier
    type: text("type").notNull(), // bigquery, snowflake, s3, etc.
    description: text("description"),
    environment: text("environment"), // prod, dev, uat

    // Server-specific config stored as JSON
    serverConfig: text("server_config"), // JSON object with type-specific fields
  },
  (table) => ({
    contractIdx: index("cs_contract_idx").on(table.contractId),
  })
);

export const contractSlaProperties = sqliteTable(
  "contract_sla_properties",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    property: text("property").notNull(), // latency, frequency, retention, etc.
    value: text("value").notNull(),
    valueExt: text("value_ext"),
    unit: text("unit"), // d, y, etc.
    element: text("element"),
    driver: text("driver"), // regulatory, analytics, operational
  },
  (table) => ({
    contractIdx: index("csla_contract_idx").on(table.contractId),
  })
);

export const contractSupportChannels = sqliteTable(
  "contract_support_channels",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    contractId: text("contract_id")
      .notNull()
      .references(() => dataContracts.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    tool: text("tool"), // email, slack, teams, discord, ticket, other
    scope: text("scope"), // interactive, announcements, issues
    invitationUrl: text("invitation_url"),
  },
  (table) => ({
    contractIdx: index("csc_contract_idx").on(table.contractId),
  })
);

export const contractQualityRules = sqliteTable(
  "contract_quality_rules",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    schemaObjectId: text("schema_object_id").references(
      () => contractSchemaObjects.id,
      { onDelete: "cascade" }
    ),
    schemaPropertyId: text("schema_property_id").references(
      () => contractSchemaProperties.id,
      { onDelete: "cascade" }
    ),

    type: text("type").notNull().default("library"), // text, library, sql, custom
    name: text("name"),
    description: text("description"),
    rule: text("rule"), // For library type: duplicateCount, validValues, rowCount, etc.

    // Operators (stored as JSON for flexibility)
    operators: text("operators"), // JSON: { mustBe, mustBeLessThan, etc. }

    // For SQL type
    query: text("query"),

    // For custom type
    engine: text("engine"), // soda, greatExpectations, etc.
    implementation: text("implementation"),

    // Additional metadata
    dimension: text("dimension"), // accuracy, completeness, etc.
    severity: text("severity"), // info, warning, error
    businessImpact: text("business_impact"),
    unit: text("unit"), // rows, percent
    validValues: text("valid_values"), // JSON array

    // Scheduling
    scheduler: text("scheduler"), // cron, etc.
    schedule: text("schedule"), // 0 20 * * *
  },
  (table) => ({
    objectIdx: index("cqr_object_idx").on(table.schemaObjectId),
    propertyIdx: index("cqr_property_idx").on(table.schemaPropertyId),
  })
);

// ============================================================================
// DATA PRODUCTS (ODPS v1.0.0)
// ============================================================================

export const dataProducts = sqliteTable(
  "data_products",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    // ODPS required fields
    kind: text("kind").notNull().default("DataProduct"),
    apiVersion: text("api_version").notNull().default("v1.0.0"),
    status: text("status").notNull(), // proposed, draft, active, deprecated, retired

    // ODPS optional fields
    name: text("name"),
    version: text("version"),
    domain: text("domain"),
    tenant: text("tenant"),

    // Description fields
    descriptionPurpose: text("description_purpose"),
    descriptionLimitations: text("description_limitations"),
    descriptionUsage: text("description_usage"),

    // Metadata
    productCreatedTs: integer("product_created_ts", {
      mode: "timestamp",
    }).$defaultFn(() => new Date()),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
      () => new Date()
    ),
    createdBy: text("created_by"),
  },
  (table) => ({
    statusIdx: index("dp_status_idx").on(table.status),
    domainIdx: index("dp_domain_idx").on(table.domain),
    nameIdx: index("dp_name_idx").on(table.name),
  })
);

export const productTags = sqliteTable(
  "product_tags",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    productId: text("product_id")
      .notNull()
      .references(() => dataProducts.id, { onDelete: "cascade" }),
    tag: text("tag").notNull(),
  },
  (table) => ({
    productIdx: index("pt_product_idx").on(table.productId),
    tagIdx: index("pt_tag_idx").on(table.tag),
  })
);

export const productInputPorts = sqliteTable(
  "product_input_ports",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    productId: text("product_id")
      .notNull()
      .references(() => dataProducts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    version: text("version"),
    contractId: text("contract_id").references(() => dataContracts.id), // Add FK to dataContracts
    description: text("description"),
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => ({
    productIdx: index("pip_product_idx").on(table.productId),
  })
);

export const productOutputPorts = sqliteTable(
  "product_output_ports",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    productId: text("product_id")
      .notNull()
      .references(() => dataProducts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    version: text("version"),
    contractId: text("contract_id").references(() => dataContracts.id), // Add FK to dataContracts
    type: text("type"), // tables, api, etc.
    description: text("description"),
    sbom: text("sbom"), // JSON array
    orderIndex: integer("order_index").notNull().default(0),
  },
  (table) => ({
    productIdx: index("pop_product_idx").on(table.productId),
  })
);

export const productManagementPorts = sqliteTable(
  "product_management_ports",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    productId: text("product_id")
      .notNull()
      .references(() => dataProducts.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content").notNull(), // discoverability, observability, control
    type: text("type").default("rest"), // rest, topic
    url: text("url"),
    channel: text("channel"),
    description: text("description"),
  },
  (table) => ({
    productIdx: index("pmp_product_idx").on(table.productId),
  })
);

export const productTeamMembers = sqliteTable(
  "product_team_members",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    productId: text("product_id")
      .notNull()
      .references(() => dataProducts.id, { onDelete: "cascade" }),
    username: text("username").notNull(),
    name: text("name"),
    role: text("role"),
    description: text("description"),
    dateIn: integer("date_in", { mode: "timestamp" }),
    dateOut: integer("date_out", { mode: "timestamp" }),
    replacedByUsername: text("replaced_by_username"),
  },
  (table) => ({
    productIdx: index("ptm_product_idx").on(table.productId),
  })
);

export const productSupportChannels = sqliteTable(
  "product_support_channels",
  {
    id: text("id").primaryKey().$defaultFn(generateId),
    productId: text("product_id")
      .notNull()
      .references(() => dataProducts.id, { onDelete: "cascade" }),
    channel: text("channel").notNull(),
    url: text("url").notNull(),
    description: text("description"),
    tool: text("tool"),
    scope: text("scope"),
    invitationUrl: text("invitation_url"),
  },
  (table) => ({
    productIdx: index("psc_product_idx").on(table.productId),
  })
);
