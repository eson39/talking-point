const viewMode = document.getElementById('view-mode');
const editMode = document.getElementById('edit-mode');
const notesDisplay = document.getElementById('notes-display');
const notesEditor = document.getElementById('notes-editor');
const btnDone = document.getElementById('btn-done');

async function loadNotes() {
  if (!window.talkingPoint?.notesLoad) return '';
  try {
    const raw = await window.talkingPoint.notesLoad();
    return raw != null ? raw : '';
  } catch {
    return '';
  }
}

async function saveNotes(text) {
  if (!window.talkingPoint?.notesSave) return;
  try {
    await window.talkingPoint.notesSave(text);
  } catch (_) {}
}

async function setEditMode(editing) {
  if (editing) {
    viewMode.classList.add('hidden');
    editMode.classList.remove('hidden');
    notesEditor.value = await loadNotes();
    notesEditor.focus();
  } else {
    const text = notesEditor.value;
    await saveNotes(text);
    notesDisplay.textContent = text || 'No notes yet. Press ⌘E to add bullet points or meeting notes.';
    editMode.classList.add('hidden');
    viewMode.classList.remove('hidden');
  }
}

(async () => {
  const initial = await loadNotes();
  notesDisplay.textContent = initial || 'No notes yet. Press ⌘E to add bullet points or meeting notes.';
})();

btnDone.addEventListener('click', () => setEditMode(false));

notesEditor.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    e.preventDefault();
    setEditMode(false);
  }
});

if (window.talkingPoint) {
  window.talkingPoint.onToggleEditMode(() => {
    const isEditing = !editMode.classList.contains('hidden');
    setEditMode(!isEditing);
  });
}
