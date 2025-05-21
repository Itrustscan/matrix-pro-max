
// === MATRIX BACKGROUND ANIMATION ===
function startMatrixAnimation() {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
  canvas.style.zIndex = 1;
  canvas.style.opacity = 0.16;
  canvas.style.pointerEvents = "none";
  document.getElementById("matrixBg").appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const cols = Math.floor(canvas.width / 20);
  const yPos = Array(cols).fill(0);

  function drawMatrix() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#39FF14";
    for (let i = 0; i < cols; i++) {
      const text = String.fromCharCode(0x30A0 + Math.random() * 96);
      ctx.fillText(text, i * 20, yPos[i] * 20);
      if (yPos[i] * 20 > canvas.height && Math.random() > 0.97) yPos[i] = 0;
      else yPos[i]++;
    }
    requestAnimationFrame(drawMatrix);
  }
  drawMatrix();
}
window.onload = startMatrixAnimation;

// GDPR & Privacy Notice
const gdprNotice = `
⚠️ Privacy Notice:
- No personal data is collected or sent to any server.
- All diagnostics run locally on your device.
- GDPR compliant: your data remains 100% private.
`;

let userConsents = {};
let resultObj = {};

function getConsents() {
  userConsents = {
    location: document.getElementById("consentLocation").checked,
    clipboard: document.getElementById("consentClipboard").checked,
    webrtc: document.getElementById("consentWebRTC").checked,
    camera: document.getElementById("consentCamera").checked,
    notifications: document.getElementById("consentNotifications").checked,
    all: document.getElementById("consentAll").checked,
  };
  if (userConsents.all) {
    Object.keys(userConsents).forEach(k => userConsents[k] = true);
  }
}

function startDiagnosis() {
  getConsents();
  document.getElementById("resultsDisplay").textContent = "Running Matrix diagnosis... follow the white rabbit.";
  document.getElementById("progressBar").style.display = "block";
  document.querySelector(".progress").style.width = "0%";
  document.getElementById("riskScoreBox").innerHTML = "";

  let prog = 0;
  const interval = setInterval(() => {
    prog += Math.random() * 24;
    document.querySelector(".progress").style.width = Math.min(100, prog) + "%";
    if (prog >= 100) {
      clearInterval(interval);
      doDiagnosis();
      document.getElementById("progressBar").style.display = "none";
    }
  }, 320 + Math.random()*180);
}

function doDiagnosis() {
  const r = {};
  r["Date/Time"] = new Date().toLocaleString();
  r["Device"] = navigator.userAgent;
  r["Platform"] = navigator.platform;
  r["Screen Resolution"] = `${screen.width}x${screen.height}`;
  r["Touchscreen"] = 'ontouchstart' in window ? "Yes" : "No";
  r["Language"] = navigator.language;
  r["Timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;
  r["Incognito/Private Mode"] = navigator.webdriver ? "Yes (possible bot/browser automation)" : "No";
  r["Cookies Enabled"] = navigator.cookieEnabled ? "Yes" : "No";
  r["Online"] = navigator.onLine ? "Yes" : "No";

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn) {
    r["Network Type"] = conn.effectiveType || "Unknown";
    r["Downlink (Mbps)"] = conn.downlink || "Unknown";
    r["Save Data"] = conn.saveData ? "Yes" : "No";
  } else {
    r["Network Info"] = "Unavailable";
  }

  if (navigator.getBattery) {
    navigator.getBattery().then(batt => {
      r["Battery"] = `${(batt.level * 100).toFixed(0)}% (${batt.charging ? "Charging" : "Not charging"})`;
      continueDiagnosis(r);
    }).catch(()=>continueDiagnosis(r));
  } else {
    r["Battery"] = "Unavailable";
    continueDiagnosis(r);
  }
}

function continueDiagnosis(r) {
  if (userConsents.location && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => {
        r["GPS"] = `${pos.coords.latitude}, ${pos.coords.longitude}`;
        runAdvancedDiagnostics(r);
      },
      err => {
        r["GPS"] = "Denied or unavailable";
        runAdvancedDiagnostics(r);
      },
      {timeout: 5000}
    );
  } else {
    r["GPS"] = "Unavailable";
    runAdvancedDiagnostics(r);
  }
}

