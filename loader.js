// loader.js

window.loadItemFile = async function loadItemFile(file) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Error loading file: ${file}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to load ${file}:`, error);
    return [];
  }
};