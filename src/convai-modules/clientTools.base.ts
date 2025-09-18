/**
 * Universal Base Client Tools for ElevenLabs ConvAI
 * 
 * This module provides domain-agnostic client tools that work on any website,
 * handling common operations like navigation, form interactions, UI controls,
 * and accessibility features. These base tools can be used directly or extended
 * with domain-specific functionality.
 * 
 * @module convai/clientTools.base
 */

import { z } from 'zod';
import { validate, schemas } from './validators';
import { NavigateFunction } from 'react-router-dom';

// ==============================
// Types
// ==============================

/**
 * Navigation parameters
 */
export interface NavigateParams {
  /** Path to navigate to */
  path: string;
  /** Replace current history entry instead of pushing new one */
  replace?: boolean;
  /** State to pass to the new location */
  state?: any;
}

/**
 * Scroll parameters
 */
export interface ScrollParams {
  /** ID of element to scroll to */
  elementId?: string;
  /** CSS selector of element to scroll to */
  selector?: string;
  /** X position to scroll to */
  x?: number;
  /** Y position to scroll to */
  y?: number;
  /** Smooth scrolling behavior */
  smooth?: boolean;
}

/**
 * Form field parameters
 */
export interface FormFieldParams {
  /** ID of the form */
  formId: string;
  /** Form data as key-value pairs */
  data: Record<string, any>;
  /** Whether to submit the form after filling */
  submit?: boolean;
}

/**
 * Form submission parameters
 */
export interface FormSubmitParams {
  /** ID of the form to submit */
  formId: string;
  /** Validate form before submission */
  validate?: boolean;
}

/**
 * Search parameters
 */
export interface SearchParams {
  /** Search query */
  query: string;
  /** ID of search input element */
  searchInputId?: string;
  /** CSS selector for search input */
  searchInputSelector?: string;
  /** ID of search form */
  searchFormId?: string;
}

/**
 * Modal parameters
 */
export interface ModalParams {
  /** ID of modal to open/close */
  modalId: string;
}

/**
 * Notification parameters
 */
export interface NotificationParams {
  /** Notification message */
  message: string;
  /** Notification type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Notification title */
  title?: string;
  /** Auto-close duration in milliseconds */
  duration?: number;
}

/**
 * Speak text parameters
 */
export interface SpeakTextParams {
  /** Text to speak */
  text: string;
  /** Speech rate (0.1 to 10) */
  rate?: number;
  /** Speech pitch (0 to 2) */
  pitch?: number;
  /** Speech volume (0 to 1) */
  volume?: number;
  /** Voice name to use */
  voice?: string;
}

/**
 * Copy to clipboard parameters
 */
export interface CopyToClipboardParams {
  /** Text to copy */
  text: string;
  /** Show success notification */
  showNotification?: boolean;
}

/**
 * Dependencies required by base tools
 */
export interface BaseToolDependencies {
  /** Navigation function (from react-router or similar) */
  navigate: NavigateFunction;
}

// ==============================
// Validation Schemas
// ==============================

/**
 * Navigation parameters schema
 */
const navigateParamsSchema = z.object({
  path: z.string().min(1, 'Path is required'),
  replace: z.boolean().optional(),
  state: z.any().optional(),
});

/**
 * Scroll parameters schema
 */
const scrollParamsSchema = z.object({
  elementId: z.string().optional(),
  selector: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  smooth: z.boolean().optional().default(true),
}).refine(data => {
  // At least one of elementId, selector, or x/y must be provided
  return data.elementId !== undefined || 
         data.selector !== undefined || 
         (data.x !== undefined || data.y !== undefined);
}, {
  message: 'At least one of elementId, selector, or x/y must be provided',
});

/**
 * Form field parameters schema
 */
const formFieldParamsSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  data: z.record(z.any()),
  submit: z.boolean().optional().default(false),
});

/**
 * Form submission parameters schema
 */
const formSubmitParamsSchema = z.object({
  formId: z.string().min(1, 'Form ID is required'),
  validate: z.boolean().optional().default(true),
});

/**
 * Search parameters schema
 */
const searchParamsSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  searchInputId: z.string().optional(),
  searchInputSelector: z.string().optional(),
  searchFormId: z.string().optional(),
});

/**
 * Modal parameters schema
 */
const modalParamsSchema = z.object({
  modalId: z.string().min(1, 'Modal ID is required'),
});

/**
 * Notification parameters schema
 */
const notificationParamsSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  type: z.enum(['info', 'success', 'warning', 'error']).optional().default('info'),
  title: z.string().optional(),
  duration: z.number().positive().optional().default(3000),
});

