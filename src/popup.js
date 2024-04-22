document.getElementById('saveSettings').addEventListener('click', () => {
    const utmSource = document.getElementById('utmSource').value;
    const utmMedium = document.getElementById('utmMedium').value;
    const utmCampaign = document.getElementById('utmCampaign').value;
    const includeRecipient = document.getElementById('includeRecipient').checked;

    chrome.storage.local.set({
        utmSource: utmSource,
        utmMedium: utmMedium,
        utmCampaign: utmCampaign,
        includeRecipient: includeRecipient
    }, () => {
        if (chrome.runtime.lastError) {
            console.error(`Error saving settings: ${chrome.runtime.lastError}`);
        } else {
            console.log('Settings saved');

            chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, {action: "updateUTMParameters"});
            });
        }
    });
});
