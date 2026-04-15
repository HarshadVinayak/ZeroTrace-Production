// content.js - ZeroTrace DOM Injector
setTimeout(async () => {
  const title = document.title;
  let platform = "unknown";
  if (window.location.href.includes("amazon")) platform = "Amazon";
  if (window.location.href.includes("swiggy")) platform = "Swiggy";
  if (window.location.href.includes("flipkart")) platform = "Flipkart";
  
  if (platform !== "unknown") {
      try {
        const bodyText = document.body.innerText.substring(0, 300);
        const res = await fetch('http://127.0.0.1:8000/plugin/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'demo_user',
            platform: platform,
            content: title + " " + bodyText,
            demo_mode: false
          })
        });
        
        const json = await res.json();
        
        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.bottom = "20px";
        overlay.style.right = "20px";
        overlay.style.width = "300px";
        overlay.style.backgroundColor = "rgba(15, 23, 42, 0.95)";
        overlay.style.color = "#fff";
        overlay.style.padding = "20px";
        overlay.style.borderRadius = "16px";
        overlay.style.backdropFilter = "blur(10px)";
        overlay.style.boxShadow = "0 10px 40px rgba(0, 255, 159, 0.2)";
        overlay.style.border = "1px solid rgba(0,255,159,0.3)";
        overlay.style.zIndex = "999999";
        overlay.style.fontFamily = "sans-serif";
        
        let color = "#00ff9f";
        if(json.packaging_level === "high") color = "#ef4444";
        if(json.packaging_level === "medium") color = "#eab308";
        
        overlay.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
             <strong>ZeroTrace AI Insights</strong>
             <span style="background:${color}; color:#000; padding:2px 8px; border-radius:12px; font-size:12px; font-weight:bold;">${json.impact_score}/100</span>
          </div>
          <div style="font-size:12px; color:#cbd5e1; margin-bottom:10px;">
             Packaging: <strong style="text-transform:uppercase">${json.packaging_level}</strong>
          </div>
          <ul style="font-size:12px; padding-left:14px; margin:0; color:#e2e8f0;">
             ${json.recommendations ? json.recommendations.map(r => `<li>${r}</li>`).join('') : ''}
          </ul>
          <button id="zt-close" style="width:100%; margin-top:15px; background:rgba(255,255,255,0.1); border:none; color:#fff; padding:8px; border-radius:8px; cursor:pointer;">Dismiss</button>
        `;
        
        document.body.appendChild(overlay);
        document.getElementById('zt-close').onclick = () => overlay.remove();
        
      } catch(e) {
          console.log("ZeroTrace Extension: LLM Server unreachable.");
      }
  }
}, 3000);
