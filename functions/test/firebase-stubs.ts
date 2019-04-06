export const firestore = {
  collection(c) {
    return {
      doc(d) {
        return {
          collection(c) {
            return {
              doc(d) {
                return {
                  set(data) {
                    return data;
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
