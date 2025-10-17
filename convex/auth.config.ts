const domain = process.env.CLERK_JWT_ISSUER_DOMAIN;

if (!domain) {
  throw new Error(
    "CLERK_JWT_ISSUER_DOMAIN is not set in Convex environment.\n" +
      "Find it: Clerk Dashboard → API Keys → Show API URLs → Frontend API URL\n" +
      "Set it: npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-domain>\n" +
      "Example: https://your-app-12.clerk.accounts.dev"
  );
}

export default {
  providers: [
    {
      domain,
      applicationID: "convex",
    },
  ],
};
