import './casinoAlert.css';

type AlertType = 'success' | 'error' | 'info';

const getIconForType = (type: AlertType) => {
  switch (type) {
    case 'success': return '✅';
    case 'error': return '❌';
    default: return 'ℹ️';
  }
};

export const showCasinoAlert = (title: string, message: string, type: AlertType = 'info'): Promise<void> => {
  return new Promise((resolve) => {
    // Check if overlay already exists and remove it to prevent duplicates
    const existing = document.getElementById('casino-alert-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'casino-alert-overlay';
    overlay.className = 'casino-alert-overlay';

    const box = document.createElement('div');
    box.className = `casino-alert-box ${type}`;

    const icon = document.createElement('div');
    icon.className = 'casino-alert-icon';
    icon.innerHTML = getIconForType(type);

    const titleEl = document.createElement('h3');
    titleEl.className = 'casino-alert-title';
    titleEl.innerText = title;

    const messageEl = document.createElement('p');
    messageEl.className = 'casino-alert-message';
    messageEl.innerText = message;

    const buttons = document.createElement('div');
    buttons.className = 'casino-alert-buttons';

    const okBtn = document.createElement('button');
    okBtn.className = 'casino-btn casino-btn-primary';
    okBtn.innerText = 'OK';
    okBtn.onclick = () => {
      overlay.remove();
      resolve();
    };

    buttons.appendChild(okBtn);
    box.appendChild(icon);
    box.appendChild(titleEl);
    box.appendChild(messageEl);
    box.appendChild(buttons);
    overlay.appendChild(box);

    document.body.appendChild(overlay);
  });
};

export const showCasinoConfirm = (title: string, message: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const existing = document.getElementById('casino-confirm-overlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'casino-confirm-overlay';
    overlay.className = 'casino-alert-overlay';

    const box = document.createElement('div');
    box.className = 'casino-alert-box info'; // default to info styling

    const icon = document.createElement('div');
    icon.className = 'casino-alert-icon';
    icon.innerHTML = '⚠️';

    const titleEl = document.createElement('h3');
    titleEl.className = 'casino-alert-title';
    titleEl.innerText = title;

    const messageEl = document.createElement('p');
    messageEl.className = 'casino-alert-message';
    messageEl.innerText = message;

    const buttons = document.createElement('div');
    buttons.className = 'casino-alert-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'casino-btn casino-btn-secondary';
    cancelBtn.innerText = 'Cancel';
    cancelBtn.onclick = () => {
      overlay.remove();
      resolve(false);
    };

    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'casino-btn casino-btn-primary';
    confirmBtn.innerText = 'Confirm';
    confirmBtn.onclick = () => {
      overlay.remove();
      resolve(true);
    };

    buttons.appendChild(cancelBtn);
    buttons.appendChild(confirmBtn);
    
    box.appendChild(icon);
    box.appendChild(titleEl);
    box.appendChild(messageEl);
    box.appendChild(buttons);
    overlay.appendChild(box);

    document.body.appendChild(overlay);
  });
};
