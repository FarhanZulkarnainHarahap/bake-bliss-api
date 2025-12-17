import type { Response } from "express";

export function sendServerError(res: Response): void {
  res.status(500).send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>BakeBliss API - Error</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(circle at top, #020617, #000);
      color: #38bdf8; font-family: "JetBrains Mono", monospace; overflow: hidden;
    }
    .panel {
      position: relative; width: 680px; padding: 48px; border-radius: 16px;
      border: 1px solid rgba(239, 68, 68, 0.5);
      background: linear-gradient(180deg, rgba(2,6,23,.9), rgba(2,6,23,.7));
      box-shadow: 0 0 40px rgba(239,68,68,.15), inset 0 0 20px rgba(239,68,68,.05);
      animation: boot .8s ease-out forwards;
    }
    @keyframes boot { from {opacity:0; transform:scale(.95) translateY(10px);} to {opacity:1; transform:scale(1) translateY(0);} }
    .panel::before,.panel::after{
      content:""; position:absolute; inset:-2px; border-radius:18px;
      border:1px solid rgba(239,68,68,.35); pointer-events:none; animation:pulse 3s linear infinite;
    }
    .panel::after{ filter:blur(6px); opacity:.6; }
    @keyframes pulse{0%{opacity:.3} 50%{opacity:.6} 100%{opacity:.3}}
    .title{ text-align:center; font-size:26px; margin-bottom:24px; color:#fecaca; }
    pre{ margin:0; font-size:18px; line-height:1.8; letter-spacing:.5px; white-space:pre-wrap; }
    .error{ color:#ef4444; font-weight:bold; animation:blink 1.4s infinite; }
    @keyframes blink{0%,100%{opacity:1} 50%{opacity:.4}}
    #time{ color:#facc15; font-weight:bold; }
    .scanline{
      position:absolute; left:0; right:0; height:2px;
      background:linear-gradient(90deg, transparent, rgba(239,68,68,.6), transparent);
      animation:scan 4s linear infinite;
    }
    @keyframes scan{ from{top:0} to{top:100%} }
  </style>
</head>
<body>
  <div class="panel">
    <div class="scanline"></div>
    <div class="title">◆ SYSTEM ERROR ◆</div>
    <pre>
[SYSTEM STATUS]
SERVICE : BAKEBLISS API
STATE   : <span class="error">ERROR</span>
TIME    : <span id="time"></span>

AN UNEXPECTED ERROR OCCURRED
PLEASE TRY AGAIN LATER
    </pre>
  </div>
  <script>
    const timeEl=document.getElementById("time");
    function updateTime(){ timeEl.textContent=new Date().toISOString(); }
    updateTime(); setInterval(updateTime,1000);
  </script>
</body>
</html>
`);
}