/**
 * Speak text parameters schema
 */
const speakTextParamsSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  rate: z.number().min(0.1).max(10).optional().default(1),
  pitch: z.number().min(0).max(2).optional().default(1),
  volume: z.number().min(0).max(1).optional().default(1),
  voice: z.string().optional(),
});

/**
 * Copy to clipboard parameters schema
 */
const copyToClipboardParamsSchema = z.object({
  text: z.string().min(1, 'Text is required'),
  showNotification: z.boolean().optional().default(true),
});

// ==============================
// Helper Functions
// ==============================

/**
 * Find an element by ID or selector
 * 
 * @param idOrSelector Element ID or CSS selector
 * @returns Element or null if not found
 */
function findElement(idOrSelector: string): HTMLElement | null {
  // Try by ID first
  let element = document.getElementById(idOrSelector);
  
  // If not found, try by selector
  if (!element) {
    try {
      element = document.querySelector(idOrSelector) as HTMLElement;
    } catch (error) {
      console.error(`Invalid selector: ${idOrSelector}`);
    }
  }
  
  return element;
}

/**
 * Dispatch a custom event
 * 
 * @param eventName Event name
 * @param detail Event detail
 */
function dispatchCustomEvent(eventName: string, detail: any = {}): void {
  try {
    const event = new CustomEvent(eventName, { detail, bubbles: true });
    window.dispatchEvent(event);
  } catch (error) {
    console.error(`Error dispatching event "${eventName}":`, error);
  }
}

/**
 * Get form element and validate it exists
 * 
 * @param formId Form ID
 * @returns Form element
 * @throws Error if form not found
 */
function getFormElement(formId: string): HTMLFormElement {
  const form = document.getElementById(formId) as HTMLFormElement;
  
  if (!form) {
    throw new Error(`Form with ID "${formId}" not found`);
  }
  
  if (form.tagName.toLowerCase() !== 'form') {
    throw new Error(`Element with ID "${formId}" is not a form`);
  }
  
  return form;
}

/**
 * Fill a form field
 * 
 * @param field Form field element
 * @param value Field value
 */
function fillFormField(field: HTMLElement, value: any): void {
  if (field instanceof HTMLInputElement) {
    if (field.type === 'checkbox' || field.type === 'radio') {
      field.checked = Boolean(value);
    } else {
      field.value = String(value);
    }
    
    // Dispatch input event to trigger any listeners
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (field instanceof HTMLSelectElement) {
    field.value = String(value);
    field.dispatchEvent(new Event('change', { bubbles: true }));
  } else if (field instanceof HTMLTextAreaElement) {
    field.value = String(value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
  }
}

/**
 * Find a search input element
 * 
 * @param params Search parameters
 * @returns Search input element or null if not found
 */
function findSearchInput(params: SearchParams): HTMLInputElement | null {
  let searchInput: HTMLInputElement | null = null;
  
  // Try by ID
  if (params.searchInputId) {
    searchInput = document.getElementById(params.searchInputId) as HTMLInputElement;
  }
  
  // Try by selector
  if (!searchInput && params.searchInputSelector) {
    try {
      searchInput = document.querySelector(params.searchInputSelector) as HTMLInputElement;
    } catch (error) {
      console.error(`Invalid selector: ${params.searchInputSelector}`);
    }
  }
  
  // Try by form ID
  if (!searchInput && params.searchFormId) {
    const form = document.getElementById(params.searchFormId) as HTMLFormElement;
    if (form) {
      searchInput = form.querySelector('input[type="search"], input[type="text"]') as HTMLInputElement;
    }
  }
  
  // Try common search input selectors
  if (!searchInput) {
    const commonSelectors = [
      'input[type="search"]',
      'input[name="q"]',
      'input[name="query"]',
      'input[name="search"]',
      'input[placeholder*="search" i]',
      'input[aria-label*="search" i]',
    ];
    
    for (const selector of commonSelectors) {
      searchInput = document.querySelector(selector) as HTMLInputElement;
      if (searchInput) break;
    }
  }
  
  return searchInput;
}

/**
 * Show a notification
 * 
 * @param params Notification parameters
 */
function showNotification(params: NotificationParams): void {
  // Try to use existing notification system
  // 1. Check for toast libraries
  const libraries = [
    // Check for toast libraries
    { global: 'toast', fn: (p: NotificationParams) => (window as any).toast[p.type || 'info'](p.message, { title: p.title }) },
    { global: 'toastr', fn: (p: NotificationParams) => (window as any).toastr[p.type || 'info'](p.message, p.title) },
    { global: 'Toastify', fn: (p: NotificationParams) => (window as any).Toastify({ text: p.title ? `${p.title}: ${p.message}` : p.message }).showToast() },
    { global: 'Swal', fn: (p: NotificationParams) => (window as any).Swal.fire(p.title || '', p.message, p.type) },
    // Check for UI frameworks
    { global: 'bootstrap', fn: (p: NotificationParams) => new (window as any).bootstrap.Toast(document.createElement('div')).show() },
  ];
  
  for (const lib of libraries) {
    if (typeof window !== 'undefined' && (window as any)[lib.global]) {
      try {
        lib.fn(params);
        return;
      } catch (error) {
        console.error(`Error using ${lib.global} for notification:`, error);
      }
    }
  }
  
  // Fallback: Dispatch a custom event for the application to handle
  dispatchCustomEvent('show-notification', params);
  
  // Last resort: Create a simple notification element
  if (typeof document !== 'undefined') {
    const notificationElement = document.createElement('div');
    notificationElement.style.position = 'fixed';
    notificationElement.style.bottom = '20px';
    notificationElement.style.right = '20px';
    notificationElement.style.padding = '10px 20px';
    notificationElement.style.borderRadius = '4px';
    notificationElement.style.backgroundColor = params.type === 'error' ? '#f44336' : 
                                               params.type === 'warning' ? '#ff9800' : 
                                               params.type === 'success' ? '#4caf50' : '#2196f3';
    notificationElement.style.color = 'white';
    notificationElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notificationElement.style.zIndex = '9999';
    notificationElement.style.maxWidth = '300px';
    notificationElement.style.wordBreak = 'break-word';
    
    if (params.title) {
      const titleElement = document.createElement('div');
      titleElement.style.fontWeight = 'bold';
      titleElement.style.marginBottom = '5px';
      titleElement.textContent = params.title;
      notificationElement.appendChild(titleElement);
    }
    
    const messageElement = document.createElement('div');
    messageElement.textContent = params.message;
    notificationElement.appendChild(messageElement);
    
    document.body.appendChild(notificationElement);
    
    // Remove after duration
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.parentNode.removeChild(notificationElement);
      }
    }, params.duration);
  }
}

