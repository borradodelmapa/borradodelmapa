param($id)
$d=$PSScriptRoot; $e="C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"; $u="file:///"+$d.Replace([char]92,[char]47)+"/$id.html"
$ff="C:\Users\User\Desktop\salma\salma marketing\india\herramientas\node_modules\ffmpeg-static\ffmpeg.exe"
& $e --headless=new --disable-gpu --hide-scrollbars --virtual-time-budget=8000 --window-size=1080,1920 "--screenshot=$d\$id.png" $u 2>$null | Out-Null
& $ff -v error -y -i "$d\$id.png" -q:v 2 "$d\$id.jpg"
& $ff -v error -y -i "$d\$id.png" -vf scale=90:160 "$d\$id-160.png"
