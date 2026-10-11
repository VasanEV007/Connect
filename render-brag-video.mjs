import { writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const out = path.join(process.cwd(), 'brag-output-2026-10-11-150000');
const work = path.join(out, 'work');
mkdirSync(work, { recursive: true });
const ass = [];
ass.push('[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\nScaledBorderAndShadow: yes\n');
ass.push('[V4+ Styles]\nFormat: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding\n');
ass.push('Style: Default,Arial,30,&HFF412814,&H000000FF,&H00142841,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1\n');
ass.push('Style: Strong,Arial,30,&HFF412814,&H000000FF,&H00142841,&H00000000,1,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1\n');
ass.push('[Events]\nFormat: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text\n');
const ts = n => `0:00:${String(Math.floor(n)).padStart(2,'0')}.${Math.round((n%1)*100).toString().padStart(2,'0')}`;
const dl = (a,b,style,text) => ass.push(`Dialogue: 0,${ts(a)},${ts(b)},${style},,0,0,0,,${text}\n`);
// ASS colours are AABBGGRR. Source colours below use a leading FF as a readable
// opaque marker; convert that marker to alpha 00 before handing it to libass.
const assColor = c => c.startsWith('FF') ? `00${c.slice(2)}` : c;
const box = (a,b,x,y,w,h,c,rad=0) => dl(a,b,'Default',`{\\p1\\pos(${x},${y})\\c&H${assColor(c)}&}m 0 0 l ${w} 0 l ${w} ${h} l 0 ${h}`);
const tx = (a,b,x,y,text,size=30,color='FF412814',strong=false,align=7) => dl(a,b,strong?'Strong':'Default',`{\\an${align}\\pos(${x},${y})\\fs${size}\\c&H${assColor(color)}&}${text}`);
// Four crisp, readable UI scenes. ASS shape layers keep everything vector-sharp at 1080p.
for (const [a,b] of [[0,5],[5,10],[10,15],[15,20]]) box(a,b,0,0,1920,1080,'FFD2DEE5');
// Scene 1: event feed
box(0,5,0,0,1920,90,'FFDCE7ED'); box(0,5,0,89,1920,2,'FFD3C5BA');
box(0,5,62,22,46,46,'FFDCE7ED'); box(0,5,69,39,12,12,'FF1A0B49'); box(0,5,91,39,12,12,'FF412814');
tx(0,5,122,51,'Connect',27,'FF412814',true); tx(0,5,250,50,'AMRITA',10,'FF1A0B49',true);
for(const [x,w,label,on] of [[530,84,'Events',true],[625,102,'Calendar',false],[737,136,'My Activities',false],[883,118,'Find People',false]]) {box(0,5,x,26,w,38,on?'FF1A0B49':'00FFFFFF');tx(0,5,x+w/2,51,label,15,on?'FFD2DEE5':'FF5E4733',true,8)}
box(0,5,1650,27,135,36,'FF1A0B49');tx(0,5,1717,51,'+  Create Event',14,'FFD2DEE5',true,8);
tx(0,5,76,170,'Campus life, in one place.',48,'FF412814',true);tx(0,5,76,208,'Discover workshops, research calls, events, and rides — without the scheduling chaos.',19,'FF5E4733');
box(0,5,76,250,1768,142,'FFDCE7ED');box(0,5,103,276,988,44,'FFFFFFFF');tx(0,5,132,305,'⌕',24,'FF7B624D');tx(0,2.1,170,305,'Search by title, skills, venue, organizer, or destination...',16,'FF7B624D');tx(2.1,5,170,305,'robotics',16,'FF412814',true);
for(const [x,w,label,on] of [[103,108,'All Events',false],[221,95,'Research',true],[326,106,'Workshops',false],[442,140,'Casual & Sports',false],[592,138,'Creative & Media',false],[740,130,'Carpool & Travel',false]]){box(0,5,x,340,w,30,on?'FF1A0B49':'FFF0F6FA');tx(0,5,x+w/2,361,label,12,on?'FFD2DEE5':'FF5E4733',true,8)}
tx(0,2.1,76,444,'Showing 8 events',16,'FF5E4733',true);tx(2.1,5,76,444,'Showing 2 events',16,'FF5E4733',true);
const cards=[['Autonomous Systems Research Sprint','Research Call','Build perception modules with a cross-campus team.','Join now'],['ROS2 Navigation Workshop','Workshop','Hands-on autonomous navigation lab.','4 left']];
cards.forEach((c,i)=>{const x=76+i*580;box(0,5,x,478,540,370,'FFF0F6FA');box(0,5,x+22,500,c[1]==='Research Call'?128:96,25,c[1]==='Research Call'?'FFC3E7FD':'FFE2D9E2');tx(0,5,x+38,518,c[1],12,c[1]==='Research Call'?'FF085B9A':'FF5E4733',true);tx(0,5,x+22,570,c[0],22,'FF412814',true);tx(0,5,x+22,601,c[2],14,'FF5E4733');tx(0,5,x+22,658,'Oct 18  •  10:00 AM',13,'FF7B624D',true);box(0,5,x+410,650,108,38,'FF1A0B49');tx(0,5,x+464,675,c[3],13,'FFD2DEE5',true,8)});
// Scene 2: academic calendar
box(5,10,0,0,1920,90,'FFDCE7ED');tx(5,10,78,52,'Connect',27,'FF412814',true);tx(5,10,625,51,'Calendar',15,'FFD2DEE5',true,8);box(5,10,594,26,102,38,'FF1A0B49');
box(5,10,76,138,1768,164,'FFF0F6FA');tx(5,10,110,188,'Academic & Events Calendar',31,'FF412814',true);box(5,10,590,159,170,25,'FFE2D9E2');tx(5,10,675,178,'Interval Clash Detector',12,'FF1A0B49',true,8);tx(5,10,110,220,'Your course timetable, campus activities, and key university dates — synchronized.',16,'FF5E4733');
box(5,10,76,330,1125,635,'FFF0F6FA');box(5,10,1235,330,609,635,'FFF0F6FA');tx(5,10,1280,384,'DAILY AGENDA',13,'FF7B624D',true);tx(5,10,1280,420,'October 18, 2026',25,'FF412814',true);
for(let r=0;r<4;r++)for(let c=0;c<7;c++){const n=r*7+c+1,x=104+c*154,y=410+r*98,sel=n===18;box(5,10,x,y,140,84,sel?'FFD9F3F3':'FFDCE7ED');tx(5,10,x+14,y+24,String(n),14,sel?'FF1A0B49':'FF412814',true);if(sel){box(5,10,x+12,y+39,114,19,'FFD9F4FD');tx(5,10,x+18,y+53,'Mid-Term Assessment',9,'FF1B2699',true);box(5,10,x+12,y+61,114,16,'FFF3D8F3');tx(5,10,x+18,y+73,'Research Sprint',8,'FF1A0B49',true)}}
box(5,10,1275,455,525,132,'FFE9D4F9');tx(5,10,1317,490,'⚠  Schedule Clash Detected',17,'FF1B2699',true);tx(5,10,1317,522,'A confirmed activity overlaps a mandatory',14,'FF5E4733');tx(5,10,1317,546,'university assessment. Plan it before you join.',14,'FF5E4733');
// Scene 3: OD proof
box(10,15,0,0,1920,90,'FFDCE7ED');tx(10,15,78,52,'Connect',27,'FF412814',true);box(10,15,737,26,136,38,'FF1A0B49');tx(10,15,805,51,'My Activities',15,'FFD2DEE5',true,8);tx(10,15,76,172,'My activities',42,'FF412814',true);tx(10,15,76,205,'Your events, requests, team spaces, and official records.',18,'FF5E4733');
box(10,15,76,425,790,290,'FFF0F6FA');box(10,15,105,454,115,27,'FFE0EFD8');tx(10,15,162,473,'●  OD Verified',12,'FF3E6B1E',true,8);tx(10,15,105,528,'Autonomous Systems Research Sprint',25,'FF412814',true);tx(10,15,105,560,'Sanctioned by: Dr. Anitha Nair  •  Robotics Lab',15,'FF5E4733');box(10,15,105,594,532,77,'FFDCE7ED');tx(10,15,126,626,'Sanctioned: 6 Hours OD',16,'FF1A0B49',true);box(10,15,617,616,218,37,'FF1A0B49');tx(10,15,726,640,'View & Print Certificate',13,'FFD2DEE5',true,8);
box(12.3,15,930,145,850,790,'FFFFFFFF');box(12.3,15,930,145,850,74,'FFF0F6FA');tx(12.3,15,970,190,'▣  Official Institutional On-Duty (OD) Certificate',18,'FF412814',true);box(12.3,15,1580,165,155,34,'FF1A0B49');tx(12.3,15,1657,187,'Print / Save PDF',12,'FFD2DEE5',true,8);box(12.3,15,970,254,770,630,'FFFFFFFF');tx(12.3,15,1355,310,'AMRITA VISHWA VIDYAPEETHAM',25,'FF412814',true,8);tx(12.3,15,1355,336,'ETTIMADAI CAMPUS  •  COIMBATORE',11,'FF7B624D',true,8);box(12.3,15,1080,360,550,27,'FF412814');tx(12.3,15,1355,379,'OFFICIAL ATTENDANCE REGULARIZATION (ON-DUTY) SLIP',11,'FFFFFFFF',true,8);tx(12.3,15,1010,430,'REF NO: OD-AMR-2026-CB-VERIFIED',13,'FF7B624D',true);tx(12.3,15,1010,500,'Student Name',13,'FF7B624D',true);tx(12.3,15,1250,500,'Demo Student',16,'FF412814',true);tx(12.3,15,1010,550,'Amrita Roll Number',13,'FF7B624D',true);tx(12.3,15,1250,550,'CB.EN.U4ARE24001',16,'FF412814',true);box(12.3,15,1010,645,690,59,'FFF0F8EC');tx(12.3,15,1040,681,'✓  6 Official Hours — Faculty verified',16,'FF3E6B1E',true);
// Scene 4: definitive close
box(15,20,0,0,1920,1080,'FF412814');box(15,20,885,205,150,150,'FFDCE7ED');box(15,20,910,253,35,35,'FF1A0B49');box(15,20,975,253,35,35,'FF412814');tx(15,20,960,435,'Connect',56,'FFD2DEE5',true,8);tx(15,20,960,478,'AMRITA VISHWA VIDYAPEETHAM  •  ETTIMADAI CAMPUS',15,'FFDCC9B8',true,8);tx(15,20,960,590,'Find the moment. Avoid the clash.',46,'FFD2DEE5',true,8);tx(15,20,960,646,'Get the official record.',46,'FFD2DEE5',true,8);box(15,20,730,712,460,52,'FF1A0B49');tx(15,20,960,746,'Connect with people. Discover events. Build together.',17,'FFD2DEE5',true,8);

writeFileSync(path.join(work,'brag.ass'), ass.join(''));
writeFileSync(path.join(work,'share-copy.txt'), 'Meet Connect — the Amrita campus hub for finding opportunities, catching schedule clashes early, and keeping verified OD records in one place.');
const filter = `subtitles='${path.join(work,'brag.ass').replaceAll('\\','/').replace(':','\\:')}'`;
execFileSync('ffmpeg',['-y','-threads','1','-f','lavfi','-i','color=c=#E5DED2:s=1920x1080:r=30:d=20','-f','lavfi','-i','sine=frequency=110:sample_rate=48000:duration=20','-f','lavfi','-i','sine=frequency=220:sample_rate=48000:duration=20','-filter_complex',`[0:v]${filter}[v];[1:a]volume=0.045[a1];[2:a]volume=0.020,adelay=250|250[a2];[a1][a2]amix=inputs=2:duration=longest,afade=t=in:st=0:d=0.8,afade=t=out:st=19:d=1[a]`,'-map','[v]','-map','[a]','-c:v','libx264','-threads','1','-pix_fmt','yuv420p','-crf','20','-preset','ultrafast','-c:a','aac','-b:a','128k',path.join(out,'brag.mp4')],{stdio:'inherit'});
execFileSync('ffmpeg',['-y','-ss','16','-i',path.join(out,'brag.mp4'),'-frames:v','1',path.join(out,'brag.jpg')],{stdio:'inherit'});
console.log(out);