// ==============================
// Base Client Tools
// ==============================

/**
 * Create base client tools
 * 
 * @param deps Dependencies required by the tools
 * @returns Object containing all base client tools
 */
export function createBaseTools({ navigate }: BaseToolDependencies) {
  return {
    /**
     * Navigate to a page
     * 
     * @param params Navigation parameters
     * @returns Success message
     */
    navigateToPage: (params: NavigateParams): string => {
      validate(navigateParamsSchema, params);
      
      navigate(params.path, {
        replace: params.replace,
        state: params.state,
      });
      
      return `Navigated to ${params.path}`;
    },
    
    /**
     * Go back in browser history
     * 
     * @returns Success message
     */
    goBack: (): string => {
      window.history.back();
      return 'Navigated back';
    },
    
    /**
     * Go forward in browser history
     * 
     * @returns Success message
     */
    goForward: (): string => {
      window.history.forward();
      return 'Navigated forward';
    },
    
    /**
     * Reload the current page
     * 
     * @param params Reload parameters
     * @returns Success message
     */
    reloadPage: (params: { forceCacheRefresh?: boolean } = {}): string => {
      window.location.reload(params.forceCacheRefresh);
      return 'Reloading page';
    },
    
    /**
     * Scroll to an element or position
     * 
     * @param params Scroll parameters
     * @returns Success message
     */
    scrollToElement: (params: ScrollParams): string => {
      validate(scrollParamsSchema, params);
      
      // Determine scroll target
      if (params.elementId || params.selector) {
        const selector = params.elementId ? `#${params.elementId}` : params.selector!;
        const element = document.querySelector(selector);
        
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }
        
        // Scroll to element
        element.scrollIntoView({
          behavior: params.smooth ? 'smooth' : 'auto',
          block: 'start',
        });
        
        return `Scrolled to ${params.elementId ? `element with ID "${params.elementId}"` : `element matching "${params.selector}"`}`;
      } else {
        // Scroll to position
        window.scrollTo({
          left: params.x !== undefined ? params.x : window.scrollX,
          top: params.y !== undefined ? params.y : window.scrollY,
          behavior: params.smooth ? 'smooth' : 'auto',
        });
        
        return `Scrolled to position ${params.x !== undefined ? `x: ${params.x}` : ''}${params.y !== undefined ? `${params.x !== undefined ? ', ' : ''}y: ${params.y}` : ''}`;
      }
    },
    
    /**
     * Fill form fields
     * 
     * @param params Form field parameters
     * @returns Success message
     */
    fillForm: (params: FormFieldParams): string => {
      validate(formFieldParamsSchema, params);
      
      const form = getFormElement(params.formId);
      
      // Fill form fields
      for (const [name, value] of Object.entries(params.data)) {
        // Try by name attribute
        let fields = form.querySelectorAll(`[name="${name}"]`);
        
        // If not found, try by ID
        if (fields.length === 0) {
          const fieldById = document.getElementById(name);
          if (fieldById) {
            fields = [fieldById];
          }
        }
        
        // Fill each matching field
        fields.forEach(field => {
          fillFormField(field as HTMLElement, value);
        });
      }
      
      // Submit form if requested
      if (params.submit) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
      
      return `Filled form ${params.formId}${params.submit ? ' and submitted' : ''}`;
    },
    
    /**
     * Submit a form
     * 
     * @param params Form submission parameters
     * @returns Success message
     */
    submitForm: (params: FormSubmitParams): string => {
      validate(formSubmitParamsSchema, params);
      
      const form = getFormElement(params.formId);
      
      // Validate form if requested
      if (params.validate) {
        // Use form's native validation if available
        if (typeof form.reportValidity === 'function') {
          const isValid = form.reportValidity();
          if (!isValid) {
            throw new Error(`Form validation failed for ${params.formId}`);
          }
        }
      }
      
      // Submit the form
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      
      return `Submitted form ${params.formId}`;
    },
    
    /**
     * Trigger a search
     * 
     * @param params Search parameters
     * @returns Success message
     */
    triggerSearch: (params: SearchParams): string => {
      validate(searchParamsSchema, params);
      
      // Find search input
      const searchInput = findSearchInput(params);
      
      if (!searchInput) {
        throw new Error('Search input not found');
      }
      
      // Fill search input
      searchInput.value = params.query;
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));
      searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Find the form containing the search input
      const form = searchInput.closest('form');
      
      // Submit the form if found
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        return `Searched for "${params.query}"`;
      }
      
      // If no form, try to trigger search programmatically
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      
      return `Searched for "${params.query}"`;
    },
    
    /**
     * Toggle theme between light and dark
     * 
     * @returns Success message
     */
    toggleTheme: (): string => {
      // Try different theme implementations
      
      // 1. Check for data-theme attribute on html or body
      const html = document.documentElement;
      const body = document.body;
      
      if (html.hasAttribute('data-theme')) {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
        return `Switched to ${newTheme} theme`;
      }
      
      if (body.hasAttribute('data-theme')) {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        return `Switched to ${newTheme} theme`;
      }
      
      // 2. Check for class-based themes
      const isDark = html.classList.contains('dark') || body.classList.contains('dark');
      
      if (html.classList.contains('dark') || html.classList.contains('light')) {
        html.classList.toggle('dark');
        html.classList.toggle('light');
        return `Switched to ${isDark ? 'light' : 'dark'} theme`;
      }
      
      if (body.classList.contains('dark') || body.classList.contains('light')) {
        body.classList.toggle('dark');
        body.classList.toggle('light');
        return `Switched to ${isDark ? 'light' : 'dark'} theme`;
      }
      
      // 3. Try adding/removing dark class (common in Tailwind)
      if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        return 'Switched to light theme';
      } else {
        html.classList.add('dark');
        return 'Switched to dark theme';
      }
      
      // 4. Dispatch a custom event for the application to handle
      dispatchCustomEvent('toggle-theme');
      
      return 'Toggled theme';
    },
    
    /**
     * Open a modal
     * 
     * @param params Modal parameters
     * @returns Success message
     */
    openModal: (params: ModalParams): string => {
      validate(modalParamsSchema, params);
      
      const modal = document.getElementById(params.modalId);
      
      if (!modal) {
        throw new Error(`Modal with ID "${params.modalId}" not found`);
      }
      
      // Try different modal implementations
      
      // 1. Bootstrap modal
      if (typeof (window as any).bootstrap !== 'undefined') {
        try {
          const bootstrapModal = new (window as any).bootstrap.Modal(modal);
          bootstrapModal.show();
          return `Opened modal ${params.modalId}`;
        } catch (error) {
          console.error('Error opening Bootstrap modal:', error);
        }
      }
      
      // 2. jQuery UI dialog
      if (typeof (window as any).jQuery !== 'undefined') {
        try {
          (window as any).jQuery(`#${params.modalId}`).dialog('open');
          return `Opened modal ${params.modalId}`;
        } catch (error) {
          // Not a jQuery UI dialog
        }
      }
      
      // 3. Custom modal implementation
      // Add display block and aria-hidden=false
      modal.style.display = 'block';
      modal.setAttribute('aria-hidden', 'false');
      
      // Add modal-open class to body (common convention)
      document.body.classList.add('modal-open');
      
      // Dispatch a custom event for the application to handle
      dispatchCustomEvent('modal-open', { modalId: params.modalId });
      
      return `Opened modal ${params.modalId}`;
    },
    
    /**
     * Close a modal
     * 
     * @param params Modal parameters
     * @returns Success message
     */
    closeModal: (params: ModalParams): string => {
      validate(modalParamsSchema, params);
      
      const modal = document.getElementById(params.modalId);
      
      if (!modal) {
        throw new Error(`Modal with ID "${params.modalId}" not found`);
      }
      
      // Try different modal implementations
      
      // 1. Bootstrap modal
      if (typeof (window as any).bootstrap !== 'undefined') {
        try {
          const bootstrapModal = (window as any).bootstrap.Modal.getInstance(modal);
          if (bootstrapModal) {
            bootstrapModal.hide();
            return `Closed modal ${params.modalId}`;
          }
        } catch (error) {
          console.error('Error closing Bootstrap modal:', error);
        }
      }
      
      // 2. jQuery UI dialog
      if (typeof (window as any).jQuery !== 'undefined') {
        try {
          (window as any).jQuery(`#${params.modalId}`).dialog('close');
          return `Closed modal ${params.modalId}`;
        } catch (error) {
          // Not a jQuery UI dialog
        }
      }
      
      // 3. Custom modal implementation
      // Set display none and aria-hidden=true
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden', 'true');
      
      // Remove modal-open class from body
      document.body.classList.remove('modal-open');
      
      // Dispatch a custom event for the application to handle
      dispatchCustomEvent('modal-close', { modalId: params.modalId });
      
      return `Closed modal ${params.modalId}`;
    },
    
    /**
     * Show a notification
     * 
     * @param params Notification parameters
     * @returns Success message
     */
    showNotification: (params: NotificationParams): string => {
      validate(notificationParamsSchema, params);
      
      showNotification(params);
      
      return `Showed ${params.type} notification: ${params.message}`;
    },
    
    /**
     * Speak text using browser's speech synthesis
     * 
     * @param params Speak text parameters
     * @returns Success message
     */
    speakText: (params: SpeakTextParams): string => {
      validate(speakTextParamsSchema, params);
      
      // Check if speech synthesis is supported
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        throw new Error('Speech synthesis not supported in this browser');
      }
      
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(params.text);
      
      // Set parameters
      utterance.rate = params.rate || 1;
      utterance.pitch = params.pitch || 1;
      utterance.volume = params.volume || 1;
      
      // Set voice if specified
      if (params.voice) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find(v => v.name === params.voice);
        if (voice) {
          utterance.voice = voice;
        }
      }
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      return `Speaking: "${params.text}"`;
    },
    
    /**
     * Copy text to clipboard
     * 
     * @param params Copy to clipboard parameters
     * @returns Success message
     */
    copyToClipboard: async (params: CopyToClipboardParams): Promise<string> => {
      validate(copyToClipboardParamsSchema, params);
      
      try {
        // Use Clipboard API if available
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(params.text);
        } else {
          // Fallback for older browsers
          const textarea = document.createElement('textarea');
          textarea.value = params.text;
          textarea.style.position = 'fixed';
          textarea.style.opacity = '0';
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        }
        
        // Show notification if requested
        if (params.showNotification) {
          showNotification({
            message: 'Text copied to clipboard',
            type: 'success',
            duration: 2000,
          });
        }
        
        return 'Copied text to clipboard';
      } catch (error) {
        throw new Error(`Failed to copy text: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    /**
     * Focus an element
     * 
     * @param params Focus parameters
     * @returns Success message
     */
    focusElement: (params: { elementId: string } | { selector: string }): string => {
      const selector = 'elementId' in params ? `#${params.elementId}` : params.selector;
      
      try {
        const element = document.querySelector(selector) as HTMLElement;
        
        if (!element) {
          throw new Error(`Element not found: ${selector}`);
        }
        
        // Focus the element
        element.focus();
        
        return `Focused element ${selector}`;
      } catch (error) {
        throw new Error(`Failed to focus element: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
  };
}

/**
 * Export a factory function that creates the base tools
 * with just the navigate function for simpler usage
 */
export function baseTools({ navigate }: { navigate: NavigateFunction }) {
  return createBaseTools({ navigate });
}

export default baseTools;
