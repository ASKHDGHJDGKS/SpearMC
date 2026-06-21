const ownerButton = document.getElementById('ownerButton');
const ownerModal = document.getElementById('ownerModal');
const ownerSubmit = document.getElementById('ownerSubmit');
const ownerCancel = document.getElementById('ownerCancel');
const ownerCodeInput = document.getElementById('ownerCode');
const ownerMessage = document.getElementById('ownerMessage');
const applicationForm = document.getElementById('applicationForm');
const formMessage = document.getElementById('formMessage');
const ownerArea = document.getElementById('ownerArea');
const ownerNotice = document.getElementById('ownerNotice');
const applicationList = document.getElementById('applicationList');
const STORAGE_KEY = 'spearMcApplications';
const encodedOwnerCode = 'NTY1MQ==';
const ownerAuthKey = 'spearMcOwnerAccess';

function getOwnerCode() {
  return atob(encodedOwnerCode);
}

function isOwnerAuthorized() {
  return sessionStorage.getItem(ownerAuthKey) === 'true';
}

function setOwnerAuthorized(value) {
  sessionStorage.setItem(ownerAuthKey, value ? 'true' : 'false');
}

function loadApplications() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveApplications(applications) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
}

function renderApplications() {
  if (!isOwnerAuthorized()) {
    applicationList.innerHTML = '';
    return;
  }

  const applications = loadApplications();
  if (!applications.length) {
    applicationList.innerHTML = '<p class="no-applications">No applications submitted yet.</p>';
    return;
  }

  applicationList.innerHTML = applications
    .map((app, index) => `
      <div class="application-card">
        <h4>Application #${index + 1}: ${app.discord}</h4>
        <p><strong>Discord Username:</strong> ${app.discord}</p>
        <p><strong>Minecraft IGN:</strong> ${app.ign}</p>
        <p><strong>Why should you be admin?</strong> ${app.reason}</p>
        <p><strong>Why do you think that you can get admin?</strong> ${app.strength}</p>
        <p><strong>Anything else?</strong> ${app.extra || 'No additional comments.'}</p>
      </div>
    `)
    .join('');
}

function updateOwnerView() {
  if (isOwnerAuthorized()) {
    ownerArea.classList.remove('hidden');
    ownerNotice.textContent = 'Owner access enabled. Submitted applications are visible.';
    ownerNotice.style.color = '#a5d6a7';
    renderApplications();
  } else {
    ownerArea.classList.add('hidden');
    ownerNotice.textContent = 'Owner access required to view applications.';
    ownerNotice.style.color = '#cfd8dc';
  }
}

updateOwnerView();

ownerButton.addEventListener('click', () => {
  ownerModal.classList.remove('hidden');
  ownerMessage.textContent = '';
  ownerCodeInput.value = '';
  ownerCodeInput.focus();
});

ownerCancel.addEventListener('click', () => {
  ownerModal.classList.add('hidden');
});

ownerSubmit.addEventListener('click', () => {
  const code = ownerCodeInput.value.trim();
  if (code === getOwnerCode()) {
    setOwnerAuthorized(true);
    ownerMessage.style.color = '#a5d6a7';
    ownerMessage.textContent = 'Access granted. Welcome, owner!';
    updateOwnerView();
    setTimeout(() => {
      ownerModal.classList.add('hidden');
      ownerMessage.textContent = '';
    }, 1000);
  } else {
    ownerMessage.style.color = '#ff8a80';
    ownerMessage.textContent = 'Incorrect code. Please try again.';
  }
});

applicationForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const discord = document.getElementById('discord').value.trim();
  const ign = document.getElementById('ign').value.trim();
  const reason = document.getElementById('reason').value.trim();
  const strength = document.getElementById('strength').value.trim();
  const extra = document.getElementById('extra').value.trim();

  if (!discord || !ign || !reason || !strength) {
    formMessage.style.color = '#ff8a80';
    formMessage.textContent = 'Please fill in all required fields before submitting.';
    return;
  }

  const applications = loadApplications();
  applications.push({ discord, ign, reason, strength, extra, submittedAt: new Date().toISOString() });
  saveApplications(applications);
  renderApplications();

  formMessage.style.color = '#a5d6a7';
  formMessage.textContent = 'Application submitted successfully! Thank you for applying.';
  applicationForm.reset();
});
