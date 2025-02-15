// indexedDB cache
export class Collection {
    constructor(
        master: Database,
        collection: string,
        keyPath: string | string[]
    ) {
        this.#master = master
        this.#collection = collection
        this.#keyPath = keyPath
    }
    #master
    #collection
    #keyPath

    get collection() {
        return this.#collection
    }
    get keyPath() {
        return this.#keyPath
    }

    async transaction<T>(
        handler: (store: IDBObjectStore) => Promise<IDBRequest>,
        mode?: Parameters<typeof Database.prototype.transaction>[2]
    ) {
        return this.#master.transaction<T>(
            this.#collection,
            async store => {
                const request = await handler(store)
                return new Promise((resolve, reject) => {
                    request.addEventListener('error', e => reject(e))
                    request.addEventListener('success', () =>
                        resolve(request.result)
                    )
                })
            },
            mode
        )
    }

    async get<T>(key: IDBValidKey | IDBKeyRange, index = '') {
        return this.transaction<T>(async store =>
            (index ? store.index(index) : store).get(key)
        )
    }

    async put<T>(data: T) {
        return this.transaction(
            async store => store.put(data),
            'readwrite'
        ).then(() => true)
    }

    async clear() {
        return this.transaction(async store => store.clear(), 'readwrite').then(
            () => true
        )
    }
}

export interface Options {
    dbName: string
    version: number
    collections: {
        collection: string
        keyPath: string | string[]
    }[]
}

export class Database {
    constructor({ dbName, version, collections }: Options) {
        this.#dbName = dbName
        this.#version = version

        for (const { collection, keyPath } of collections) {
            this.#c.set(collection, new Collection(this, collection, keyPath))
        }
        this.#collectionProxy = new Proxy(this.#c, {
            get: (target, prop) => {
                if (typeof prop !== 'string') return null
                return target.get(prop)
            },
        })
    }

    #dbName
    #version
    #c = new Map<string, Collection>()
    #db: IDBDatabase | null = null
    #collectionProxy

    get collections() {
        return this.#collectionProxy
    }
    get coll() {
        return this.#collectionProxy
    }

    async init() {
        this.#db = await new Promise((resolve, reject) => {
            const request = window.indexedDB.open(this.#dbName, this.#version)
            request.addEventListener('error', () => reject(request.error))
            request.addEventListener('success', () => resolve(request.result))
            request.addEventListener('upgradeneeded', () => {
                for (const c of this.#c.values()) {
                    const { collection, keyPath } = c
                    if (request.result.objectStoreNames.contains(collection))
                        continue
                    request.result.createObjectStore(collection, {
                        keyPath,
                    })
                }
            })
        })
        return this
    }

    async transaction<T>(
        collection: string,
        handler: (store: IDBObjectStore) => Promise<T>,
        mode: 'readonly' | 'readwrite' = 'readonly'
    ) {
        return new Promise<T | null>((resolve, reject) => {
            if (!this.#db) throw new Error('DB not initialized')
            const transaction = this.#db.transaction(collection, mode)
            const store = transaction.objectStore(collection)
            let result: T | null = null
            handler(store).then(d => (result = d))
            transaction.addEventListener('error', e => reject(e))
            transaction.addEventListener('complete', () => resolve(result))
        })
    }

    async get<T>(
        collection: string,
        key: Parameters<typeof Collection.prototype.get>[0],
        index?: Parameters<typeof Collection.prototype.get>[1]
    ) {
        return this.#c.get(collection)!.get<T>(key, index)
    }

    async put<T>(collection: string, data: T) {
        return this.#c.get(collection)!.put(data)
    }

    async clear(collection: string) {
        return this.#c.get(collection)!.clear()
    }

    async clearAll() {
        for (const c of this.#c.values()) await c.clear()
        return true
    }
}

const database = new Database({
    dbName: 'deadline',
    version: 2,
    collections: [
        {
            collection: 'global',
            keyPath: ['key'],
        },
        {
            collection: 'questions',
            keyPath: ['country', 'age', 'sex', 'version'],
        },
    ],
})

export async function init() {
    await database.init()
}

export { database }
export default database