function runAdvancedDiagnostics(r) {
  if (userConsents.clipboard && navigator.clipboard && navigator.clipboard.readText) {
    navigator.clipboard.readText().then(txt => {
      r["Clipboard Accessible"] = txt.length > 0 ? "Yes (value hidden)" : "Yes (empty)";
      advanced2(r);
    }).catch(()=> {
      r["Clipboard Accessible"] = "No";
      advanced2(r);
    });
  } else {
    r["Clipboard Accessible"] = "Permission not granted / Not supported";
    advanced2(r);
  }
}
function advanced2(r) {
  if (userConsents.webrtc && window.RTCPeerConnection) {
    let ips = [];
    let pc = new RTCPeerConnection({iceServers:[]});
    pc.createDataChannel("");
    pc.onicecandidate = e => {
      if (e && e.candidate && e.candidate.candidate) {
        const parts = e.candidate.candidate.split(" ");
        const ip = parts[4];
        if (ip && !ips.includes(ip)) ips.push(ip);
      } else {
        r["WebRTC IP Leak(s)"] = ips.length > 0 ? ips.join(", ") : "No leak detected";
        advanced3(r);
      }
    };
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
  } else {
    r["WebRTC IP Leak(s)"] = "Permission not granted / Not supported";
    advanced3(r);
  }
}
function advanced3(r) {
  if (userConsents.camera && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({audio:true, video:true}).then(stream => {
      r["Camera/Mic Permission"] = "Granted";
      stream.getTracks().forEach(track=>track.stop());
      advanced4(r);
    }).catch(()=> {
      r["Camera/Mic Permission"] = "Denied";
      advanced4(r);
    });
  } else {
    r["Camera/Mic Permission"] = "Not checked";
    advanced4(r);
  }
}
function advanced4(r) {
  if (userConsents.notifications && "Notification" in window) {
    r["Notifications Permission"] = Notification.permission;
  } else {
    r["Notifications Permission"] = "Not checked";
  }
  r["Headless/Automation Detected"] = navigator.webdriver ? "Yes" : "No";

  let outdated = false;
  let browser = "Unknown";
  let version = "";
  let ua = navigator.userAgent;
  if (/Chrome\/([0-9]+)/.test(ua)) {
    browser = "Chrome";
    version = parseInt(RegExp.$1);
    outdated = version < 110;
  } else if (/Firefox\/([0-9]+)/.test(ua)) {
    browser = "Firefox";
    version = parseInt(RegExp.$1);
    outdated = version < 108;
  } else if (/Edg\/([0-9]+)/.test(ua)) {
    browser = "Edge";
    version = parseInt(RegExp.$1);
    outdated = version < 110;
  } else if (/Safari\/([0-9]+)/.test(ua) && !/Chrome/.test(ua)) {
    browser = "Safari";
    version = parseInt((/Version\/([0-9]+)/.exec(ua) || [])[1]);
    outdated = version && version < 16;
  }
  r["Browser"] = `${browser} ${version}`;
  r["Browser Outdated"] = outdated ? "Yes" : "No";

  finalizeDiagnosis(r);
}

function finalizeDiagnosis(r) {
  r["Plugins"] = navigator.plugins && navigator.plugins.length > 0
    ? Array.from(navigator.plugins).map(p=>p.name).join(", ")
    : "None detected";
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    r["WebGL Supported"] = !!gl ? "Yes" : "No";
  } catch {
    r["WebGL Supported"] = "No";
  }

  const risk = calculateRiskScore(r);
  r["Matrix Risk Score"] = `${risk.score} / 10`;
  r["Matrix Verdict"] = risk.text;
  resultObj = r;

  document.getElementById("resultsDisplay").textContent = JSON.stringify(r, null, 2);
  document.getElementById("riskScoreBox").innerHTML = risk.html;
  localStorage.setItem("diagnostic", JSON.stringify(r));
}

