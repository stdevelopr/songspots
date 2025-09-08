import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Renders a React component to HTML string for use with Leaflet divIcon
 * This creates a temporary DOM element, renders the component, extracts the HTML, and cleans up
 */
export function renderComponentToHTML(component: React.ReactElement): Promise<string> {
  return new Promise((resolve) => {
    // Create a temporary container
    const container = document.createElement('div');
    const root = createRoot(container);
    
    // Render the component
    root.render(component);
    
    // Use setTimeout to ensure React has finished rendering
    setTimeout(() => {
      const html = container.innerHTML;
      root.unmount();
      resolve(html);
    }, 0);
  });
}

/**
 * Synchronous version using React 18's flushSync for immediate rendering
 */
export function renderComponentToHTMLSync(component: React.ReactElement): string {
  try {
    // Import flushSync dynamically to handle cases where it's not available
    const { flushSync } = require('react-dom');
    
    const container = document.createElement('div');
    const root = createRoot(container);
    
    let html = '';
    
    // Use flushSync to force synchronous rendering
    flushSync(() => {
      root.render(component);
    });
    
    html = container.innerHTML;
    
    // Clean up
    flushSync(() => {
      root.unmount();
    });
    
    return html;
  } catch (error) {
    console.warn('React sync rendering failed:', error);
    return '';
  }
}