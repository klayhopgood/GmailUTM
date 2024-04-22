// Function to update links with UTM parameters
function appendUTMParametersToUrl(url, utmParams) {
  // Parse the URL
  let urlObj = new URL(url);

  // Add UTM parameters if they don't exist
  Object.keys(utmParams).forEach(param => {
    if (!urlObj.searchParams.has(param)) {
      urlObj.searchParams.set(param, utmParams[param]);
    }
  });

  // Return the modified URL
  return urlObj.toString();
}

// Function to update all links within the email body with UTM parameters
function updateLinks() {
  console.log("Attempting to update links...");
  // Retrieve UTM settings from storage
  chrome.storage.local.get(['utmSource', 'utmMedium', 'utmCampaign', 'includeRecipient'], (settings) => {
    if (chrome.runtime.lastError) {
      console.error(`Error retrieving settings: ${chrome.runtime.lastError}`);
      return;
    }

    // Define UTM parameters based on settings
    const utmParams = {
      utm_source: settings.utmSource || 'gmail',
      utm_medium: settings.utmMedium || 'email',
      utm_campaign: settings.utmCampaign || ''
    };

    console.log("Retrieved settings:", settings);

    // Logic to find and update links
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

// Callback function for the MutationObserver to call updateLinks when changes are observed
function mutationCallback(mutationsList, observer) {
    for (const mutation of mutationsList) {
        console.log(mutation); // This should log any mutations occurring in the composer.
        if (mutation.type === 'childList') {
            updateLinks();
        }
    }
}

// Function to set up the MutationObserver on the Gmail composer element
function watchEmailComposer() {
  const config = { childList: true, subtree: true };

  // Gmail's email body field might be identifiable with attributes like 'contenteditable' and 'role'
  const targetNode = document.querySelector('div[contenteditable="true"][role="textbox"]');

  if (targetNode) {
    const observer = new MutationObserver(mutationCallback);
    observer.observe(targetNode, config);
    console.log('Observer set up on the email composer');
  } else {
    // If not found on initial load, set up a periodic check to find the composer
    const intervalId = setInterval(() => {
      const retryTargetNode = document.querySelector('div[contenteditable="true"][role="textbox"]');
      if (retryTargetNode) {
        clearInterval(intervalId);
        const observer = new MutationObserver(mutationCallback);
        observer.observe(retryTargetNode, config);
        console.log('Observer set up on the email composer after retry');
      }
    }, 1000); // Check every second
  }
}


// Start observing when DOM is fully loaded
document.addEventListener('DOMContentLoaded', watchEmailComposer);

// Listener for messages from the popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === "updateUTMParameters") {
    updateLinks();
  }
});