// === Scoring & Verdict helper ===
function calculateRiskScore(r) {
  let score = 0;
  let problems = [];
  if (r["Browser Outdated"] === "Yes") { score += 3; problems.push("Browser outdated"); }
  if (r["WebRTC IP Leak(s)"] && r["WebRTC IP Leak(s)"] !== "No leak detected") { score += 2; problems.push("WebRTC leak"); }
  if (r["Incognito/Private Mode"].startsWith("Yes")) { score += 1; }
  if (r["Camera/Mic Permission"] === "Granted") { score += 1; }
  if (r["Clipboard Accessible"] && r["Clipboard Accessible"].startsWith("Yes")) { score += 1; }
  if (r["Notifications Permission"] === "granted") { score += 1; }
  if (r["Plugins"] && r["Plugins"] !== "None detected") { score += 1; }
  if (r["GPS"] && r["GPS"] !== "Unavailable" && r["GPS"] !== "Denied or unavailable") { score += 1; }
  if (r["Headless/Automation Detected"] === "Yes") { score += 2; problems.push("Automation/Headless"); }
  if (score > 10) score = 10;

  let text, html;
  if (score <= 2) {
    text = "Matrix verdict: LOW RISK. Device is secure. 🟢";
    html = `<span style="color:#39FF14">LOW RISK. 🟢</span>`;
  } else if (score <= 5) {
    text = "Matrix verdict: MODERATE RISK. Review highlighted issues. 🟡";
    html = `<span style="color:orange">MODERATE RISK. 🟡</span>`;
  } else {
    text = "Matrix verdict: HIGH RISK! Immediate action recommended. 🔴\n"+(problems.join(", ") || "");
    html = `<span style="color:#FF4444">HIGH RISK! 🔴</span>`;
  }
  return { score, text, html };
}

// === PDF Export ===
function exportPDF() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    alert("PDF export not supported in your browser.");
    return;
  }
  const doc = new window.jspdf.jsPDF();
  const logo = document.querySelector('.logo');
  if (logo) {
    try {
      // Fallback dacă nu e PNG inline, doar titlu
      doc.setFontSize(18);
      doc.text("iScanTrust PRO+ ULTRA – Matrix Spy Edition", 12, 20);
    } catch{}
  }
  doc.setFontSize(18);
  doc.text("iScanTrust PRO+ ULTRA – Matrix Spy Edition", 12, 20);
  doc.setFontSize(11);
  doc.text(gdprNotice, 12, 30);
  doc.setFontSize(10);
  let y = 45;
  const lines = JSON.stringify(resultObj, null, 2).split('\n');
  for (const line of lines) {
    doc.text(line, 12, y);
    y += 6;
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  }
  doc.save("iScanTrust_Matrix_Report.pdf");
}

// === Email Integration (mailto:) ===
function showEmailInstructions() {
  const report = [
    "iScanTrust PRO+ ULTRA – Matrix Spy Edition\n",
    gdprNotice,
    "Device diagnostic report:\n",
    JSON.stringify(resultObj, null, 2)
  ].join('\n');
  const subject = encodeURIComponent("iScanTrust Diagnostic Report");
  const body = encodeURIComponent(report);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
  setTimeout(() => {
    alert("Your email app should open. If not, please copy the report manually.");
  }, 800);
}

// === Dummy help (poți îmbunătăți la nevoie) ===
function showHelp(id) {
  let msg = "";
  if (id === 1) msg = "Risk score = cât de expus ești la riscuri digitale (0-10). Sub 3 = sigur, peste 6 = atenție!";
  else if (id === 2) msg = "Băncile nu pot garanta 100% siguranța pe niciun device. Folosește doar aplicații oficiale și nu salva parolele în browser.";
  else if (id === 3) msg = "Dacă ai risc mare: actualizează browserul, dezactivează WebRTC, evită extensii dubioase, nu da acces oricui la cameră sau clipboard.";
  else if (id === 4) msg = "Blue pill: browserul se închide și uiți tot. Dar în Matrix totul rămâne Matrix.";
  alert(msg);
}
