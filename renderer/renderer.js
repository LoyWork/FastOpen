const grid = document.getElementById('grid');
const searchInput = document.getElementById('searchInput');
const statusText = document.getElementById('statusText');
const addBtn = document.getElementById('addBtn');
const contextMenu = document.getElementById('contextMenu');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const editName = document.getElementById('editName');
const editType = document.getElementById('editType');
const editPath = document.getElementById('editPath');
const editIcon = document.getElementById('editIcon');
const btnSave = document.getElementById('btnSave');
const btnCancel = document.getElementById('btnCancel');
const emojiPicker = document.getElementById('emojiPicker');
const modal = document.getElementById('modal');
const settingsBtn = document.getElementById('settingsBtn');
const settingsOverlay = document.getElementById('settingsOverlay');
const settingsModal = document.getElementById('settingsModal');
const settingsCancel = document.getElementById('settingsCancel');
const autoLaunchToggle = document.getElementById('autoLaunchToggle');
const stayVisibleToggle = document.getElementById('stayVisibleToggle');

let items = [];
let config = null;
let editingIndex = -1;
let ctxTargetIndex = -1;

const defaultIcons = {
  folder: '📁',
  file: '📄',
  url: '🌐',
};

const emojiList = [
  '📁','📂','📄','📝','📋','📌','📎','🔗','🌐','⭐',
  '🔥','💡','🚀','⚡','🎯','💻','🖥️','⌨️','🖱️','📱',
  '🎨','🎵','🎬','📷','📹','🔧','⚙️','🛠️','📦','🗂️',
  '💼','💰','📊','📈','📉','🗓️','📅','✅','❌','⚠️',
  '🔒','🔑','🏠','🏢','🏭','🌍','🌈','🎮','📚','📖',
  '🖊️','✏️','📏','📐','🔍','🔎','💬','🗨️','📨','📩',
  '🧩','🎪','🎯','🏆','🥇','💎','🔔','🎉','🎊','❤️',
  '👍','👎','💪','🤖','🧠','👁️','🗃️','📇','🗄️','📰',
];

function getIcon(item) {
  if (item.icon) return item.icon;
  return defaultIcons[item.type] || '📄';
}

function getTypeClass(item) {
  return `type-${item.type}`;
}

// === Card Creation ===

function createCard(item, index) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.index = index;
  card.addEventListener('click', () => openItem(item));
  card.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, index);
  });

  const iconDiv = document.createElement('div');
  iconDiv.className = `icon ${getTypeClass(item)}`;

  if (item.icon && /^https?:\/\//.test(item.icon)) {
    const img = document.createElement('img');
    img.src = item.icon;
    img.onerror = () => {
      img.remove();
      iconDiv.textContent = defaultIcons[item.type];
    };
    iconDiv.appendChild(img);
  } else {
    iconDiv.textContent = getIcon(item);
  }

  const nameDiv = document.createElement('div');
  nameDiv.className = 'name';
  nameDiv.textContent = item.name;
  nameDiv.title = item.name;

  card.appendChild(iconDiv);
  card.appendChild(nameDiv);
  return card;
}

// === Context Menu ===

function showContextMenu(x, y, index) {
  ctxTargetIndex = index;
  contextMenu.style.display = 'block';
  contextMenu.style.left = x + 'px';
  contextMenu.style.top = y + 'px';
}

function hideContextMenu() {
  contextMenu.style.display = 'none';
  ctxTargetIndex = -1;
}

contextMenu.querySelector('[data-action="edit"]').addEventListener('click', () => {
  openEditModal(ctxTargetIndex);
  hideContextMenu();
});

contextMenu.querySelector('[data-action="delete"]').addEventListener('click', () => {
  deleteItem(ctxTargetIndex);
  hideContextMenu();
});

document.addEventListener('click', (e) => {
  if (!contextMenu.contains(e.target)) hideContextMenu();
});

// === Modal ===

function openEditModal(index) {
  editingIndex = index;
  if (index >= 0) {
    modalTitle.textContent = '编辑入口';
    editName.value = items[index].name;
    editType.value = items[index].type;
    editPath.value = items[index].path;
    editIcon.value = items[index].icon || '';
  } else {
    modalTitle.textContent = '添加快捷入口';
    editName.value = '';
    editType.value = 'url';
    editPath.value = '';
    editIcon.value = '';
  }
  // Highlight matching emoji
  document.querySelectorAll('.emoji-opt.selected').forEach(b => b.classList.remove('selected'));
  const iconVal = editIcon.value.trim();
  if (iconVal) {
    const allBtns = emojiPicker.querySelectorAll('.emoji-opt');
    allBtns.forEach(b => { if (b.textContent === iconVal) b.classList.add('selected'); });
  }
  modalOverlay.style.display = 'flex';
  editName.focus();
}

