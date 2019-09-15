export let firestoreDb = {};
export const updateFn = jest.fn();

// TODO full stub structure
export function rootCollectionRef(rootCollection: string) {
  return {
    doc(rootDoc: string) {
      return {
        get() {
          return {
            exists: !!firestoreDb[`${rootCollection}/${rootDoc}`],
            data: () => firestoreDb[`${rootCollection}/${rootDoc}`],
          };
        },
        collection(collection: string) {
          return {
            doc(doc: string) {
              return {
                set(data: string) {
                  firestoreDb[
                    `${rootCollection}/${rootDoc}/${collection}/${doc}`
                  ] = data;
                  return data;
                },
                update: updateFn,
                get() {
                  const got =
                    firestoreDb[
                      `${rootCollection}/${rootDoc}/${collection}/${doc}`
                    ];
                  return {
                    exists: !!got,
                    data: () => got,
                  };
                },
              };
            },
          };
        },
      };
    },
  };
}
export const firestore = {
  collection(rootCollection: string) {
    return rootCollectionRef(rootCollection);
  },
  clear() {
    firestoreDb = {};
  },
} as any;

export const storageOperation = jest.fn().mockResolvedValue(true);
const ok = {};
export const storage = {
  bucket(bucket?: string) {
    return {
      file(file: string) {
        return {
          delete() {
            storageOperation({
              bucket,
              file,
              type: 'delete',
            });
            return [ok];
          },
          move(destination: string) {
            storageOperation({
              bucket,
              file,
              type: 'move',
              destination,
            });
            return [ok];
          },
          bucket,
          name: file,
        };
      },
    };
  },
};
