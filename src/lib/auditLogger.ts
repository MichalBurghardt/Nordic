import { NextRequest } from 'next/server';
import Audit from '@/models/Audit';
import mongoose from 'mongoose';

export interface AuditLogData {
  userId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'REGISTER' | 'PASSWORD_RESET' | 'EMAIL_VERIFY' | 'ACCESS_DENIED' | 'SYSTEM_ACTION';
  resource: string;
  resourceId?: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    field?: string;
    details?: Record<string, { before: unknown; after: unknown }>;
  };
  details?: string;
  req?: NextRequest;
}

export class AuditLogger {
  /**
   * Tworzy wpis w audit log
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      const auditData = {
        userId: new mongoose.Types.ObjectId(data.userId),
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId ? new mongoose.Types.ObjectId(data.resourceId) : undefined,
        changes: data.changes,
        details: data.details,
        timestamp: new Date(),
        ipAddress: data.req ? this.extractIP(data.req) : undefined,
        userAgent: data.req ? data.req.headers.get('user-agent') || undefined : undefined,
      };

      await Audit.create(auditData);
    } catch (error) {
      // Logujemy błąd ale nie przerywamy głównej operacji
      console.error('Failed to create audit log:', error);
    }
  }

  /**
   * Loguje operację CREATE
   */
  static async logCreate(
    userId: string,
    resource: string,
    resourceId: string,
    newData: Record<string, unknown>,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'CREATE',
      resource,
      resourceId,
      changes: {
        after: newData,
      },
      details: details || `Utworzono nowy ${resource}`,
      req,
    });
  }

  /**
   * Loguje operację UPDATE
   */
  static async logUpdate(
    userId: string,
    resource: string,
    resourceId: string,
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    const detailedChanges = this.getDetailedChanges(oldData, newData);
    const changedFieldNames = Object.keys(detailedChanges);
    
    await this.log({
      userId,
      action: 'UPDATE',
      resource,
      resourceId,
      changes: {
        details: detailedChanges,
        field: changedFieldNames.join(', '),
      },
      details: details || `Zaktualizowano ${resource}. Zmienione pola: ${changedFieldNames.join(', ')}`,
      req,
    });
  }

  /**
   * Loguje operację DELETE
   */
  static async logDelete(
    userId: string,
    resource: string,
    resourceId: string,
    deletedData: Record<string, unknown>,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'DELETE',
      resource,
      resourceId,
      changes: {
        before: deletedData,
      },
      details: details || `Usunięto ${resource}`,
      req,
    });
  }

  /**
   * Loguje login użytkownika
   */
  static async logLogin(
    userId: string,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'LOGIN',
      resource: 'User',
      details: details || 'Użytkownik zalogował się do systemu',
      req,
    });
  }

  /**
   * Loguje logout użytkownika
   */
  static async logLogout(
    userId: string,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'LOGOUT',
      resource: 'User',
      details: details || 'Użytkownik wylogował się z systemu',
      req,
    });
  }

  /**
   * Loguje rejestrację nowego użytkownika
   */
  static async logRegister(
    userId: string,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'REGISTER',
      resource: 'User',
      details: details || 'Nowy użytkownik zarejestrował się w systemie',
      req,
    });
  }

  /**
   * Loguje próbę resetowania hasła
   */
  static async logPasswordReset(
    userId: string,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'PASSWORD_RESET',
      resource: 'User',
      details: details || 'Użytkownik zresetował hasło',
      req,
    });
  }

  /**
   * Loguje odmowę dostępu
   */
  static async logAccessDenied(
    userId: string,
    resource: string,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'ACCESS_DENIED',
      resource,
      details: details || `Odmówiono dostępu do zasobu: ${resource}`,
      req,
    });
  }

  /**
   * Loguje akcje systemowe
   */
  static async logSystemAction(
    userId: string,
    resource: string,
    req?: NextRequest,
    details?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'SYSTEM_ACTION',
      resource,
      details: details || `Akcja systemowa na zasobie: ${resource}`,
      req,
    });
  }

  /**
   * Ekstraktuje IP z requestu
   */
  private static extractIP(req: NextRequest): string | undefined {
    const forwarded = req.headers.get('x-forwarded-for');
    const real = req.headers.get('x-real-ip');
    
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    if (real) {
      return real;
    }
    
    return undefined;
  }

  /**
   * Porównuje obiekty i zwraca listę zmienionych pól
   */
  private static getChangedFields(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ): string[] {
    const changedFields: string[] = [];
    
    // Sprawdź wszystkie klucze z nowych danych
    for (const key in newData) {
      if (oldData[key] !== newData[key]) {
        changedFields.push(key);
      }
    }
    
    // Sprawdź czy jakieś pola zostały usunięte
    for (const key in oldData) {
      if (!(key in newData)) {
        changedFields.push(key);
      }
    }
    
    return changedFields;
  }

  /**
   * Porównuje obiekty i zwraca szczegółowe zmiany tylko dla zmienionych pól
   */
  private static getDetailedChanges(
    oldData: Record<string, unknown>,
    newData: Record<string, unknown>
  ): Record<string, { before: unknown; after: unknown }> {
    const changes: Record<string, { before: unknown; after: unknown }> = {};
    
    // Porównaj wszystkie pola z nowych danych
    for (const key in newData) {
      if (this.isValueDifferent(oldData[key], newData[key])) {
        changes[key] = {
          before: this.sanitizeValue(oldData[key]),
          after: this.sanitizeValue(newData[key])
        };
      }
    }
    
    // Sprawdź czy jakieś pola zostały usunięte
    for (const key in oldData) {
      if (!(key in newData) && oldData[key] !== undefined && oldData[key] !== null) {
        changes[key] = {
          before: this.sanitizeValue(oldData[key]),
          after: null
        };
      }
    }
    
    return changes;
  }

  /**
   * Sprawdza czy dwie wartości są różne (uwzględnia daty, obiekty, itp.)
   */
  private static isValueDifferent(oldValue: unknown, newValue: unknown): boolean {
    // Jeśli to daty, porównaj jako stringi
    if (oldValue instanceof Date && newValue instanceof Date) {
      return oldValue.getTime() !== newValue.getTime();
    }
    
    // Jeśli jedna wartość to data a druga string
    if (oldValue instanceof Date && typeof newValue === 'string') {
      return oldValue.toISOString() !== new Date(newValue).toISOString();
    }
    
    if (typeof oldValue === 'string' && newValue instanceof Date) {
      return new Date(oldValue).toISOString() !== newValue.toISOString();
    }
    
    // Dla obiektów porównaj JSON
    if (typeof oldValue === 'object' && typeof newValue === 'object' && oldValue !== null && newValue !== null) {
      return JSON.stringify(oldValue) !== JSON.stringify(newValue);
    }
    
    // Standardowe porównanie
    return oldValue !== newValue;
  }

  /**
   * Sanitizuje pojedynczą wartość
   */
  private static sanitizeValue(value: unknown): unknown {
    if (typeof value === 'object' && value !== null) {
      return this.sanitizeData(value as Record<string, unknown>);
    }
    return value;
  }

  /**
   * Czyści wrażliwe dane przed zapisem do audit log
   */
  static sanitizeData(data: Record<string, unknown>): Record<string, unknown> {
    const sensitive = ['password', 'token', 'secret', 'key'];
    const cleaned = { ...data };
    
    for (const field of sensitive) {
      if (field in cleaned) {
        cleaned[field] = '[REDACTED]';
      }
    }
    
    return cleaned;
  }
}
