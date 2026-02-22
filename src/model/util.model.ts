const DEFAULT_OPTIONS: any = {
  timestamps: true,
  toJSON: {
    transform: (_: any, ret: any) => {
      delete ret._id;
      delete ret.__v;
    },
  },
};

export default DEFAULT_OPTIONS;
