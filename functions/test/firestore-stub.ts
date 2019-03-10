export default {
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
