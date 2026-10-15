console.log("FormEasy Background Service Worker Running");

chrome.runtime.onInstalled.addListener(async () => {
  console.log("FormEasy installed / updated");
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === 'EXPLAIN_FIELD') {
    const { label, context } = request.payload;
    
    chrome.storage.sync.get(['geminiApiKey', 'formeasy_prefs'], async (result: Record<string, any>) => {
      const apiKey = result.geminiApiKey || result.formeasy_prefs?.geminiApiKey;
      if (!apiKey) {
        sendResponse({
          success: true, 
          data: {
            whatToEnter: "API Key is missing! Please open FormEasy Settings and add your Google Gemini API Key to enable AI analysis.",
            tip: "Click the FormEasy icon, then click 'Settings' at the bottom."
          }
        });
        return;
      }

      try {
        const prompt = `You are FormEasy, an AI assistant that explains online form fields in very simple language to ordinary people.
        Explain exactly what information the user should enter in this field.

        Field Label: "${label}"
        Form Context/Title: "${context || 'General Form'}"

        Respond EXACTLY in this JSON format (and no extra text or markdown):
        {
          "whatToEnter": "Simple, direct explanation of what to enter (1-2 sentences).",
          "example": "A realistic, concrete example of the input.",
          "tip": "A useful tip related to finding or formatting this information.",
          "warning": "Optional. A warning about a very common mistake people make here (or leave empty).",
          "autofillKey": "Optional. ONLY if this field is an EXACT match for one of these: [firstName, lastName, email, phone, dob, gender, bloodGroup, nationality, fathersName, mothersName, maritalStatus, aadhaarNumber, panNumber, correspondenceAddress, permanentAddress, city, state, pincode, annualIncome, ifsc, bankAccount]. Otherwise null."
        }`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (!res.ok) {
          throw new Error("API request failed with status " + res.status);
        }

        const data = await res.json();
        const textStr = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(textStr);

        sendResponse({ success: true, data: parsed });
      } catch (err: any) {
        console.error("AI Error:", err);
        sendResponse({
          success: true,
          data: {
            whatToEnter: "Could not generate AI explanation right now.",
            warning: err.message || "Unknown error occurred."
          }
        });
      }
    });

    return true; // indicates async response
  }

  if (request.type === 'TRIGGER_AUTOFILL_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_AUTOFILL' }, (res) => {
          sendResponse(res || { success: true });
        });
      } else {
        sendResponse({ success: false, error: 'No active tab found' });
      }
    });
    return true;
  }
});
