import { mkdirSync, writeFileSync, existsSync, copyFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const root = process.cwd();
const stamp = '2026-10-11-150000';
const out = path.join(root, `brag-output-${stamp}`);
const work = path.join(out, 'work');
const frames = path.join(work, 'frames');
mkdirSync(frames, { recursive: true });

const W = 1920, H = 1080, FPS = 30, TOTAL = 600;
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
const clamp = (x,a,b) => Math.max(a, Math.min(b,x));
const fade = (t, start, end) => ease(clamp((t-start)/(end-start), 0, 1));
const text = (x,y,s,size=30,fill='#142841', weight=400, anchor='start', opacity=1, extra='') => `<text x="${x}" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}" ${extra}>${esc(s)}</text>`;
const rect = (x,y,w,h,r,fill,stroke='none', sw=1, opacity=1) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
const line = (x1,y1,x2,y2,stroke='#BAC5D3',sw=1,op=1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`;

function logo(x,y,scale=1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${rect(0,0,46,46,12,'#EDE7DC','#BAC5D3',1)}${line(11,23,35,23,'#798DA6',3)}<circle cx="11" cy="23" r="7" fill="#490B1A" stroke="#E5DED2" stroke-width="2"/><circle cx="35" cy="23" r="7" fill="#142841" stroke="#798DA6" stroke-width="2"/><circle cx="23" cy="23" r="3" fill="#798DA6"/></g>`;
}
function nav(active) {
  const tabs=['Events','Calendar','My Activities','Find People'];
  let x=530;
  let r=`${rect(0,0,W,90,0,'#EDE7DC')}${line(0,90,W,90,'#BAC5D3',1)}${logo(62,22,.82)}${text(122,49,'Connect',27,'#142841',700)}${rect(238,30,57,20,5,'#E2D9CC','#BAC5D3',1)}${text(266,45,'AMRITA',10,'#490B1A',700,'middle')}`;
  for(const t of tabs){ const a=t===active; const w=t==='My Activities'?136:t==='Find People'?118:t==='Calendar'?102:84; r += rect(x,26,w,38,19,a?'#490B1A':'transparent',a?'#798DA6':'none',a?1:0)+text(x+w/2,50,t,15,a?'#E5DED2':'#33475E',a?700:600,'middle');x+=w+10; }
  r += `${rect(1650,27,135,36,8,'#490B1A','#798DA6',1)}${text(1718,51,'+  Create Event',14,'#E5DED2',700,'middle')}${rect(1800,27,42,36,8,'#FAF6F0','#BAC5D3',1)}<circle cx="1821" cy="45" r="7" fill="none" stroke="#142841" stroke-width="2"/>`;
  return r;
}
function card(x,y,w,h,title,kind,detail,slots, od=false, opacity=1) {
  return `<g opacity="${opacity}">${rect(x,y,w,h,18,'#FAF6F0','#BAC5D3',1)}${rect(x+22,y+22,kind.length*8+35,25,12,kind==='Research Call'?'#FDE7C3':'#E2D9CC',kind==='Research Call'?'#D97706':'#BAC5D3',1)}${text(x+39,y+40,kind,12,kind==='Research Call'?'#9A5B08':'#33475E',700)}${od?`${rect(x+w-94,y+23,72,23,11,'#490B1A','#798DA6',1)}${text(x+w-58,y+40,'6h OD',11,'#E5DED2',700,'middle')}`:''}${text(x+22,y+92,title,22,'#142841',700)}${text(x+22,y+123,detail,14,'#33475E',400)}${line(x+22,y+h-88,x+w-22,y+h-88)}${text(x+22,y+h-56,'Oct 18  •  10:00 AM',13,'#4D627B',600)}${text(x+22,y+h-33,'📍  Ettimadai Campus',13,'#4D627B',400)}${rect(x+w-130,y+h-66,108,38,10,'#490B1A','#798DA6',1)}${text(x+w-76,y+h-42,slots,13,'#E5DED2',700,'middle')}</g>`;
}
function eventFeed(t) {
  const enter=fade(t,2.7,3.3); const search=fade(t,3.6,4.3); const q='robotics'; const chars=Math.round(q.length*fade(t,4,4.9));
  let s=nav('Events');
  s+=text(76,170,'Campus life, in one place.',48,'#142841',700,'start',enter)+text(76,206,'Discover workshops, research calls, events, and rides — without the scheduling chaos.',19,'#33475E',400,'start',enter);
  s+=rect(76,250,1768,142,20,'#EDE7DC','#BAC5D3',1,enter)+rect(103,276,988,44,12,'#FFFFFF','#BAC5D3',1,enter)+text(132,304,'⌕',24,'#4D627B',400,'start',enter)+text(170,304,q.slice(0,chars)||'Search by title, skills, venue, organizer, or destination...',16,chars?'#142841':'#4D627B',chars?500:400,'start',enter);
  s+=rect(1120,276,214,44,12,'#FFFFFF','#BAC5D3',1,enter)+text(1140,304,'Date: Earliest First',14,'#142841',600,'start',enter)+text(1305,305,'⌄',18,'#33475E',700,'middle',enter);
  const pills=['All Events','Research','Workshops','Casual & Sports','Creative & Media','Carpool & Travel'];let x=103; for(const p of pills){const a=p==='Research'&&search>.6; const w=p.length*8+42;s+=rect(x,340,w,30,15,a?'#490B1A':'#FAF6F0',a?'#798DA6':'#BAC5D3',1,enter)+text(x+w/2,360,p,12,a?'#E5DED2':'#33475E',a?700:600,'middle',enter);x+=w+10;}
  s+=text(76,444,search>.55?'Showing 2 events':'Showing 8 events',16,'#33475E',600,'start',enter);
  const visible=search>.55?2:3; const cards=[['Autonomous Systems Research Sprint','Research Call','Build perception modules with a cross-campus team.','Join now',true],['ROS2 Navigation Workshop','Workshop','Hands-on autonomous navigation lab.','4 left',true],['Campus Carpool: CBE Airport','Carpool & Travel','Share a ride. Split the fare.','3 left',false]];
  cards.slice(0,visible).forEach((c,i)=>s+=card(76+i*580,478,540,370,...c,enter));
  return s;
}
function calendar(t){ const a=fade(t,7.2,7.8); let s=nav('Calendar');s+=rect(76,138,1768,164,20,'#FAF6F0','#BAC5D3',1,a)+text(110,188,'Academic & Events Calendar',31,'#142841',700,'start',a)+rect(590,159,170,25,12,'#E2D9CC','#BAC5D3',1,a)+text(675,177,'Interval Clash Detector',12,'#490B1A',700,'middle',a)+text(110,220,'Your course timetable, campus activities, and key university dates — synchronized.',16,'#33475E',400,'start',a)+rect(1550,165,220,44,11,'#EDE7DC','#BAC5D3',1,a)+text(1660,193,'October 2026',16,'#142841',700,'middle',a);
  s+=rect(76,330,1125,635,20,'#FAF6F0','#BAC5D3',1,a)+rect(1235,330,609,635,20,'#FAF6F0','#BAC5D3',1,a);
  const days=['SUN','MON','TUE','WED','THU','FRI','SAT'];days.forEach((d,i)=>s+=text(156+i*145,382,d,13,'#4D627B',700,'middle',a));
  let d=1;for(let r=0;r<5;r++)for(let c=0;c<7&&d<=31;c++,d++){const x=104+c*154,y=410+r*98,selected=d===18;s+=rect(x,y,140,84,12,selected?'#F3D8DC':'#EDE7DC',selected?'#490B1A':'#CFD8E2',selected?2:1,a)+text(x+14,y+24,String(d),14,selected?'#490B1A':'#142841',700,'start',a);if(d===18)s+=`${rect(x+12,y+39,114,19,5,'#F9D4D9','#DC2626',1,a)}${text(x+19,y+53,'Mid-Term Assessment',9,'#991B1B',700,'start',a)}${rect(x+12,y+62,114,15,5,'#F3D8DC','#490B1A',1,a)}${text(x+19,y+73,'Research Sprint',8,'#490B1A',700,'start',a)}`;}
  const warn=fade(t,8.4,8.9);s+=text(1280,384,'Daily agenda',13,'#4D627B',700,'start',a)+text(1280,420,'October 18, 2026',25,'#142841',700,'start',a)+rect(1275,455,525,132,15,'#FDE7E9','#DC2626',1,warn)+text(1317,490,'⚠  Schedule Clash Detected',17,'#991B1B',700,'start',warn)+text(1317,522,'A confirmed activity overlaps a mandatory',14,'#33475E',400,'start',warn)+text(1317,546,'university assessment. Plan it before you join.',14,'#33475E',400,'start',warn)+rect(1275,614,525,126,15,'#EDE7DC','#BAC5D3',1,a)+text(1310,648,'EXAM  •  MID-TERM ASSESSMENT 2',11,'#991B1B',700,'start',a)+text(1310,682,'Continuous assessment attendance is mandatory.',15,'#142841',700,'start',a);
  return s;
}
function od(t){const a=fade(t,11.6,12.2);let s=nav('My Activities');s+=text(76,172,'My activities',42,'#142841',700,'start',a)+text(76,205,'Your events, requests, team spaces, and official records.',18,'#33475E',400,'start',a);const tabs=['Joined','Pending','Hosted','OD slips'];let x=76;tabs.forEach(p=>{const ac=p==='OD slips';const w=p.length*10+40;s+=rect(x,244,w,38,18,ac?'#490B1A':'#FAF6F0',ac?'#798DA6':'#BAC5D3',1,a)+text(x+w/2,268,p,14,ac?'#E5DED2':'#33475E',700,'middle',a);x+=w+12;});s+=text(76,350,'Verified institutional On-Duty certificates',26,'#142841',700,'start',a)+text(76,379,'Faculty-authorized attendance regularizations, ready for departmental ERP adjustment.',16,'#33475E',400,'start',a);
  s+=rect(76,425,790,290,20,'#FAF6F0','#BAC5D3',1,a)+rect(105,454,115,27,13,'#D8EFE0','#1E6B3E',1,a)+text(162,473,'●  OD Verified',12,'#1E6B3E',700,'middle',a)+text(105,528,'Autonomous Systems Research Sprint',25,'#142841',700,'start',a)+text(105,560,'Sanctioned by: Dr. Anitha Nair  •  Robotics Lab',15,'#33475E',400,'start',a)+rect(105,594,532,77,13,'#EDE7DC','#BAC5D3',1,a)+text(126,626,'Sanctioned: 6 Hours OD',16,'#490B1A',700,'start',a)+text(126,651,'Amrita Roll: CB.EN.U4ARE24001',12,'#4D627B',400,'start',a)+rect(617,616,218,37,10,'#490B1A','#798DA6',1,a)+text(726,640,'View & Print Certificate',13,'#E5DED2',700,'middle',a);
  const modal=fade(t,13.8,14.5);s+=rect(930,145,850,790,22,'#FFFFFF','#BAC5D3',1,modal)+rect(930,145,850,74,22,'#FAF6F0','#BAC5D3',1,modal)+text(970,190,'▣  Official Institutional On-Duty (OD) Certificate',18,'#142841',700,'start',modal)+rect(1580,165,155,34,17,'#490B1A','#798DA6',1,modal)+text(1657,187,'Print / Save PDF',12,'#E5DED2',700,'middle',modal)+rect(970,254,770,630,16,'#FFFFFF','#142841',4,modal)+text(1355,310,'AMRITA VISHWA VIDYAPEETHAM',25,'#142841',800,'middle',modal)+text(1355,336,'ETTIMADAI CAMPUS  •  COIMBATORE',11,'#4D627B',700,'middle',modal)+rect(1080,360,550,27,4,'#142841','#142841',1,modal)+text(1355,379,'OFFICIAL ATTENDANCE REGULARIZATION (ON-DUTY) SLIP',11,'#E5DED2',700,'middle',modal)+text(1010,430,'REF NO: OD-AMR-2026-CB-VERIFIED',13,'#4D627B',700,'start',modal)+line(1010,450,1700,450,'#BAC5D3',1,modal)+text(1010,500,'Student Name',13,'#4D627B',700,'start',modal)+text(1250,500,'Demo Student',16,'#142841',700,'start',modal)+text(1010,550,'Amrita Roll Number',13,'#4D627B',700,'start',modal)+text(1250,550,'CB.EN.U4ARE24001',16,'#142841',700,'start',modal)+text(1010,600,'Activity / Event',13,'#4D627B',700,'start',modal)+text(1250,600,'Autonomous Systems Research Sprint',16,'#142841',700,'start',modal)+rect(1010,645,690,59,9,'#ECF8F0','#1E6B3E',1,modal)+text(1040,681,'✓  6 Official Hours — Faculty verified',16,'#1E6B3E',700,'start',modal);
  return s;
}
function outro(t){const a=fade(t,17.8,18.5);let s=`<rect width="${W}" height="${H}" fill="#142841"/>`;s+=logo(795,220,2)+text(960,380,'Connect',56,'#E5DED2',700,'middle',a)+text(960,425,'AMRITA VISHWA VIDYAPEETHAM  •  ETTIMADAI CAMPUS',15,'#B8C9DC',700,'middle',a)+text(960,540,'Find the moment. Avoid the clash.',46,'#E5DED2',700,'middle',a)+text(960,592,'Get the official record.',46,'#E5DED2',700,'middle',a)+rect(730,666,460,52,26,'#490B1A','#798DA6',1,a)+text(960,699,'Connect with people. Discover events. Build together.',17,'#E5DED2',700,'middle',a);return s;}
function scene(t){if(t<7.1)return eventFeed(t);if(t<11.5)return calendar(t);if(t<17.7)return od(t);return outro(t);}

for(let i=0;i<TOTAL;i++){
  const t=i/FPS;
  const body=scene(t);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" fill="#E5DED2"/>${body}<rect width="${W}" height="${H}" fill="none" stroke="#142841" stroke-width="0"/></svg>`;
  writeFileSync(path.join(frames, `frame-${String(i).padStart(4,'0')}.svg`), svg);
}

const plan = `# Connect — launch video plan\n\n## Angle\nA single Amrita campus hub that turns a crowded student schedule into a clear path: discover the right opportunity, detect conflicts before they happen, and keep the official proof.\n\n## Audience\nAmrita students who juggle events, research, travel and attendance; faculty coordinators who need reliable approvals and records.\n\n## Tone and identity\nPolished, institutional, warm: the app’s actual cream (#E5DED2), burgundy (#490B1A), navy (#142841) and blue-grey (#798DA6) palette.\n\n## Storyboard — 20 seconds\n1. 0–7.1s — Events: search the real product vocabulary for robotics and surface relevant research/workshop opportunities.\n2. 7.1–11.5s — Calendar: show the academic calendar and the interval-clash warning on Oct 18.\n3. 11.5–17.7s — OD records: move from verified OD card to official, printable certificate.\n4. 17.7–20s — Outro: Connect’s promise and campus identity.\n\n## Share caption\nMeet Connect — the Amrita campus hub for finding opportunities, catching schedule clashes early, and keeping verified OD records in one place.\n`;
writeFileSync(path.join(out,'brag-plan.md'), plan);
writeFileSync(path.join(out,'share-copy.txt'), 'Meet Connect — the Amrita campus hub for finding opportunities, catching schedule clashes early, and keeping verified OD records in one place.');

execFileSync('ffmpeg', ['-y','-framerate',String(FPS),'-i',path.join(frames,'frame-%04d.svg'),'-f','lavfi','-i','sine=frequency=110:sample_rate=48000:duration=20','-f','lavfi','-i','sine=frequency=220:sample_rate=48000:duration=20','-filter_complex','[1:a]volume=0.045[a1];[2:a]volume=0.020,adelay=250|250[a2];[a1][a2]amix=inputs=2:duration=longest,afade=t=in:st=0:d=0.8,afade=t=out:st=19:d=1[a]','-map','0:v','-map','[a]','-c:v','libx264','-pix_fmt','yuv420p','-crf','19','-preset','medium','-c:a','aac','-b:a','128k','-shortest',path.join(out,'brag.mp4')], {stdio:'inherit'});
execFileSync('ffmpeg', ['-y','-i',path.join(out,'brag.mp4'),'-vf','select=eq(n\\,540)','-vframes','1',path.join(out,'brag.jpg')], {stdio:'inherit'});
console.log(out);
