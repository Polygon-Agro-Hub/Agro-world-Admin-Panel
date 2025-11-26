// custom-url-serializer.ts
import { DefaultUrlSerializer, UrlSerializer, UrlTree } from '@angular/router';
import { RouteEncryptionService } from './route-encryption.service';

export class CustomUrlSerializer implements UrlSerializer {
  private defaultSerializer = new DefaultUrlSerializer();
  private encryptionService = new RouteEncryptionService();

  parse(url: string): UrlTree {
    // Decrypt the URL before parsing
    const decryptedUrl = this.decryptUrl(url);
    return this.defaultSerializer.parse(decryptedUrl);
  }

  serialize(tree: UrlTree): string {
    // Serialize first, then encrypt
    const url = this.defaultSerializer.serialize(tree);
    return this.encryptUrl(url);
  }

  private encryptUrl(url: string): string {
    if (!url || url === '/' || url === '') return url;
    
    const parts = url.split('?');
    const pathPart = parts[0];
    const queryPart = parts[1];
    
    // Split path into segments
    const segments = pathPart.split('/').filter(s => s);
    
    // Encrypt each segment
    const encryptedSegments = segments.map(segment => {
      // Don't encrypt parameter segments (starting with :)
      if (segment.startsWith(':')) return segment;
      return this.encryptionService.encryptRoute(segment);
    });
    
    // Encrypt query parameters if they exist
    let encryptedQuery = '';
    if (queryPart) {
      encryptedQuery = '?enc=' + this.encryptionService.encryptRoute(queryPart);
    }
    
    return '/' + encryptedSegments.join('/') + encryptedQuery;
  }

  private decryptUrl(url: string): string {
    if (!url || url === '/' || url === '') return url;
    
    const parts = url.split('?');
    const pathPart = parts[0];
    const queryPart = parts[1];
    
    // Split path into segments
    const segments = pathPart.split('/').filter(s => s);
    
    // Decrypt each segment
    const decryptedSegments = segments.map(segment => {
      // Check if segment looks encrypted (contains URL-safe base64 characters)
      if (this.isEncrypted(segment)) {
        const decrypted = this.encryptionService.decryptRoute(segment);
        return decrypted || segment; // Fallback to original if decryption fails
      }
      return segment; // Return as-is if not encrypted
    });
    
    // Decrypt query parameters if they exist
    let decryptedQuery = '';
    if (queryPart) {
      // Check if query params are encrypted (start with 'enc=')
      if (queryPart.startsWith('enc=')) {
        const encryptedParams = queryPart.substring(4); // Remove 'enc='
        const decrypted = this.encryptionService.decryptRoute(encryptedParams);
        decryptedQuery = decrypted ? '?' + decrypted : '?' + queryPart;
      } else {
        // Query params are not encrypted, return as-is
        decryptedQuery = '?' + queryPart;
      }
    }
    
    return '/' + decryptedSegments.join('/') + decryptedQuery;
  }

  private isEncrypted(segment: string): boolean {
    // Encrypted strings will contain URL-safe base64 characters
    // They typically contain hyphens, underscores, and tildes (our URL-safe replacements)
    // and will be longer than typical route names
    return segment.length > 20 && /[~_-]/.test(segment);
  }
}