document.getElementById('analyze').addEventListener('click', async () => {
  const btn = document.getElementById('analyze');
  const resultBox = document.getElementById('resultBox');
  const scoreEl = document.getElementById('score');
  const badgeEl = document.getElementById('badge');
  const recsEl = document.getElementById('recs');

  btn.disabled = true;
  btn.textContent = 'Analyzing with AI...';

  try {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
         const title = document.title;
         const bodyText = document.body.innerText.substring(0, 500);
         return { title, bodyText, url: window.location.href };
      }
    }, async (injectionResults) => {
       const data = injectionResults[0].result;
       let platform = "unknown";
       if (data.url.includes("amazon")) platform = "Amazon";
       if (data.url.includes("swiggy")) platform = "Swiggy";
       if (data.url.includes("zomato")) platform = "Zomato";
       if (data.url.includes("flipkart")) platform = "Flipkart";

       try {
         const res = await fetch('http://127.0.0.1:8000/plugin/analyze', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             user_id: 'demo_user',
             platform: platform,
             content: data.title + " " + data.bodyText,
             demo_mode: false
           })
         });
         const json = await res.json();
         
         resultBox.style.display = 'block';
         scoreEl.textContent = json.impact_score;
         badgeEl.textContent = json.packaging_level;
         badgeEl.className = 'badge ' + json.packaging_level.toLowerCase();
         
         recsEl.innerHTML = '';
         if (json.recommendations) {
           json.recommendations.forEach(r => {
             const li = document.createElement('li');
             li.textContent = r;
             recsEl.appendChild(li);
           });
         }
         
       } catch (err) {
         alert("Cannot reach ZeroTrace AI Local Server.");
       }
       btn.textContent = 'Analyze Current Page';
       btn.disabled = false;
    });
  } catch(e) {
    btn.textContent = 'Error';
  }
});
