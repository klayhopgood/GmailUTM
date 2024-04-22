
function appendUTMParametersToUrl(url, utmParams) {
  let urlObj = new URL(url);

  Object.keys(utmParams).forEach(param => {
    if (!urlObj.searchParams.has(param)) {
      urlObj.searchParams.set(param, utmParams[param]);
    }
  });

  return urlObj.toString();
}

function updateLinks() {
  console.log("Attempting to update links...");
  chrome.storage.local.get(['utmSource', 'utmMedium', 'utmCampaign', 'includeRecipient'], (settings) => {
    if (chrome.runtime.lastError) {
      console.error(`Error retrieving settings: ${chrome.runtime.lastError}`);
      return;
    }

    const utmParams = {
      utm_source: settings.utmSource || 'gmail',
      utm_medium: settings.utmMedium || 'email',
      utm_campaign: settings.utmCampaign || ''
    };

    console.log("Retrieved settings:", settings);

    const composer = document.querySelector('div[contenteditable="true"][role="textbox"]');
    console.log("Composer element:", composer);

    if (composer) {
      const links = composer.querySelectorAll('a');
      console.log("Found links:", links);

      links.forEach(link => {
        console.log("Processing link:", link.href);

        if (link.href && !link.href.includes('utm_')) {
          const newUrl = appendUTMParametersToUrl(link.href, utmParams);
          console.log(`Updating link from ${link.href} to ${newUrl}`);
          link.href = newUrl;
        }
      });
    } else {
      console.log("Could not find the composer element.");
    }
  });
}

function mutationCallback(mutationsList, observer) {
    for (const mutation of mutationsList) {
        console.log(mutation);
        if (mutation.type === 'childList') {
            updateLinks();
        }
    }
}

function watchEmailComposer() {
  const config = { childList: true, subtree: true };

  const targetNode = document.querySelector('div[contenteditable="true"][role="textbox"]');

  if (targetNode) {
    const observer = new MutationObserver(mutationCallback);
    observer.observe(targetNode, config);
    console.log('Observer set up on the email composer');
  } else {
    const intervalId = setInterval(() => {
      const retryTargetNode = document.querySelector('div[contenteditable="true"][role="textbox"]');
      if (retryTargetNode) {
        clearInterval(intervalId);
        const observer = new MutationObserver(mutationCallback);
        observer.observe(retryTargetNode, config);
        console.log('Observer set up on the email composer after retry');
      }
    }, 1000);
  }
}

document.addEventListener('DOMContentLoaded', watchEmailComposer);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateUTMParameters") {
    updateLinks();
  }
});
