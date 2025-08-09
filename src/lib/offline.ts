// オフライン対応のためのユーティリティ関数

export interface OfflineScan {
  id: string;
  barcode: string;
  timestamp: number;
  product?: {
    id: string;
    title: string;
    brand: string | null;
    category: string | null;
    cover_image_url: string | null;
    description: string | null;
    weight_g: number | null;
  };
  status: 'pending' | 'synced' | 'failed';
}

export interface OfflineCartItem {
  id: string;
  productId: string;
  quantity: number;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
}

class OfflineStorage {
  private readonly SCAN_KEY = 'offline_scans';
  private readonly CART_KEY = 'offline_cart_items';

  // スキャンデータの保存
  async saveScan(scan: Omit<OfflineScan, 'id' | 'timestamp'>): Promise<string> {
    const scans = await this.getScans();
    const newScan: OfflineScan = {
      ...scan,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    scans.push(newScan);
    await this.setScans(scans);
    return newScan.id;
  }

  // スキャンデータの取得
  async getScans(): Promise<OfflineScan[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.SCAN_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline scans:', error);
      return [];
    }
  }

  // スキャンデータの更新
  async updateScan(id: string, updates: Partial<OfflineScan>): Promise<void> {
    const scans = await this.getScans();
    const index = scans.findIndex(scan => scan.id === id);
    
    if (index !== -1) {
      scans[index] = { ...scans[index], ...updates };
      await this.setScans(scans);
    }
  }

  // スキャンデータの削除
  async removeScan(id: string): Promise<void> {
    const scans = await this.getScans();
    const filteredScans = scans.filter(scan => scan.id !== id);
    await this.setScans(filteredScans);
  }

  // カートアイテムの保存
  async saveCartItem(item: Omit<OfflineCartItem, 'id' | 'timestamp'>): Promise<string> {
    const items = await this.getCartItems();
    const newItem: OfflineCartItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    
    items.push(newItem);
    await this.setCartItems(items);
    return newItem.id;
  }

  // カートアイテムの取得
  async getCartItems(): Promise<OfflineCartItem[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const data = localStorage.getItem(this.CART_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to get offline cart items:', error);
      return [];
    }
  }

  // カートアイテムの更新
  async updateCartItem(id: string, updates: Partial<OfflineCartItem>): Promise<void> {
    const items = await this.getCartItems();
    const index = items.findIndex(item => item.id === id);
    
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await this.setCartItems(items);
    }
  }

  // カートアイテムの削除
  async removeCartItem(id: string): Promise<void> {
    const items = await this.getCartItems();
    const filteredItems = items.filter(item => item.id !== id);
    await this.setCartItems(filteredItems);
  }

  // ネットワーク状態の確認
  isOnline(): boolean {
    return typeof navigator !== 'undefined' && navigator.onLine;
  }

  // オフラインデータの同期
  async syncOfflineData(): Promise<void> {
    if (!this.isOnline()) return;

    // スキャンデータの同期
    const scans = await this.getScans();
    const pendingScans = scans.filter(scan => scan.status === 'pending');
    
    for (const scan of pendingScans) {
      try {
        // スキャンデータをサーバーに送信
        const response = await fetch('/api/scan/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawBarcode: scan.barcode }),
        });

        if (response.ok) {
          await this.updateScan(scan.id, { status: 'synced' });
        } else {
          await this.updateScan(scan.id, { status: 'failed' });
        }
      } catch (error) {
        console.error('Failed to sync scan:', error);
        await this.updateScan(scan.id, { status: 'failed' });
      }
    }

    // カートアイテムの同期
    const cartItems = await this.getCartItems();
    const pendingCartItems = cartItems.filter(item => item.status === 'pending');
    
    for (const item of pendingCartItems) {
      try {
        const response = await fetch('/api/cart/items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });

        if (response.ok) {
          await this.updateCartItem(item.id, { status: 'synced' });
        } else {
          await this.updateCartItem(item.id, { status: 'failed' });
        }
      } catch (error) {
        console.error('Failed to sync cart item:', error);
        await this.updateCartItem(item.id, { status: 'failed' });
      }
    }
  }

  private async setScans(scans: OfflineScan[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.SCAN_KEY, JSON.stringify(scans));
  }

  private async setCartItems(items: OfflineCartItem[]): Promise<void> {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CART_KEY, JSON.stringify(items));
  }
}

export const offlineStorage = new OfflineStorage();
