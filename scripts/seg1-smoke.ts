// Segment-1 smoke test: CRUD each of the 27 new entities against dev.db.
// Creates tagged rows, reads them back, then deletes (keeps dev.db clean).
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const tag = "SEG1-SMOKE";

async function main() {
  const org = await prisma.organisation.findFirst({ include: { branches: true } });
  if (!org) throw new Error("no org");
  const branch = org.branches[0];
  const customer = await prisma.customer.findFirst();
  const bike = customer ? await prisma.motorcycle.findFirst({ where: { customerId: customer.id } }) : null;
  const job = await prisma.serviceJob.findFirst();
  if (!customer || !bike || !job) throw new Error("need customer/bike/job");

  const results: string[] = [];
  async function t(name: string, fn: () => Promise<unknown>) {
    try { await fn(); results.push("OK   " + name); }
    catch (e) { results.push("FAIL " + name + " :: " + String((e as Error).message).slice(0, 160)); }
  }

  await t("RoleConfig", async () => {
    const x = await prisma.roleConfig.create({ data: { organisationId: org.id, name: tag + "-role", isSystem: false } });
    await prisma.roleConfig.findUnique({ where: { id: x.id } });
    await prisma.roleConfig.delete({ where: { id: x.id } });
  });
  await t("Permission", async () => {
    const x = await prisma.permission.create({ data: { organisationId: org.id, roleName: "OWNER", module: "LEADS", canView: true, canCreate: true } });
    await prisma.permission.findUnique({ where: { id: x.id } });
    await prisma.permission.delete({ where: { id: x.id } });
  });
  await t("CustomerAddress", async () => {
    const x = await prisma.customerAddress.create({ data: { customerId: customer.id, type: "HOME", city: "KL", country: "MY" } });
    await prisma.customerAddress.findUnique({ where: { id: x.id } });
    await prisma.customerAddress.delete({ where: { id: x.id } });
  });
  await t("CustomerConsent", async () => {
    const x = await prisma.customerConsent.create({ data: { customerId: customer.id, marketingOptIn: true, whatsappOptIn: true } });
    await prisma.customerConsent.findUnique({ where: { id: x.id } });
    await prisma.customerConsent.delete({ where: { id: x.id } });
  });
  await t("LeadSource", async () => {
    const x = await prisma.leadSource.create({ data: { organisationId: org.id, name: tag + "-src" } });
    await prisma.leadSource.findUnique({ where: { id: x.id } });
    await prisma.leadSource.delete({ where: { id: x.id } });
  });
  await t("LeadStage", async () => {
    const x = await prisma.leadStage.create({ data: { organisationId: org.id, name: tag + "-stage", order: 1 } });
    await prisma.leadStage.findUnique({ where: { id: x.id } });
    await prisma.leadStage.delete({ where: { id: x.id } });
  });
  let leadId = "";
  await t("Lead", async () => {
    const x = await prisma.lead.create({ data: { leadNumber: "LD-" + Date.now(), organisationId: org.id, branchId: branch.id, customerName: tag + " Lead", phone: "011-0000000" } });
    leadId = x.id;
    await prisma.lead.findUnique({ where: { id: x.id } });
  });
  await t("LeadActivity", async () => {
    if (!leadId) throw new Error("lead missing");
    const x = await prisma.leadActivity.create({ data: { leadId, type: "NOTE", note: tag } });
    await prisma.leadActivity.findUnique({ where: { id: x.id } });
    await prisma.leadActivity.delete({ where: { id: x.id } });
  });
  let taskId = "";
  await t("Task", async () => {
    const x = await prisma.task.create({ data: { organisationId: org.id, branchId: branch.id, title: tag + " task", relatedType: "LEAD", relatedId: leadId || undefined } });
    taskId = x.id;
    await prisma.task.findUnique({ where: { id: x.id } });
  });
  await t("TestRide", async () => {
    const x = await prisma.testRide.create({ data: { organisationId: org.id, branchId: branch.id, motorcycleModel: "Yamaha Y16ZR", rideDate: new Date(), status: "PENDING" } });
    await prisma.testRide.findUnique({ where: { id: x.id } });
    await prisma.testRide.delete({ where: { id: x.id } });
  });
  await t("AppointmentSlot", async () => {
    const x = await prisma.appointmentSlot.create({ data: { branchId: branch.id, date: new Date(), startTime: "10:00", maxBookings: 2 } });
    await prisma.appointmentSlot.findUnique({ where: { id: x.id } });
    await prisma.appointmentSlot.delete({ where: { id: x.id } });
  });
  await t("ServiceType", async () => {
    const x = await prisma.serviceType.create({ data: { organisationId: org.id, name: tag + " service", category: "MAINTENANCE" } });
    await prisma.serviceType.findUnique({ where: { id: x.id } });
    await prisma.serviceType.delete({ where: { id: x.id } });
  });
  await t("JobStatusHistory", async () => {
    const x = await prisma.jobStatusHistory.create({ data: { jobId: job.id, fromStatus: "WAITING", toStatus: "IN_PROGRESS" } });
    await prisma.jobStatusHistory.findUnique({ where: { id: x.id } });
    await prisma.jobStatusHistory.delete({ where: { id: x.id } });
  });
  await t("ServiceHistory", async () => {
    const x = await prisma.serviceHistory.create({ data: { organisationId: org.id, branchId: branch.id, customerId: customer.id, motorcycleId: bike.id, jobId: job.id, serviceDate: new Date(), mileage: 1000, totalSen: 10000 } });
    await prisma.serviceHistory.findUnique({ where: { id: x.id } });
    await prisma.serviceHistory.delete({ where: { id: x.id } });
  });
  await t("InventoryLocation", async () => {
    const x = await prisma.inventoryLocation.create({ data: { branchId: branch.id, name: tag + " loc" } });
    await prisma.inventoryLocation.findUnique({ where: { id: x.id } });
    await prisma.inventoryLocation.delete({ where: { id: x.id } });
  });
  let autoId = "";
  await t("AutomationRule", async () => {
    const x = await prisma.automationRule.create({ data: { organisationId: org.id, name: tag + " auto", triggerType: "EVENT", trigger: "LEAD_CREATED", actions: JSON.stringify([{ type: "CREATE_TASK" }]) } });
    autoId = x.id;
    await prisma.automationRule.findUnique({ where: { id: x.id } });
  });
  await t("AutomationExecution", async () => {
    if (!autoId) throw new Error("auto missing");
    const x = await prisma.automationExecution.create({ data: { ruleId: autoId, trigger: "LEAD_CREATED", status: "SUCCESS" } });
    await prisma.automationExecution.findUnique({ where: { id: x.id } });
    await prisma.automationExecution.delete({ where: { id: x.id } });
    await prisma.automationRule.delete({ where: { id: autoId } });
  });
  await t("MessageTemplate", async () => {
    const x = await prisma.messageTemplate.create({ data: { organisationId: org.id, name: tag + " tmpl", channel: "WHATSAPP", body: "Hello {name}" } });
    await prisma.messageTemplate.findUnique({ where: { id: x.id } });
    await prisma.messageTemplate.delete({ where: { id: x.id } });
  });
  let tierId = "";
  await t("LoyaltyTier", async () => {
    const x = await prisma.loyaltyTier.create({ data: { organisationId: org.id, name: tag + " tier", minPoints: 0 } });
    tierId = x.id;
    await prisma.loyaltyTier.findUnique({ where: { id: x.id } });
  });
  let acctId = "";
  await t("LoyaltyAccount", async () => {
    const x = await prisma.loyaltyAccount.create({ data: { organisationId: org.id, customerId: customer.id, membershipId: "M-" + Date.now(), pointsBalance: 100, tierId: tierId || undefined } });
    acctId = x.id;
    await prisma.loyaltyAccount.findUnique({ where: { id: x.id } });
  });
  await t("LoyaltyTransaction", async () => {
    if (!acctId) throw new Error("acct missing");
    const x = await prisma.loyaltyTransaction.create({ data: { accountId: acctId, type: "EARN", points: 50, balanceAfter: 150, reason: tag } });
    await prisma.loyaltyTransaction.findUnique({ where: { id: x.id } });
    await prisma.loyaltyTransaction.delete({ where: { id: x.id } });
  });
  let rewardId = "";
  await t("Reward", async () => {
    const x = await prisma.reward.create({ data: { organisationId: org.id, name: tag + " reward", pointsRequired: 500 } });
    rewardId = x.id;
    await prisma.reward.findUnique({ where: { id: x.id } });
  });
  await t("RewardRedemption", async () => {
    if (!acctId || !rewardId) throw new Error("acct/reward missing");
    const x = await prisma.rewardRedemption.create({ data: { accountId: acctId, rewardId: rewardId, pointsSpent: 100 } });
    await prisma.rewardRedemption.findUnique({ where: { id: x.id } });
    await prisma.rewardRedemption.delete({ where: { id: x.id } });
  });
  await t("Referral", async () => {
    const x = await prisma.referral.create({ data: { organisationId: org.id, referringCustomerId: customer.id, code: "REF-" + Date.now() } });
    await prisma.referral.findUnique({ where: { id: x.id } });
    await prisma.referral.delete({ where: { id: x.id } });
  });
  await t("Attachment", async () => {
    const x = await prisma.attachment.create({ data: { organisationId: org.id, relatedType: "CUSTOMER", relatedId: customer.id, fileName: tag + ".pdf", mimeType: "application/pdf", url: "/tmp/" + tag + ".pdf" } });
    await prisma.attachment.findUnique({ where: { id: x.id } });
    await prisma.attachment.delete({ where: { id: x.id } });
  });
  await t("AuditLog", async () => {
    const x = await prisma.auditLog.create({ data: { organisationId: org.id, branchId: branch.id, action: "LOGIN", entity: "USER" } });
    await prisma.auditLog.findUnique({ where: { id: x.id } });
    await prisma.auditLog.delete({ where: { id: x.id } });
  });
  await t("IntegrationConfig", async () => {
    const x = await prisma.integrationConfig.create({ data: { organisationId: org.id, provider: "WHATSAPP", enabled: false } });
    await prisma.integrationConfig.findUnique({ where: { id: x.id } });
    await prisma.integrationConfig.delete({ where: { id: x.id } });
  });
  // cleanup chained rows
  if (leadId) await prisma.lead.delete({ where: { id: leadId } }).catch(() => {});
  if (taskId) await prisma.task.delete({ where: { id: taskId } }).catch(() => {});
  if (acctId) await prisma.loyaltyAccount.delete({ where: { id: acctId } }).catch(() => {});
  if (tierId) await prisma.loyaltyTier.delete({ where: { id: tierId } }).catch(() => {});
  if (rewardId) await prisma.reward.delete({ where: { id: rewardId } }).catch(() => {});

  const pass = results.filter((r) => r.startsWith("OK")).length;
  const fail = results.filter((r) => r.startsWith("FAIL")).length;
  console.log(results.join("\n"));
  console.log("---");
  console.log("SEG1 SMOKE: " + pass + " passed, " + fail + " failed / " + results.length);
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(1); });
