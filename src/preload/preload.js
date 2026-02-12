const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('talkingPoint', {
  getBounds: () => ipcRenderer.invoke('get-bounds'),
  setBounds: (bounds) => ipcRenderer.invoke('set-bounds', bounds),
  hideWindow: () => ipcRenderer.invoke('hide-window'),
  showWindow: () => ipcRenderer.invoke('show-window'),
  notesLoad: () => ipcRenderer.invoke('notes-load'),
  notesSave: (text) => ipcRenderer.invoke('notes-save', text),
  onToggleEditMode: (fn) => {
    ipcRenderer.on('toggle-edit-mode', fn);
  },
  offToggleEditMode: (fn) => {
    ipcRenderer.removeListener('toggle-edit-mode', fn);
  },
});
