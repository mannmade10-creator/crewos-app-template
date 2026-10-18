import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL         = process.env.CREWOS_SUPABASE_URL         ?? "";
const SUPABASE_SERVICE_KEY = process.env.CREWOS_SUPABASE_SERVICE_KEY ?? "";
const VERCEL_TOKEN         = process.env.CREWOS_VERCEL_TOKEN         ?? "";
const VERCEL_TEAM_ID       = process.env.CREWOS_VERCEL_TEAM_ID       ?? "";
const TEMPLATE_REPO        = process.env.CREWOS_TEMPLATE_REPO        ?? "mannmade10-creator/crewos-app-template";
const RESEND_API_KEY       = process.env.RESEND_API_KEY              ?? "";
const FROM_EMAIL           = process.env.BOOKING_FROM_EMAIL          ?? "noreply@notifications.crewwos.com";

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const max = Math.max(r,g,b), min = Math.min(r,g,b);
  let h = 0, s = 0;
  const l = (max+min)/2;
  if (max !== min) {
    const d = max-min;
    s = l > 0.5 ? d/(2-max-min) : d/(max+min);
    switch(max) {
      case r: h=((g-b)/d+(g<b?6:0))/6; break;
      case g: h=((b-r)/d+2)/6; break;
      case b: h=((r-g)/d+4)/6; break;
    }
  }
  return [Math.round(h*360), Math.round(s*100), Math.round(l*100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const ll=l/100, ss=s/100, a=ss*Math.min(ll,1-ll);
  const f=(n:number)=>{const k=(n+h/30)%12;return Math.round(255*(ll-a*Math.max(Math.min(k-3,9-k,1),-1))).toString(16).padStart(2,"0");};
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(hex: string) {
  const [h,s] = hexToHsl(hex);
  return {
    "50":  hslToHex(h, Math.max(s-20,10), 97),
    "100": hslToHex(h, Math.max(s-10,15), 93),
    "500": hex,
    "600": hslToHex(h, s, 42),
    "700": hslToHex(h, s, 34),
    "900": hslToHex(h, Math.min(s+5,100), 18),
  };
}

function vercelHeaders() {
  return { "Content-Type":"application/json", Authorization:`Bearer ${VERCEL_TOKEN}` };
}
function teamQ() { return VERCEL_TEAM_ID ? `?teamId=${VERCEL_TEAM_ID}` : ""; }

async function createVercelProject(name: string, envVars: Record<string,string>) {
  const res = await fetch(`https://api.vercel.com/v10/projects${teamQ()}`, {
    method:"POST", headers:vercelHeaders(),
    body:JSON.stringify({
      name, framework:"nextjs",
      gitRepository:{type:"github", repo:TEMPLATE_REPO},
      environmentVariables: Object.entries(envVars).map(([key,value])=>({key,value,type:"plain",target:["production","preview"]})),
    }),
  });
  if (!res.ok) throw new Error(`Vercel create failed: ${res.status} -- ${await res.text()}`);
  const project = await res.json();
  const projectId: string = project.id;

  const dRes = await fetch(`https://api.vercel.com/v13/deployments${teamQ()}`, {
    method:"POST", headers:vercelHeaders(),
    body:JSON.stringify({name, project:projectId, gitSource:{type:"github",repo:TEMPLATE_REPO,ref:"main"}}),
  });
  const dJson = dRes.ok ? await dRes.json() : null;
  const url = dJson?.url ? `https://${dJson.url}` : `https://${name}.vercel.app`;
  return {projectId, url};
}

async function createWorkspace(data: Record<string,string>) {
  const palette = generatePalette(data.brandColor ?? "#0ea5e9");
  const row = {
    business_name:        data.businessName,
    business_tagline:     data.businessTagline || null,
    business_description: data.businessDescription || null,
    business_phone:       data.businessPhone || null,
    business_email:       data.businessEmail || null,
    business_address:     data.businessAddress || null,
    business_type:        data.businessType ?? "service",
    owner_name:           data.ownerName,
    owner_email:          data.ownerEmail,
    booking_enabled:      false,
    status:               "provisioning",
    service_1: data.service1||null, service_2: data.service2||null, service_3: data.service3||null,
    service_4: data.service4||null, service_5: data.service5||null, service_6: data.service6||null,
    brand_50:palette["50"], brand_100:palette["100"], brand_500:palette["500"],
    brand_600:palette["600"], brand_700:palette["700"], brand_900:palette["900"],
    social_instagram:data.instagram||null, social_facebook:data.facebook||null,
    social_tiktok:data.tiktok||null, social_twitter:data.twitter||null,
    vercel_project_id:     data.vercelProjectId,
    vercel_deployment_url: data.vercelDeploymentUrl,
  };
  const res = await fetch(`${SUPABASE_URL}/rest/v1/workspaces`, {
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      apikey:SUPABASE_SERVICE_KEY,
      Authorization:`Bearer ${SUPABASE_SERVICE_KEY}`,
      Prefer:"return=representation",
    },
    body:JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`Supabase insert failed: ${res.status} -- ${await res.text()}`);
  const rows = await res.json();
  return rows[0] as {id:string};
}

async function sendWelcomeEmail(to:string, name:string, biz:string, url:string) {
  if (!RESEND_API_KEY) return;
  await fetch("https://api.resend.com/emails", {
    method:"POST",
    headers:{"Content-Type":"application/json", Authorization:`Bearer ${RESEND_API_KEY}`},
    body:JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject: `Your CrewOS site is live -- ${biz}`,
      html: `<div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:32px">
        <h1 style="font-size:24px;font-weight:800;color:#0c4a6e;margin:0 0 8px">Welcome to CrewOS, ${name}!</h1>
        <p style="color:#334155;font-size:15px;margin:0 0 24px">Your <strong>${biz}</strong> workspace has been provisioned and is deploying now.</p>
        <a href="${url}" style="display:inline-block;background:#0ea5e9;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;margin-bottom:32px">Visit Your Site</a>
        <ul style="color:#334155;font-size:14px;line-height:2;padding-left:20px;margin:0 0 24px">
          <li>Your site URL: <a href="${url}" style="color:#0ea5e9">${url}</a></li>
          <li>Add a custom domain in your Vercel dashboard</li>
          <li>Enable bookings from your CrewOS dashboard</li>
          <li>Reply to this email for support</li>
        </ul>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
        <p style="font-size:12px;color:#94a3b8;margin:0">Sent by CrewOS - Built by M.A.D.E Technologies</p>
      </div>`,
    }),
  });
}

