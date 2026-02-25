// Mobile Enhancements for Placement App
// Add this script before the closing </body> tag

// Pull to Refresh
let pullStartY = 0;
let pullDistance = 0;
let isPulling = false;
let currentBatch = null;

document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0 && currentData.length > 0) {
        pullStartY = e.touches[0].clientY;
        isPulling = true;
    }
});

document.addEventListener('touchmove', (e) => {
    if (!isPulling) return;
    pullDistance = e.touches[0].clientY - pullStartY;
    if (pullDistance > 0 && pullDistance < 100) {
        e.preventDefault();
        main.style.transform = `translateY(${pullDistance * 0.5}px)`;
    }
});

document.addEventListener('touchend', async () => {
    if (isPulling && pullDistance > 60) {
        await refreshData();
    }
    isPulling = false;
    pullDistance = 0;
    main.style.transform = '';
});

async function refreshData() {
    if (!currentBatch) return;
    showToast('Refreshing data...', 'success');
    try {
        const response = await fetch(SHEET_URLS[currentBatch]);
        const csvText = await response.text();
        currentData = parseCSV(csvText);
        applyFiltersAndRender();
        showToast('Data refreshed!', 'success');
    } catch (error) {
        showToast('Failed to refresh', 'error');
    }
}

// Share Contact
async function shareContact(person) {
    if (!navigator.share) {
        showToast('Share not supported', 'error');
        return;
    }
    try {
        await navigator.share({
            title: person.name,
            text: `${person.name}\nRoll: ${person.roll}\nPhone: ${person.phone1}\nOrg: ${person.org}`,
        });
        showToast('Shared successfully!', 'success');
    } catch (err) {
        if (err.name !== 'AbortError') {
            showToast('Share failed', 'error');
        }
    }
}

// Generate vCard
function generateVCard(person) {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${person.name}
TEL;TYPE=CELL:${person.phone1}
${person.phone2 ? `TEL;TYPE=CELL:${person.phone2}` : ''}
ORG:${person.org}
NOTE:Roll No: ${person.roll}
END:VCARD`;
    
    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${person.name.replace(/\s+/g, '_')}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('vCard downloaded!', 'success');
}

// Add Share and vCard buttons to modal
function addMobileActions(person) {
    const existingActions = document.querySelector('.mobile-actions');
    if (existingActions) existingActions.remove();
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'mobile-actions';
    actionsDiv.style.cssText = 'display:flex;gap:10px;margin-top:16px;';
    
    actionsDiv.innerHTML = `
        <button class="mobile-action-btn share-btn" style="flex:1;padding:12px;border:none;border-radius:12px;background:var(--primary);color:white;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share
        </button>
        <button class="mobile-action-btn vcard-btn" style="flex:1;padding:12px;border:none;border-radius:12px;background:var(--wa-color);color:white;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;">
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            Add Contact
        </button>
    `;
    
    document.querySelector('.profile-details').appendChild(actionsDiv);
    
    document.querySelector('.share-btn').onclick = () => shareContact(person);
    document.querySelector('.vcard-btn').onclick = () => generateVCard(person);
}
