import type { Storage } from "redux-persist";

const isClient = typeof window !== "undefined";

let storage: Storage;

if (isClient) {

  storage = require("redux-persist/lib/storage").default;
} else {

  storage = {
    getItem: async (_key: string) => null,
    setItem: async (_key: string, _value: string) => {},
    removeItem: async (_key: string) => {},
  };
}

export default storage;