function toSlug(s:string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-").slice(0,40);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      businessName, businessTagline="", businessDescription="",
      businessPhone="", businessEmail="", businessAddress="",
      businessType="service", ownerName, ownerEmail,
      service1="", service2="", service3="",
      service4="", service5="", service6="",
      brandColor="#0ea5e9",
      instagram="", facebook="", tiktok="", twitter=""
    } = body;

    if (!businessName?.trim()) {
      return NextResponse.json({error:"Business name is required."},{status:400});
    }
    if (!ownerName?.trim() || !ownerEmail?.trim()) {
      return NextResponse.json({error:"Owner name and email are required."},{status:400});
    }

    const devMode = !SUPABASE_URL || !SUPABASE_SERVICE_KEY || !VERCEL_TOKEN;
    if (devMode) {
      console.log("[provision] Dev mode -- skipping provisioning");
      return NextResponse.json({ok:true, dev:true, url:"https://crewwos-platform.vercel.app"});
    }

    const projectName = `crewos-${toSlug(businessName)}-${Date.now().toString(36)}`;
    const palette = generatePalette(brandColor);

    const envVars: Record<string,string> = {
      NEXT_PUBLIC_BUSINESS_NAME:        businessName.trim(),
      NEXT_PUBLIC_BUSINESS_TAGLINE:     businessTagline.trim(),
      NEXT_PUBLIC_BUSINESS_DESCRIPTION: businessDescription.trim(),
      NEXT_PUBLIC_BUSINESS_PHONE:       businessPhone.trim(),
      NEXT_PUBLIC_BUSINESS_EMAIL:       businessEmail.trim(),
      NEXT_PUBLIC_BUSINESS_ADDRESS:     businessAddress.trim(),
      NEXT_PUBLIC_BUSINESS_TYPE:        businessType,
      NEXT_PUBLIC_BRAND_50:  palette["50"],
      NEXT_PUBLIC_BRAND_100: palette["100"],
      NEXT_PUBLIC_BRAND_500: palette["500"],
      NEXT_PUBLIC_BRAND_600: palette["600"],
      NEXT_PUBLIC_BRAND_700: palette["700"],
      NEXT_PUBLIC_BRAND_900: palette["900"],
      BUSINESS_OWNER_EMAIL:  ownerEmail.trim(),
      BOOKING_FROM_EMAIL:    "noreply@notifications.crewwos.com",
      CREWOS_SUPABASE_URL:         SUPABASE_URL,
      CREWOS_SUPABASE_SERVICE_KEY: SUPABASE_SERVICE_KEY,
      RESEND_API_KEY:              RESEND_API_KEY,
      ...(service1 && {NEXT_PUBLIC_SERVICE_1: service1}),
      ...(service2 && {NEXT_PUBLIC_SERVICE_2: service2}),
      ...(service3 && {NEXT_PUBLIC_SERVICE_3: service3}),
      ...(service4 && {NEXT_PUBLIC_SERVICE_4: service4}),
      ...(service5 && {NEXT_PUBLIC_SERVICE_5: service5}),
      ...(service6 && {NEXT_PUBLIC_SERVICE_6: service6}),
      ...(instagram && {NEXT_PUBLIC_SOCIAL_INSTAGRAM: instagram}),
      ...(facebook  && {NEXT_PUBLIC_SOCIAL_FACEBOOK:  facebook}),
      ...(tiktok    && {NEXT_PUBLIC_SOCIAL_TIKTOK:    tiktok}),
      ...(twitter   && {NEXT_PUBLIC_SOCIAL_TWITTER:   twitter}),
    };

    const {projectId, url} = await createVercelProject(projectName, envVars);

    const workspace = await createWorkspace({
      businessName, businessTagline, businessDescription,
      businessPhone, businessEmail, businessAddress, businessType,
      ownerName, ownerEmail,
      service1, service2, service3, service4, service5, service6,
      brandColor, instagram, facebook, tiktok, twitter,
      vercelProjectId: projectId,
      vercelDeploymentUrl: url,
    });

    try {
      await fetch(`https://api.vercel.com/v10/projects/${projectId}/env${teamQ()}`, {
        method:"POST", headers:vercelHeaders(),
        body:JSON.stringify({key:"CREWOS_WORKSPACE_ID",value:workspace.id,type:"plain",target:["production","preview"]}),
      });
    } catch { console.warn("[provision] Could not inject CREWOS_WORKSPACE_ID"); }

    await sendWelcomeEmail(ownerEmail, ownerName, businessName, url);

    return NextResponse.json({ok:true, workspaceId:workspace.id, url});
  } catch(err:unknown) {
    console.error("[provision] Error:", err);
    return NextResponse.json(
      {error: err instanceof Error ? err.message : "Unexpected error."},
      {status:500}
    );
  }
}