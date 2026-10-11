$ErrorActionPreference = 'Stop'

$ffmpeg = 'C:\Users\eluma\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe'
$root = 'C:\Users\eluma\Downloads\ConnectFourTeamFinal-master\brag-output-2026-10-11-183000'
$font = 'C\:/Windows/Fonts/segoeuib.ttf'
$regular = 'C\:/Windows/Fonts/segoeui.ttf'

# A compact product reel built from CampusConnect's navy, cream, and burgundy tokens.
$filter = @"
color=c=0x142841:s=1920x1080:d=18:r=30,
drawbox=x=0:y=0:w=1920:h=14:color=0x490B1A:t=fill,
drawbox=x=0:y=1040:w=1920:h=40:color=0x0E1E33:t=fill,
drawbox=x=96:y=146:w=1728:h=790:color=0x182E4B:t=fill:enable='between(t,0,3)',
drawbox=x=96:y=146:w=16:h=790:color=0x490B1A:t=fill:enable='between(t,0,3)',
drawbox=x=1210:y=260:w=430:h=430:color=0x490B1A:t=fill:enable='between(t,0,3)',
drawbox=x=1250:y=300:w=350:h=350:color=0xE5DED2:t=fill:enable='between(t,0,3)',
drawtext=fontfile='$font':text='C':fontcolor=0x490B1A:fontsize=250:x=1360:y=330:enable='between(t,0,3)',
drawtext=fontfile='$font':text='CAMPUSCONNECT':fontcolor=0xE5DED2:fontsize=78:x=190:y=330:enable='between(t,0,3)',
drawtext=fontfile='$regular':text='One campus. Every opportunity.':fontcolor=0xB8C9DC:fontsize=40:x=195:y=440:enable='between(t,0,3)',
drawtext=fontfile='$regular':text='Discover   •   Coordinate   •   Belong':fontcolor=0xE5DED2:fontsize=29:x=195:y=755:enable='between(t,0,3)',
drawbox=x=96:y=146:w=1728:h=790:color=0x182E4B:t=fill:enable='between(t,3,6)',
drawbox=x=150:y=265:w=690:h=480:color=0x1D3759:t=fill:enable='between(t,3,6)',
drawbox=x=150:y=265:w=690:h=12:color=0x490B1A:t=fill:enable='between(t,3,6)',
drawbox=x=890:y=320:w=760:h=110:color=0xE5DED2:t=fill:enable='between(t,3,6)',
drawbox=x=890:y=462:w=430:h=190:color=0x0E1E33:t=fill:enable='between(t,3,6)',
drawbox=x=1350:y=462:w=300:h=190:color=0x490B1A:t=fill:enable='between(t,3,6)',
drawtext=fontfile='$regular':text='EVENTS':fontcolor=0xB8C9DC:fontsize=25:x=205:y=320:enable='between(t,3,6)',
drawtext=fontfile='$font':text='Find your next\nopportunity.':fontcolor=0xE5DED2:fontsize=58:x=205:y=390:line_spacing=12:enable='between(t,3,6)',
drawtext=fontfile='$font':text='Search events, workshops, research calls':fontcolor=0x142841:fontsize=30:x=940:y=355:enable='between(t,3,6)',
drawtext=fontfile='$font':text='Open for joining':fontcolor=0xE5DED2:fontsize=34:x=940:y=520:enable='between(t,3,6)',
drawtext=fontfile='$font':text='Join now':fontcolor=0xE5DED2:fontsize=34:x=1415:y=520:enable='between(t,3,6)',
drawbox=x=96:y=146:w=1728:h=790:color=0xE5DED2:t=fill:enable='between(t,6,9)',
drawbox=x=150:y=250:w=1120:h=530:color=0xFFFFFF:t=fill:enable='between(t,6,9)',
drawbox=x=150:y=250:w=1120:h=70:color=0x142841:t=fill:enable='between(t,6,9)',
drawbox=x=1335:y=250:w=320:h=530:color=0x490B1A:t=fill:enable='between(t,6,9)',
drawbox=x=360:y=380:w=360:h=95:color=0xEF4444:t=fill:enable='between(t,6,9)',
drawbox=x=680:y=550:w=410:h=95:color=0x22C55E:t=fill:enable='between(t,6,9)',
drawtext=fontfile='$font':text='CALENDAR':fontcolor=0xE5DED2:fontsize=32:x=200:y=270:enable='between(t,6,9)',
drawtext=fontfile='$font':text='Plan with\nconfidence.':fontcolor=0xE5DED2:fontsize=54:x=1380:y=390:line_spacing=10:enable='between(t,6,9)',
drawtext=fontfile='$regular':text='Automatically spot timetable clashes':fontcolor=0xB8C9DC:fontsize=25:x=1380:y=570:enable='between(t,6,9)',
drawtext=fontfile='$font':text='Clash detected':fontcolor=0xFFFFFF:fontsize=27:x=410:y=410:enable='between(t,6,9)',
drawtext=fontfile='$font':text='Resolved':fontcolor=0x142841:fontsize=27:x=790:y=580:enable='between(t,6,9)',
drawbox=x=96:y=146:w=1728:h=790:color=0x0E1E33:t=fill:enable='between(t,9,12)',
drawbox=x=150:y=250:w=680:h=470:color=0x182E4B:t=fill:enable='between(t,9,12)',
drawbox=x=915:y=250:w=740:h=470:color=0x1D3759:t=fill:enable='between(t,9,12)',
drawbox=x=970:y=550:w=540:h=74:color=0x490B1A:t=fill:enable='between(t,9,12)',
drawtext=fontfile='$font':text='CARPOOL':fontcolor=0xB8C9DC:fontsize=26:x=205:y=310:enable='between(t,9,12)',
drawtext=fontfile='$font':text='Move together.':fontcolor=0xE5DED2:fontsize=57:x=205:y=385:enable='between(t,9,12)',
drawtext=fontfile='$regular':text='Safer rides. Fair splits.\nCampus-to-city connections.':fontcolor=0xB8C9DC:fontsize=32:x=205:y=495:line_spacing=14:enable='between(t,9,12)',
drawtext=fontfile='$font':text='Coimbatore Junction':fontcolor=0xE5DED2:fontsize=37:x=970:y=330:enable='between(t,9,12)',
drawtext=fontfile='$regular':text='3 seats available  •  ₹90 split':fontcolor=0xB8C9DC:fontsize=29:x=970:y=415:enable='between(t,9,12)',
drawtext=fontfile='$font':text='Request a seat':fontcolor=0xE5DED2:fontsize=30:x=1130:y=570:enable='between(t,9,12)',
drawbox=x=96:y=146:w=1728:h=790:color=0x182E4B:t=fill:enable='between(t,12,15)',
drawbox=x=260:y=220:w=1400:h=620:color=0xFFFFFF:t=fill:enable='between(t,12,15)',
drawbox=x=260:y=220:w=1400:h=95:color=0x490B1A:t=fill:enable='between(t,12,15)',
drawbox=x=1190:y=625:w=330:h=72:color=0x1E6B3E:t=fill:enable='between(t,12,15)',
drawtext=fontfile='$font':text='AMRITA VISHWA VIDYAPEETHAM':fontcolor=0xE5DED2:fontsize=32:x=330:y=250:enable='between(t,12,15)',
drawtext=fontfile='$font':text='Verified On-Duty Certificate':fontcolor=0x142841:fontsize=52:x=340:y=390:enable='between(t,12,15)',
drawtext=fontfile='$regular':text='OD-AMR-2026-CB-VERIFIED':fontcolor=0x490B1A:fontsize=32:x=340:y=485:enable='between(t,12,15)',
drawtext=fontfile='$regular':text='Official records, ready when you are.':fontcolor=0x33475E:fontsize=30:x=340:y=570:enable='between(t,12,15)',
drawtext=fontfile='$font':text='VERIFIED':fontcolor=0xFFFFFF:fontsize=30:x=1250:y=645:enable='between(t,12,15)',
drawbox=x=0:y=0:w=1920:h=1080:color=0x142841:t=fill:enable='between(t,15,18)',
drawbox=x=720:y=220:w=480:h=480:color=0x490B1A:t=fill:enable='between(t,15,18)',
drawbox=x=755:y=255:w=410:h=410:color=0xE5DED2:t=fill:enable='between(t,15,18)',
drawtext=fontfile='$font':text='C':fontcolor=0x490B1A:fontsize=270:x=862:y=310:enable='between(t,15,18)',
drawtext=fontfile='$font':text='CAMPUSCONNECT':fontcolor=0xE5DED2:fontsize=64:x=600:y=770:enable='between(t,15,18)',
drawtext=fontfile='$regular':text='Your campus. Connected.':fontcolor=0xB8C9DC:fontsize=34:x=715:y=855:enable='between(t,15,18)',scale=1280:720
"@ -replace "`r?`n", ''

& $ffmpeg -y -f lavfi -i "sine=frequency=110:sample_rate=48000:duration=18" -filter_complex "$filter[v];[0:a]volume=0.10[a]" -map '[v]' -map '[a]' -c:v libx264 -pix_fmt yuv420p -crf 18 -preset medium -c:a aac -b:a 160k -movflags +faststart "$root\brag.mp4"
& $ffmpeg -y -ss 16 -i "$root\brag.mp4" -frames:v 1 -q:v 2 "$root\brag.jpg"
Set-Content -Encoding utf8 "$root\share-copy.txt" 'CampusConnect keeps campus life moving — discover, coordinate, and belong.'
