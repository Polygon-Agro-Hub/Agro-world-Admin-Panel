import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class RouteEncryptionService {
  private readonly SECRET_KEY = 'ddsdsdslkdsdiwpdiwd2e29eu2idh39hd93hjx93hxj93h9c39hn3cv93cnc339n'; // Change this to a secure key
  
  // Encrypt route path
  encryptRoute(route: string): string {
    if (!route || route === '') return '';
    try {
      const encrypted = CryptoJS.AES.encrypt(route, this.SECRET_KEY).toString();
      // Make URL-safe by replacing special characters
      return this.makeUrlSafe(encrypted);
    } catch (error) {
      console.error('Encryption error:', error);
      return route; // Return original if encryption fails
    }
  }

  // Decrypt route path
  decryptRoute(encryptedRoute: string): string {
    if (!encryptedRoute || encryptedRoute === '') return '';
    try {
      const urlRestored = this.restoreFromUrlSafe(encryptedRoute);
      const decrypted = CryptoJS.AES.decrypt(urlRestored, this.SECRET_KEY);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      
      // If decryption results in empty string, it likely wasn't encrypted
      if (!result) {
        return encryptedRoute; // Return original
      }
      
      return result;
    } catch (error) {
      // Silently return original string if decryption fails
      return encryptedRoute;
    }
  }

  // Make encrypted string URL-safe
  private makeUrlSafe(str: string): string {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '~');
  }

  // Restore URL-safe string to original format
  private restoreFromUrlSafe(str: string): string {
    return str.replace(/-/g, '+').replace(/_/g, '/').replace(/~/g, '=');
  }
}