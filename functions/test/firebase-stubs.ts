export const firestoreDb = {};
export const firestore = {
  collection(rootCollection: string) {
    return {
      doc(rootDoc: string) {
        return {
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
                  get() {
                    return {
                      exists: true,
                      data:
                        firestoreDb[
                          `${rootCollection}/${rootDoc}/${collection}/${doc}`
                        ],
                    };
                  },
                };
              },
            };
          },
        };
      },
    };
  },
} as any;

export const storage = {
  bucket() {
    return {
      file(name) {
        return {
          delete: jest.fn().mockImplementation(async () => {}),
        };
      },
    };
  },
};