function closeModal() {
  modalOverlay.style.display = 'none';
  editingIndex = -1;
}

// Emoji picker
function buildEmojiPicker() {
  emojiPicker.innerHTML = '';
  emojiList.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.className = 'emoji-opt';
    btn.textContent = emoji;
    btn.type = 'button';
    btn.addEventListener('click', () => {
      editIcon.value = emoji;
      document.querySelectorAll('.emoji-opt.selected').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
    emojiPicker.appendChild(btn);
  });
}
buildEmojiPicker();

// Sync emoji picker selection when typing in the icon field
editIcon.addEventListener('input', () => {
  const val = editIcon.value.trim();
  document.querySelectorAll('.emoji-opt.selected').forEach(b => b.classList.remove('selected'));
  if (val) {
    const match = emojiPicker.querySelector(`.emoji-opt[data-emoji="${val}"]`);
    // check by text content
    const allBtns = emojiPicker.querySelectorAll('.emoji-opt');
    allBtns.forEach(b => { if (b.textContent === val) b.classList.add('selected'); });
  }
});

btnCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

modal.addEventListener('submit', async (event) => {
  event.preventDefault();
  const name = editName.value.trim();
  const type = editType.value;
  const path = editPath.value.trim();
  const icon = editIcon.value.trim();

  if (!name) { statusText.textContent = '请输入名称'; return; }
  if (!path) { statusText.textContent = '请输入路径'; return; }

  const item = { name, type, path };
  if (icon) item.icon = icon;

  const wasEditing = editingIndex >= 0;
  if (wasEditing) {
    items[editingIndex] = item;
  } else {
    items.push(item);
  }

  config.items = items;
  try {
    await window.electronAPI.saveConfig(config);
    closeModal();
    renderGrid(searchInput.value);
    statusText.textContent = wasEditing ? '已更新' : '已添加';
    setTimeout(() => { statusText.textContent = `${items.length} 个入口`; }, 1500);
  } catch (error) {
    statusText.textContent = `保存失败: ${error.message}`;
  }
});

addBtn.addEventListener('click', () => openEditModal(-1));

// === Delete ===

function deleteItem(index) {
  if (index < 0 || index >= items.length) return;
  items.splice(index, 1);
  config.items = items;
  window.electronAPI.saveConfig(config).then(() => {
    renderGrid(searchInput.value);
    statusText.textContent = '已删除';
    setTimeout(() => { statusText.textContent = `${items.length} 个入口`; }, 1500);
  });
}

// === Open Item ===

async function openItem(item) {
  const result = await window.electronAPI.openItem(item);
  if (!result.success) {
    statusText.textContent = `打开失败: ${result.error}`;
    setTimeout(() => { statusText.textContent = ''; }, 3000);
  }
}

// === Render Grid ===

function renderGrid(filterText) {
  grid.innerHTML = '';
  const term = (filterText || '').toLowerCase().trim();

  const filtered = term
    ? items.filter((item) => item.name.toLowerCase().includes(term))
    : items;

  if (filtered.length === 0) {
    statusText.textContent = term ? '无匹配结果' : '点击右上角 + 添加入口';
  } else {
    statusText.textContent = `${filtered.length} 个入口`;
  }

  filtered.forEach((item) => {
    const realIndex = items.indexOf(item);
    grid.appendChild(createCard(item, realIndex));
  });
}

// === Init ===

searchInput.addEventListener('input', () => {
  renderGrid(searchInput.value);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (modalOverlay.style.display === 'flex') {
      closeModal();
    } else if (settingsOverlay.style.display === 'flex') {
      closeSettings();
    } else {
      window.electronAPI.hideWindow();
    }
  }
});

window.electronAPI.onWindowShown(() => {
  searchInput.focus();
  searchInput.select();
});

// === Settings ===

settingsBtn.addEventListener('click', () => {
  autoLaunchToggle.checked = Boolean(config.settings?.autoLaunch);
  stayVisibleToggle.checked = Boolean(config.settings?.stayVisible);
  settingsOverlay.style.display = 'flex';
});

function closeSettings() {
  settingsOverlay.style.display = 'none';
}

settingsCancel.addEventListener('click', closeSettings);
settingsOverlay.addEventListener('click', (event) => {
  if (event.target === settingsOverlay) closeSettings();
});

settingsModal.addEventListener('submit', async (event) => {
  event.preventDefault();
  const settings = await window.electronAPI.saveSettings({
    autoLaunch: autoLaunchToggle.checked,
    stayVisible: stayVisibleToggle.checked,
  });
  config.settings = settings;
  closeSettings();
  statusText.textContent = '设置已保存';
  setTimeout(() => renderGrid(searchInput.value), 1500);
});

window.electronAPI.getConfig().then((cfg) => {
  config = cfg;
  items = config.items || [];
  config.settings = config.settings || {};
  renderGrid();
});
