import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'chat-theme';

/** Manages light/dark theme with localStorage persistence. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly theme = signal<ThemeMode>('light');

  constructor() {
    this.applyTheme(this.resolveInitialTheme());
  }

  toggle(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: ThemeMode): void {
    this.theme.set(theme);
    this.applyTheme(theme);

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  private resolveInitialTheme(): ThemeMode {
    if (!isPlatformBrowser(this.platformId)) {
      return 'light';
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }
}
