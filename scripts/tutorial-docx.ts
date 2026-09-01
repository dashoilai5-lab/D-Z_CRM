import { Document, Packer, Paragraph, TextRun, HeadingLevel, TableOfContents, ImageRun, AlignmentType } from "docx";
import * as fs from "node:fs";
import * as path from "node:path";
const SCREENS = "tutorial-screens";
function pngSize(p){const b=fs.readFileSync(p);const w=b.readUInt32BE(16),h=b.readUInt32BE(20);return{w,h};}
function imageRun(p){const{w,h}=pngSize(p);const MAXW=560,MAXH=800;const scale=Math.min(MAXW/w,MAXH/h);const dw=Math.round(w*scale),dh=Math.round(h*scale);return new ImageRun({type:"png",data:fs.readFileSync(p),transformation:{width:dw,height:dh}});}
const GROUPS: Record<string,string> = { workshop:"Workshop OS", rider:"Rider App", mechanic:"Mechanic App" };
const C: Record<string, Record<string,{title:string;bullets:string[]}>> = {
  workshop:{
    dashboard:{title:"Dashboard",bullets:["Today sales / gross profit / avg ticket","Jobs today + status distribution","Customers due / bookings / tasks","Lifecycle distribution + repeat %"]},
    bookings:{title:"Bookings",bullets:["List + filter (status/branch/date)","Confirm / reschedule / cancel / no-show","Check in -> creates service job","Per-status counts, month view"]},
    "bookings-slots":{title:"Appointment Slots",bullets:["Generate slots with capacity","Holidays + oversell guard"]},
    jobs:{title:"Service Jobs",bullets:["Table + Kanban views","Create service / repair job","Start / QC / ready / complete / cancel"]},
    customers:{title:"Customers",bullets:["List + contact + mileage + reminders","Profile: history / motorcycles"]},
    motorcycles:{title:"Motorcycles",bullets:["Vehicle list","Add / transfer","Mileage correction audit"]},
    packages:{title:"Service Packages",bullets:["Create packages (price/tier/items)","Best-value badge"]},
    analytics:{title:"Analytics",bullets:["Monthly volume + brand analysis","Revenue / top models"]},
    loyalty:{title:"Loyalty & Referrals",bullets:["Members, points, tiers","Earn / redeem / adjust","Referral rewards"]},
    pipeline:{title:"Sales Pipeline",bullets:["Kanban leads by stage","Drag between stages"]},
    leads:{title:"Leads",bullets:["List + create","Activities / follow-up / source"]},
    "test-rides":{title:"Test Rides",bullets:["Schedule / status","Auto follow-up task"]},
    automations:{title:"Automations",bullets:["Automation rules","Auto reminders / campaigns"]},
    tasks:{title:"Tasks",bullets:["Create / assign with due dates","Priority + overdue"]},
    notifications:{title:"Notifications",bullets:["Workshop feed","Read / filter / links"]},
    settlements:{title:"Settlements",bullets:["Commission rules per mechanic","Per-job override + bonus","Payout ledgers"]},
    "finance-profit":{title:"Profit Dashboard",bullets:["Revenue / COGS / margin","Service vs parts split, trends"]},
    "finance-invoices":{title:"Invoices",bullets:["List + status filter","Record payment (auto-settle)","Date/search, print PDF"]},
    staff:{title:"Staff",bullets:["Add staff (name/role/contact)","Create login (email+password)","Activate / deactivate"]},
    "staff-kpi":{title:"Staff KPI",bullets:["Performance metrics"]},
    "mechanic-board":{title:"Mechanic Board",bullets:["Assign / reassign jobs","Per-mechanic jobs + approvals","Quote-pending gating"]},
    checklists:{title:"Checklists",bullets:["Inspection checklists","PASS/WARNING/FAIL","Findings -> approval"]},
    attendance:{title:"Attendance",bullets:["Check-in / check-out","Daily log"]},
    "inventory-products":{title:"Products",bullets:["Catalogue (SKU/price/cost/stock)","Images, suppliers"]},
    "inventory-stock":{title:"Stock",bullets:["Levels per branch","Adjust + movements"]},
    "inventory-alerts":{title:"Stock Alerts",bullets:["Low-stock alerts"]},
    "inventory-dead-stock":{title:"Dead Stock",bullets:["Slow / dead stock"]},
    "inventory-reorder":{title:"Reorder",bullets:["Purchase reorder suggestions"]},
    "inventory-purchase-orders":{title:"Purchase Orders",bullets:["Create PO","Receive -> stock in"]},
    "inventory-suppliers":{title:"Suppliers",bullets:["Supplier CRUD","Product mapping"]},
    "marketing-calendar":{title:"Promotion Calendar",bullets:["Campaigns calendar"]},
    "marketing-posters":{title:"Poster Library",bullets:["AI poster generation","Publish to rider news"]},
    "marketing-scripts":{title:"Reels Script Bank",bullets:["Content scripts","AI draft"]},
    "marketing-reviews":{title:"Reviews",bullets:["Approve / reply / publish"]},
    "messaging-templates":{title:"Message Templates",bullets:["WhatsApp templates {placeholders}"]},
    "crm-reminders":{title:"Service Reminders",bullets:["Mileage-based reminders","Send due (WhatsApp)"]},
    "crm-return-list":{title:"Customer Return List",bullets:["Customers due for return"]},
    integrations:{title:"Integrations",bullets:["Third-party settings","Provider enable"]},
    ai:{title:"Today Recommendations",bullets:["AI sales recommendations","Add / skip"]},
    import:{title:"CSV Import",bullets:["Import customers / products (dedupe)"]},
    settings:{title:"Settings",bullets:["Shop profile / QR / branches / roles"]},
    "settings-developer":{title:"Developer Settings",bullets:["Data overview","Role x module toggles"]},
    "settings-audit-logs":{title:"Audit Logs",bullets:["Action log","Before/after"]},
  },
  rider:{
    home:{title:"Rider Home",bullets:["Greeting + primary bike","Service schedule / offers"]},
    book:{title:"Book a Service",bullets:["Branch -> package -> date/time","Service or Repair toggle"]},
    bookings:{title:"My Bookings",bullets:["Booking list + status"]},
    motorcycles:{title:"My Bikes",bullets:["Passport (history)","Add / edit bike"]},
    "service-history":{title:"Service History",bullets:["Verified services per bike"]},
    "service-status":{title:"Service Status",bullets:["Live lifecycle progress","Quotation card","Sub-status badges"]},
    invoices:{title:"My Invoices",bullets:["Invoice list + status"]},
    promotions:{title:"Offers",bullets:["Active promotions"]},
    notifications:{title:"Notifications",bullets:["In-app feed"]},
    profile:{title:"Profile",bullets:["Membership card + points + tier"]},
    settings:{title:"Settings",bullets:["Profile / language / prefs / password"]},
    approvals:{title:"Approvals",bullets:["Approve / decline extra work"]},
  },
  mechanic:{
    home:{title:"Mechanic Home",bullets:["Assigned active jobs","Start / update job status","SOP photo capture (5 angles)"]},
    earnings:{title:"Earnings",bullets:["Payouts / commissions","Agree & receive salary"]},
    profile:{title:"Mechanic Profile",bullets:["Personal info"]},
    settings:{title:"Mechanic Settings",bullets:["Prefs / language"]},
  },
};
async function main(){
  const children:any[]=[];
  children.push(new Paragraph({alignment:AlignmentType.CENTER,spacing:{before:2400}}),new Paragraph({children:[new TextRun({text:"D&Z Platform",bold:true,size:60})],alignment:AlignmentType.CENTER}),new Paragraph({children:[new TextRun({text:"Workshop OS · Mechanic App · Rider App",size:30,color:"666666"})],alignment:AlignmentType.CENTER}),new Paragraph({children:[new TextRun({text:"User Guide & Functionality Reference",size:24})],alignment:AlignmentType.CENTER}),new Paragraph({children:[new TextRun({text:"with screenshots of every screen",size:22,italics:true,color:"888888"})],alignment:AlignmentType.CENTER}),new Paragraph({spacing:{before:2000}}));
  children.push(new Paragraph({heading:HeadingLevel.HEADING_1,children:[new TextRun({text:"Table of Contents",bold:true})]}),new TableOfContents("Contents",{hyperlink:true,headingStyleRange:"1-2"}),new Paragraph({children:[new TextRun("")]}));
  children.push(new Paragraph({pageBreakBefore:true,heading:HeadingLevel.HEADING_1,children:[new TextRun({text:"Getting Started",bold:true})]}),new Paragraph({children:[new TextRun({text:"D&Z Platform has three apps/roles: Workshop OS (management), Mechanic App, Rider App. Production: https://d-z-crm.vercel.app"})]}),new Paragraph({children:[new TextRun({text:"Accounts (default password Dashoil@!789):",bold:true})]}),new Paragraph({text:"Workshop Owner: daniel.tan@dz.my  ·  Mechanic: aizat.bin.ismail@dz.my  ·  Rider (rich data): ahmad.danial@dz.my  ·  Demo rider: test1@gmail.com"}));
  for(const scope of Object.keys(GROUPS)){
    children.push(new Paragraph({pageBreakBefore:true,heading:HeadingLevel.HEADING_1,children:[new TextRun({text:GROUPS[scope],bold:true})]}));
    const files = fs.readdirSync(path.join(SCREENS,scope)).filter(f=>f.endsWith(".png")).sort();
    for(const f of files){
      const name=f.replace(/\.png$/,"");const meta:any=(C[scope]??{})[name];const title=meta?.title??name;
      children.push(new Paragraph({heading:HeadingLevel.HEADING_2,children:[new TextRun({text:title,bold:true})]}));
      if(meta?.bullets?.length){for(const b of meta.bullets)children.push(new Paragraph({text:b,bullet:{level:0},spacing:{after:60}}));}
      try{children.push(new Paragraph({children:[imageRun(path.join(SCREENS,scope,f))],spacing:{before:120,after:240},pageBreakBefore:true}));}catch(e){children.push(new Paragraph({text:"(screenshot missing)"}));}
    }
  }
  const doc=new Document({sections:[{properties:{},children}]});
  const out="docs/D&Z Platform User Guide.docx";
  fs.writeFileSync(out,await Packer.toBuffer(doc));
  console.log("DOCX written:",out,"bytes:",fs.statSync(out).size);
}
main().catch((e)=>{console.error("FATAL",e);process.exit(1);});
