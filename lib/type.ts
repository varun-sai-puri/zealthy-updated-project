export type FormValues = {
    AboutMe: { bio: string };
    Address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      zip: string;
    };
    Birthdate: { date: string };
  };