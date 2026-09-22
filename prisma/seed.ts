/**
 * Demo seed — development and staging only.
 *
 * Creates one clearly-labelled demo organization with a user for each role so
 * that RBAC and tenant isolation can be reviewed on staging without inventing
 * operational data. Refuses to run unless ALLOW_DEMO_SEED="true".
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";

if (process.env.ALLOW_DEMO_SEED !== "true") {
  console.error("Refusing to seed: set ALLOW_DEMO_SEED=\"true\" for development/staging environments only.");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: (process.env.DATABASE_URL || "file:./prisma/sitewatch.db").replace(/^file:/, "") }),
});

export const DEMO_PASSWORD = "SiteWatch-Demo1";

const DEMO_ORGS = [
  {
    name: "Northwind Renewables (Demo)",
    slug: "northwind-demo",
    timezone: "Europe/London",
    users: [
      { name: "Amara Okafor", email: "admin@northwind.demo", role: Role.ADMIN },
      { name: "Daniel Reyes", email: "ops@northwind.demo", role: Role.OPERATIONS_MANAGER },
      { name: "Priya Nair", email: "tech@northwind.demo", role: Role.FIELD_TECHNICIAN },
      { name: "Client Viewer", email: "viewer@northwind.demo", role: Role.VIEWER },
    ],
  },
  {
    // Second tenant exists purely to demonstrate isolation.
    name: "Meridian Telecom (Demo)",
    slug: "meridian-demo",
    timezone: "Asia/Kolkata",
    users: [{ name: "Sofia Almeida", email: "admin@meridian.demo", role: Role.ADMIN }],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  for (const org of DEMO_ORGS) {
    const organization = await db.organization.upsert({
      where: { slug: org.slug },
      update: { name: org.name, timezone: org.timezone },
      create: { name: org.name, slug: org.slug, timezone: org.timezone },
    });

    for (const u of org.users) {
      const user = await db.user.upsert({
        where: { email: u.email },
        update: { name: u.name, passwordHash },
        create: { name: u.name, email: u.email, passwordHash },
      });
      await db.membership.upsert({
        where: { userId_organizationId: { userId: user.id, organizationId: organization.id } },
        update: { role: u.role },
        create: { userId: user.id, organizationId: organization.id, role: u.role },
      });
    }
    console.log(`✓ ${org.name} — ${org.users.length} member(s)`);
  }

  console.log(`\nDemo password for every account: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
