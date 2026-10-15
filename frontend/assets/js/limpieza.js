// Limpieza limitada a SistemaPedidos: no borra datos de otras aplicaciones.
export function clearPrototype(local = localStorage, session = sessionStorage) {
  for (const storage of [local, session]) {
    const keys = [];
    for (let i = 0; i < storage.length; i++) keys.push(storage.key(i));
    for (const key of keys)
      if (key?.startsWith("sistemaPedidos:")) storage.removeItem(key);
  }
}
